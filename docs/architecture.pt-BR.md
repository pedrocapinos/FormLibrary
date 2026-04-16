# Arquitetura
[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/architecture.md)

## Camadas

```
src/app/
├── core/                   # A biblioteca reutilizável
│   ├── components/         # Controles de formulário, tabela, cabeçalho, host de diálogo, componentes de conteúdo
│   ├── directives/         # Diretivas comportamentais
│   ├── masks/              # Definições e utilidades de máscara Maskito
│   ├── services/           # Mensagens de erro, estado de busca, host de diálogo, diálogos de domínio
│   ├── utils/              # Funções auxiliares puras (filtros ativos, foco, comparação de formulário, exportação)
│   ├── validators/         # Fábricas de validadores cruzados
│   └── types/              # Interfaces TypeScript compartilhadas
│
├── features/               # Implementações concretas de entidades
│   ├── employee/
│   ├── department/
│   ├── playground/         # Página de demonstração / explorador interativo de componentes
│   ├── login/              # Página de login
│   ├── not-found/          # Página 404
│   └── unauthorized/       # Página 403
│
└── app.*                   # Shell: roteamento, navegação, configuração
```

## Padrão de Formulário

Cada entidade define uma interface TypeScript e uma função fábrica de formulário. Formulários simples são planos, espelhando diretamente a interface da entidade. Quando múltiplos validadores cruzados coexistem no mesmo formulário, controles relacionados são agrupados em sub-grupos `FormGroup` que atuam como **fronteiras de validação** — cada validador de grupo afeta apenas o seu próprio grupo, impedindo contaminação cruzada de erros entre componentes compostos.

```typescript
// entity.model.ts — interface plana
export interface EmployeePhone {
  label: string | null;
  number: string | null;
}

export interface Employee {
  id: number | null;
  firstName: string | null;
  cpf: string | null;
  salary: number | null;
  isActive: boolean;
  departmentId: number | null;
  departmentName: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  isPrimary: boolean;
  phones: EmployeePhone[];
}
```

```typescript
// entity-edit.component.ts — formulário aninhado com escopo de validador
buildEmployeeForm(employee?: Partial<Employee>) {
  return this.fb.group({
    identity: this.fb.group({
      id: this.fb.control<number | null>(employee?.id ?? null, [
        Validators.min(0), Validators.max(9999),
      ]),
      cpf: this.fb.control<string | null>(employee?.cpf ?? null),
    }, { validators: [createAtLeastOneRequiredValidator(['id', 'cpf'])] }),
    firstName: this.fb.control<string | null>(employee?.firstName ?? null, [
      Validators.minLength(3), Validators.maxLength(100), Validators.required,
    ]),
    salary: this.fb.control<number | null>(employee?.salary ?? null),
    isActive: this.fb.control<boolean | null>(employee?.isActive ?? null),
    department: this.fb.control<LookupValue | null>(
      employee?.departmentId ? { id: employee.departmentId, display: employee.departmentName ?? null } : null,
    ),
    address: this.fb.group({
      street: this.fb.control<string | null>(employee?.street ?? null),
      city: this.fb.control<string | null>(employee?.city ?? null),
      state: this.fb.control<string | null>(employee?.state ?? null),
      zip: this.fb.control<string | null>(employee?.zip ?? null),
      isPrimary: this.fb.control<boolean>(employee?.isPrimary ?? false),
    }, { validators: [createAtLeastOneRequiredValidator(['street', 'city', 'state', 'zip'])] }),
    phones: this.fb.array((employee?.phones ?? []).map((p) => this.buildPhoneRowGroup(p))),
  }, { updateOn: 'blur' });
}
```

Quando o formato do formulário difere do formato plano do modelo, um método `formToModel()` achata os grupos aninhados de volta ao modelo:

```typescript
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
```

**Quando usar FormGroups vs formulários planos:** Se um formulário tem apenas um validador cruzado (ex.: o filtro da lista de employee com apenas um validador de range), um formulário plano é suficiente — não há risco de contaminação cruzada. FormGroups são necessários quando **múltiplos** validadores de nível de grupo coexistem e componentes compostos (como `RangeCurrencyFormControlComponent` ou `AddressFormControlComponent`) veriam os erros uns dos outros via `ControlContainer`.

Formulários de filtro seguem o mesmo padrão plano mas residem em um arquivo dedicado `entity.filter.ts`.

## Stack Tecnológico

| Área | Escolha |
|------|---------|
| Framework | Angular 17+ (componentes standalone, controle de fluxo `@if`/`@for`) |
| Formulários | Reactive Forms (tipado, Angular 14+) |
| Máscaras de entrada | [Maskito](https://maskito.dev) |
| Tabela | Angular CDK (`cdk-table`, drag-drop) |
| Estilização | Bootstrap 5 |
| Exportação XLSX | SheetJS |
| Exportação PDF | jsPDF |
