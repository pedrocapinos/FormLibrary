# Padrão de Entidade
[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/entity-pattern.md)

## Arquitetura: Composição sobre Herança

Componentes de páginas CRUD utilizam **composição** (serviços injetados + funções puras) em vez de herdarem de uma classe base compartilhada. Essa é uma decisão de design deliberada.

**O problema com uma classe base (`BaseCrudPage`)**

Uma classe base abstrata que agrupa navegação, autenticação, diálogos e exclusão em lote em um único pai parece conveniente — componentes filhos apenas chamam `super.can()` ou `this.confirmSave()`. Mas isso cria problemas reais:

- **Acoplamento forte** — cada componente herda todas as dependências (7+), mesmo que use apenas 2. Adicionar um método à base reflete em todos os filhos.
- **Classe base frágil** — uma mudança no pai pode quebrar silenciosamente qualquer componente filho que a estende. A cadeia de herança é um ponto único de falha.
- **Dependências opacas** — ao ler um componente, você não consegue dizer de quais serviços ele realmente depende sem rastrear a cadeia de herança.
- **Herança única** — TypeScript só permite um `extends`. Se dois comportamentos não relacionados parecerem candidatos a "classe base", você fica preso.
- **Mais difícil de testar** — mockar uma classe base significa mockar tudo que ela arrasta, mesmo para um teste que se importa com um único comportamento.

**A abordagem atual**

Comportamento compartilhado é dividido por preocupação na primitiva Angular correta:

| Preocupação | Primitiva | Por quê |
|-------------|-----------|---------|
| Rastreamento de URL de retorno | `NavigationService` (injetável) | Padrão simples set/consume para navegação de retorno à origem |
| Fila de edição em lote | `BatchOperationsService` (injetável) | Gerencia navegação sequencial pelos registros selecionados |
| Fluxo de exclusão em lote | `BatchOperationsService.deleteSelected()` | Confirmar → excluir → observable de resultado; o componente controla o que acontece depois |
| Checagens de permissão | Chamada direta a `this.auth.can()` | One-liner — um wrapper adiciona indireção sem abstração |
| Confirmação de salvar/excluir | Chamada direta a `confirmService.confirm()` | One-liner com uma constante de config compartilhada |
| Detecção de alterações não salvas | Comparação inline com `JSON.stringify` contra um snapshot `originalModel`/`originalValues` | One-liner trivial por componente — sem necessidade de helper |

**Princípio guia:** lógica com efeitos colaterais vai em serviços Angular (DI adequado, testável, ciente do ciclo de vida). Transformações puras de dados vão em funções exportadas. Wrappers finos que apenas renomeiam uma chamada de método são inlinados.

## Estrutura Recomendada de Arquivos

```
features/entity/
  entity.model.ts          # Interface (builder do formulário fica no componente)
  entity.filter.ts         # Interface de filtro
  entity.service.ts        # Operações CRUD retornando Observable<Entity>
  entity-list.component.ts # Página de busca/filtro
  entity-list.component.html
  entity-edit.component.ts # Página de criação/edição
  entity-edit.component.html
```

## Como uma Página de Lista é Composta

```typescript
@Component({ /* ... */ })
export class EmployeeListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly searchStateService = inject(SearchStateService);
  private readonly batchOps = inject(BatchOperationsService);
  private readonly navigationService = inject(NavigationService);
  private readonly toastService = inject(ToastService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formatService = inject(FormatService);

  readonly recordType: RecordType = 'employee';

  filterForm = this.buildFilterForm();
  data: Employee[] | null = null;
  selectedEmployees: Employee[] = [];
  loading = false;
  columns: ColumnDefinition<Employee>[] = [ /* ... */ ];

  can(action: Action): boolean {
    return this.auth.can(this.recordType, action);
  }

  ngOnInit() {
    const saved = this.searchStateService.restore<EmployeeSearchFilters>('/employees');
    if (saved) {
      this.filterForm.patchValue(saved);
      this.onSearch();
    }
  }

  onSearch() {
    this.searchStateService.save('/employees', this.filterForm.value);
    this.loading = true;
    this.employeeService.search(this.filterForm.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(results => {
        this.data = results;
        this.loading = false;
      });
  }

  onRowClick(employee: Employee) {
    this.navigationService.setReturnUrl('/employees');
    this.router.navigate(['/employees', employee.id]);
  }

  onNew() {
    this.navigationService.setReturnUrl('/employees');
    this.router.navigate(['/employees', 'new']);
  }

  onEditSelected() {
    const routes = this.selectedEmployees.map(s => ['/employees', s.id!]);
    this.batchOps.startBatch(routes, this.router.url);
  }

  onDeleteSelected() {
    this.batchOps
      .deleteSelected({
        items: this.selectedEmployees,
        formatDetail: (e) => `ID: ${e.id} - ${e.firstName}`,
        deleteFn: (ids) => this.employeeService.deleteMany(ids),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (!result.deleted) return;
        this.toastService.success(`${result.count} record(s) deleted`);
        this.selectedEmployees = [];
        this.onSearch();
      });
  }
}
```

```html
<generic-header title="Employees">
  <button class="btn btn-primary" (click)="onNew()">New</button>
  <button type="button" (click)="activeFiltersService.open(filterForm, filterConfig, filterFormEl)">
    Active Filters
  </button>
</generic-header>

<form [formGroup]="filterForm" #filterFormEl (ngSubmit)="onSearch()">
  <!-- controles de filtro -->
  <button type="submit">Search</button>
</form>

<generic-table [columns]="columns" [data]="data ?? []" [pageSize]="10"
  [selectable]="true" [reorderableColumns]="true"
  [filterForm]="filterForm" [filterConfig]="filterConfig"
  (rowClick)="onRowClick($event)" />
```

## Como uma Página de Edição é Composta

```typescript
@Component({ ... })
export class EmployeeEditComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly navigationService = inject(NavigationService);
  private readonly confirmService = inject(ConfirmDialogService);
  private readonly toastService = inject(ToastService);

  readonly recordType: RecordType = 'employee';
  readonly batchOperationsService = inject(BatchOperationsService); // binding de template

  form = this.buildEmployeeForm();
  isNew = true;
  saving = false;
  deleting = false;
  private returnUrl = '/employees';
  private originalModel: Employee = this.formToModel();

  can(action: Action): boolean {
    return this.auth.can(this.recordType, action);
  }

  hasUnsavedChanges(): boolean {
    return JSON.stringify(this.formToModel()) !== JSON.stringify(this.originalModel);
  }

  ngOnInit() {
    this.returnUrl = this.navigationService.consumeReturnUrl() ?? '/employees';
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const id = params.get('id');
      this.isNew = id === null || id === 'new';
      if (!this.isNew) {
        this.employeeService.getById(+id!)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(s => {
            this.form = this.buildEmployeeForm(s);
            this.originalModel = this.formToModel();
            if (!this.can('edit')) {
              this.form.disable();
            }
          });
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.confirmService.confirm(DEFAULT_SAVE_DIALOG_CONFIG)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(confirmed => {
        if (!confirmed) return;
        this.saving = true;
        this.employeeService.save(this.formToModel())
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(saved => {
            this.form = this.buildEmployeeForm(saved);
            this.originalModel = this.formToModel();
            this.toastService.success('Employee saved successfully');
            if (this.batchOperationsService.isBatching) {
              if (this.batchOperationsService.hasNext()) {
                this.batchOperationsService.goNext();
              } else {
                this.batchOperationsService.finish();
              }
              this.saving = false;
              return;
            }
            if (this.isNew) {
              this.isNew = false;
              this.router.navigate(['/employees', saved.id!], { replaceUrl: true });
            }
            this.saving = false;
          });
      });
  }

  // Achata os grupos aninhados do formulário de volta para a interface plana do modelo
  private formToModel(): Employee {
    const raw = this.form.getRawValue();
    return {
      id: raw.identity.id,
      firstName: raw.firstName,
      cpf: raw.identity.cpf,
      salary: raw.salary,
      isActive: raw.isActive ?? false,
      departmentId: raw.department?.id ?? null,
      departmentName: raw.department?.display ?? null,
      street: raw.address.street,
      city: raw.address.city,
      state: raw.address.state,
      zip: raw.address.zip,
      isPrimary: raw.address.isPrimary ?? false,
      phones: raw.phones,
    };
  }

  onBack() {
    if (this.batchOperationsService.isBatching) {
      this.batchOperationsService.finish();
      return;
    }
    this.router.navigateByUrl(this.returnUrl);
  }
}
```

```html
<form [formGroup]="form" appFocusOnError (ngSubmit)="onSubmit()">
  <div formGroupName="identity">
    <code-form-control formControlName="id" label="ID"
      [customMessages]="idMessages" [groupInvalid]="identityGroupInvalid" />
    <cpf-form-control formControlName="cpf" label="CPF"
      [groupInvalid]="identityGroupInvalid" />
    <error-message [control]="form.controls.identity" label="identification field (ID or CPF)" />
  </div>

  <text-form-control formControlName="firstName" label="First Name" />
  <currency-form-control formControlName="salary" label="Salary" />
  <checkbox-form-control formControlName="isActive" label="Active" />
  <lookup-form-control formControlName="department" label="Department"
    [lookupFn]="departmentLookupFn" [lookupByIdFn]="departmentLookupByIdFn" />

  <div formGroupName="address">
    <address-form-control />
  </div>

  <dynamic-rows [formArray]="form.controls.phones" [createRow]="createPhoneRow"
    addLabel="Add Phone" emptyMessage="No phone numbers added yet.">
    <ng-template let-group let-index="index">
      <div [formGroup]="group" class="row g-2">
        <div class="col-md-4">
          <text-form-control formControlName="label" label="Label" />
        </div>
        <div class="col-md-8">
          <phone-form-control formControlName="number" label="Number" />
        </div>
      </div>
    </ng-template>
  </dynamic-rows>
</form>
```

**Comportamento do botão Clear:** Em uma página nova, Clear reconstrói o formulário vazio (`this.form = this.buildEmployeeForm()`). Em uma página de edição, Clear reconstrói a partir do registro original (`this.form = this.buildEmployeeForm(this.originalModel)`). Reconstruir (em vez de `form.reset()`) é necessário porque `FormArray.reset()` apenas reseta os valores sem adicionar ou remover linhas — veja [comportamento de clear do DynamicRowsComponent](./core-form-controls.pt-BR.md#dynamicrowscomponent). Em ambos os casos o novo formulário é pristine, então o guard de alterações não salvas não solicita confirmação. O botão é ocultado para usuários apenas de visualização (mesmo guard `can('edit') || isNew` do Save).
