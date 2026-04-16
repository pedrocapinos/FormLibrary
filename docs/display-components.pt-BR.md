# Componentes de Exibição
[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/display-components.md)

## GenericTableComponent

Tabela de dados baseada em CDK com ordenação, paginação, seleção de linhas, reordenação de colunas e exportação.

```html
<generic-table
  [columns]="columns"
  [data]="employees"
  [pageSize]="10"
  [selectable]="true"
  [reorderableColumns]="true"
  (rowClick)="onRowClick($event)"
  (selectionChange)="onSelectionChange($event)">
</generic-table>
```

| Input | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `columns` | `ColumnDefinition<T>[]` | `[]` | Definições das colunas |
| `data` | `T[]` | `[]` | Dados das linhas |
| `pageSize` | `number \| undefined` | `undefined` | Linhas por página; `undefined` desabilita paginação |
| `showActions` | `boolean` | `true` | Exibe a toolbar de exportar/copiar |
| `exportFilename` | `string` | `'export'` | Nome base do arquivo para exportações |
| `selectable` | `boolean` | `false` | Habilita seleção de linhas por checkbox |
| `selectionKey` | `keyof T \| ((row: T) => unknown)` | `'id'` | Nome de propriedade ou função que retorna uma identidade estável para cada linha. Usado para preservar a seleção entre re-buscas de `data` (a re-busca retorna novas referências de objeto; a seleção casa por chave, não por referência). |
| `reorderableColumns` | `boolean` | `false` | Habilita arrastar para reordenar colunas |
| `filterForm` | `FormGroup` | — | Formulário de filtro cujos valores ativos são exibidos na barra de filtros do rodapé |
| `filterConfig` | `Record<string, ActiveFilterConfig>` | — | Objeto de configuração para filtros ativos |
| `showColumnPicker` | `boolean` | `false` | Exibe um dropdown de visibilidade de colunas na toolbar |

| Output | Descrição |
|--------|-----------|
| `rowClick` | Emite a linha clicada |
| `selectionChange` | Emite o array de seleção atual |

**Recursos:**
- Clicar no cabeçalho das colunas para ordenar (alterna asc/desc)
- Navegação de páginas com controles de ir-para-página
- Selecionar linhas individuais ou todas; filtrar para exibir apenas selecionadas
- Arrastar colunas para reordenar
- Exportar para **CSV**, **XLSX**, **PDF**
- Copiar tabela para a área de transferência
- Imprimir tabela
- Fixar colunas à borda esquerda com `sticky: true` na definição da coluna. Colunas sticky devem usar uma `width` explícita em `Npx` (ex.: `'120px'`) — `%`, `rem` e `auto` não permitem calcular os offsets à esquerda e geram um aviso no console.
- Alternar visibilidade de coluna via dropdown seletor de colunas

**Linhas do rodapé:**
- **Linha de totais** — renderizada como linha `<tfoot>` quando qualquer coluna tem `calculateTotal: true`; soma todos os valores em `sortedBase` (todas as páginas, não apenas a visível) e formata o resultado usando o próprio `formatter` da coluna. Apenas visível quando há dados.
- **Barra de filtros ativos** — uma faixa estilizada abaixo da tabela que exibe quais filtros foram aplicados, como chips `Rótulo: valor`. Coletada automaticamente de `filterForm` sempre que `data` muda. Apenas visível quando há filtros ativos.

**Layout da toolbar:**
- Os botões de exportar/copiar ficam sempre fixados à direita da toolbar.
- Quando linhas estão selecionadas, um indicador "X selected" e um toggle "Show selected only" aparecem à esquerda, empurrando os botões de exportar mas sem deslocar a tabela.

---

## GenericHeaderComponent

Cabeçalho de página consistente com título, subtítulo opcional, botão de voltar opcional e um slot de conteúdo para botões de ação.

```html
<generic-header title="Employees" [showBackButton]="true" (backClick)="onBack()">
  <button class="btn btn-primary" (click)="onNew()">New Employee</button>
</generic-header>
```

| Input | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `title` | `string` | obrigatório | Título da página |
| `subtitle` | `string` | — | Subtítulo opcional |
| `showBackButton` | `boolean` | `false` | Exibe botão de seta para voltar |

| Output | Descrição |
|--------|-----------|
| `backClick` | Emite quando o botão de voltar é clicado |

---

## ListStateComponent

Renderiza um entre três estados-placeholder para páginas de lista: barra de carregamento, dica de "consulta não executada" (antes da primeira busca) ou resultado vazio. Usado pelos componentes de lista de entidades para manter a mensageria de estado consistente entre páginas.

```html
<list-state kind="no-query" />
<list-state kind="loading" loadingLabel="Buscando funcionários…" />
<list-state kind="empty" emptyTitle="Nenhum funcionário encontrado" emptyHint="Afrouxe os filtros e busque novamente." />
```

| Input | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `kind` | `'loading' \| 'no-query' \| 'empty'` | obrigatório | Qual estado renderizar |
| `loadingLabel` | `string` | `'Fetching records…'` | Rótulo exibido ao lado da barra de carregamento |
| `noQueryHint` | `string` | `'Set filters above and press Search to retrieve records.'` | Dica exibida no estado de consulta-não-executada |
| `emptyTitle` | `string` | `'No matching records'` | Título exibido no estado vazio |
| `emptyHint` | `string \| null` | `'Loosen the filters or clear them to try again.'` | Dica exibida no estado vazio; passe `null` para omitir |

---

## BatchNavComponent

Indicador compacto prev/next/posição que se exibe automaticamente sempre que `BatchOperationsService.isBatching` é `true`. Coloque no cabeçalho de uma página de edição — nenhum input necessário; o componente injeta o serviço e não renderiza nada quando não há batch ativo.

```html
<batch-nav />
```

Renderiza `currentIndex + 1 / totalCount` mais botões Anterior/Próximo cientes de habilitação que chamam `goPrev()` / `goNext()`. Veja [BatchOperationsService](#batchoperationsservice) para a mecânica de fila subjacente.

---

## Sistema de Diálogos

Sistema de diálogos consolidado construído sobre um único elemento `<dialog>` nativo colocado uma vez no `AppComponent`. Serviços de domínio específicos abrem diálogos passando um componente de conteúdo, um objeto de configuração e um callback. Componentes de conteúdo comunicam resultados via um callback `@Input() resolve` — o serviço define `instance.resolve = (data) => this.dialogHost.handleResult(data)` na função de setup, e o componente de conteúdo chama `this.resolve(data)` quando concluído.

### Arquitetura

```
Chamador (componente/guard)   Serviço de Domínio     DialogHostService      DialogHostComponent      Componente de Conteúdo
       |                           |                        |                       |                       |
       |-- service.method() -----> |                        |                       |                       |
       |                           |-- open(component, ---> |                       |                       |
       |                           |     config, setup,     |                       |                       |
       |                           |     onResult)          |-- createComponent --> |                       |
       |                           |                        |-- show(config) -----> |-- showModal() ------> |
       |                           |                        |                       |                       |
       |                           |                        |     this.resolve(data) -----------------------> |
       |                           | <-- onResult(data) --- | <-- handleResult() - |                       |
       |                           |                        |-- hide() -----------> |-- close() ----------> |
       | <-- callback/Observable - |                        |                       |-- destroy content --> |
```

1. **Chamador** invoca um método de serviço de domínio (ex.: `confirmService.confirm(options)`)
2. **Serviço de domínio** chama `DialogHostService.open()` com um componente de conteúdo, config, função de setup opcional e callback de resultado
3. **DialogHostService** cria dinamicamente o componente de conteúdo no `ViewContainerRef` do host, aplica o setup (que define `instance.resolve`) e exibe o diálogo
4. **Componente de conteúdo** faz seu trabalho (formulário, lista, etc.) e chama `this.resolve(data)` quando concluído — o callback `resolve` foi ligado a `dialogHost.handleResult()` durante o setup
5. **DialogHostService** invoca o callback `onResult`, então fecha e destrói o conteúdo

### DialogHostService

Orquestrador central. Gerencia registro do host, criação dinâmica de componente e roteamento de callbacks.

```typescript
import { DialogHostService, DialogConfig, DialogSize } from 'src/app/core/services/dialog-host.service';
```

**Tipos:**

```typescript
type DialogSize = 'sm' | 'md' | 'lg' | 'xl';

interface DialogConfig {
  title: string;
  titleIcon?: string;  // Classe do Bootstrap Icon
  size?: DialogSize;    // padrão 'md'
}
```

**API:**

| Método | Descrição |
|--------|-----------|
| `register(host)` | Chamado por `DialogHostComponent` no init |
| `unregister(host)` | Chamado por `DialogHostComponent` no destroy |
| `hasHost()` | Retorna `true` se um host está registrado |
| `open(component, config, setup?, onResult?)` | Cria o componente de conteúdo, aplica setup, exibe o diálogo |
| `handleResult(data, options?)` | Invoca o callback e fecha o diálogo. Chamado pelo callback `resolve` do componente de conteúdo (ou pelo host em `postMessage` para diálogos de iframe) |
| `handleClose()` | Limpa o callback sem invocá-lo. Chamado quando o diálogo fecha sem resultado |

### DialogHostComponent

Elemento `<dialog>` único no DOM. Colocado uma vez em `app.component.html` como `<dialog-host />`.

**Classes de tamanho:**

| Tamanho | CSS | Largura Máxima |
|---------|-----|----------------|
| `'sm'` | `dialog-sm` | 400px |
| `'md'` | (padrão) | 500px |
| `'lg'` | `dialog-lg` | 70vw |
| `'xl'` | `dialog-xl` | 90vw |

**Comportamento:**
- Escuta eventos `window.postMessage` com `type: 'dialog-result'` da mesma origem
- Usa `NgZone.run()` para garantir que a detecção de mudanças do Angular rode após o tratamento de `postMessage`
- Registra o elemento de acionamento ao abrir e restaura o foco ao fechar (passe `restoreFocus: false` nas opções do postMessage para suprimir)
- Fecha em clique no backdrop ou botão de fechar
- Destrói o outlet do componente de conteúdo ao fechar

**Acessibilidade (WCAG 2.1 AA):**
- `<dialog>` nativo com `showModal()` provê focus trapping embutido, `aria-modal` e Esc-para-fechar
- `aria-labelledby` associa o diálogo ao seu heading de título
- Conteúdo é envolvido em `role="document"` para navegação de leitor de tela
- O foco é restaurado ao elemento de acionamento no fechamento (WCAG 2.4.3 Ordem de Foco)
- Ícones decorativos incluem `aria-hidden="true"`
- Botão de fechar tem `aria-label="Close"`

### Componentes de Conteúdo

Componentes de apresentação puros que comunicam resultados via callback `@Input() resolve`. O serviço de domínio conecta `instance.resolve = (data) => this.dialogHost.handleResult(data)` durante o setup, e o componente de conteúdo chama `this.resolve(data)` quando o usuário faz uma escolha.

**Contrato do callback resolve:**

```typescript
@Input() resolve: (data: any) => void = () => {};

// Chamado quando o usuário conclui uma ação:
this.resolve(resultData);

// Para filtros ativos, um segundo argumento options opcional controla a restauração de foco:
@Input() resolve: (data: any, options?: { restoreFocus?: boolean }) => void = () => {};
```

**Componentes de conteúdo embutidos:**

| Componente | Propósito | Resolve com |
|------------|-----------|-------------|
| `ConfirmDialogContentComponent` | Confirm/Cancel com mensagem e lista de detalhes opcional | `true` ou `false` |
| `ActiveFiltersContentComponent` | Exibição de grupos de filtros com itens clicáveis | `{ action: 'filter', filter }` ou `{ action: 'tab', tabId }` |

**Diálogos de iframe:** `DialogIframeComponent` usa `window.postMessage` para comunicação cross-origin em vez do callback `resolve`, já que o conteúdo roda em um contexto de navegação separado. `DialogHostComponent` ainda escuta eventos `postMessage` para tratar esse caso.

### Criando um Novo Tipo de Diálogo

1. **Crie um componente de conteúdo** com um input `resolve`:

```typescript
@Component({
  standalone: true,
  template: `<!-- sua UI aqui -->`,
})
export class MyContentComponent {
  @Input() someData: string = '';
  @Input() resolve: (data: any) => void = () => {};

  onDone(result: any): void {
    this.resolve(result);
  }
}
```

2. **Crie um serviço de domínio** que o abra:

```typescript
@Injectable({ providedIn: 'root' })
export class MyDialogService {
  private readonly dialogHost = inject(DialogHostService);

  open(data: string): Observable<MyResult | null> {
    if (!this.dialogHost.hasHost()) return of(null);

    return new Observable((subscriber) => {
      this.dialogHost.open(
        MyContentComponent,
        { title: 'My Dialog', titleIcon: 'bi bi-gear', size: 'lg' },
        (instance) => {
          instance.someData = data;
          instance.resolve = (result: MyResult) => this.dialogHost.handleResult(result);
        },
        (result: MyResult | null) => {
          subscriber.next(result);
          subscriber.complete();
        },
      );
    });
  }
}
```

---

## ConfirmDialogService

Diálogo de confirmação orientado a serviço. Usa `DialogHostService` para abrir `ConfirmDialogContentComponent`.

**API do Serviço:**

```typescript
import { ConfirmDialogService } from 'src/app/core/services/confirm-dialog.service';

// Injete e chame — retorna Observable<boolean>
this.confirmService.confirm({
  title: 'Confirm Delete',
  titleIcon: 'bi bi-trash',
  message: 'Are you sure? This cannot be undone.',
  details: ['ID: 1', 'ID: 2'],
  confirmLabel: 'Delete',
  cancelLabel: 'Cancel',
  confirmClass: 'btn-danger',
}).subscribe(confirmed => {
  if (confirmed) { /* prosseguir */ }
});
```

**ConfirmDialogOptions:**

| Propriedade | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `title` | `string` | obrigatório | Título do diálogo |
| `titleIcon` | `string` | — | Classe do Bootstrap Icon |
| `message` | `string` | obrigatório | Texto do corpo |
| `details` | `string[]` | — | Lista opcional de itens detalhados renderizada como `<ul>` rolável abaixo da mensagem |
| `confirmLabel` | `string` | `'Confirm'` | Rótulo do botão de confirmar |
| `cancelLabel` | `string` | `'Cancel'` | Rótulo do botão de cancelar |
| `confirmClass` | `string` | `'btn-primary'` | Classe CSS do botão de confirmar |

**Uso embutido:**
- `unsavedChangesGuard` — exibe diálogo "Unsaved Changes" com botões Leave/Stay (`btn-warning`) ao navegar para fora de um form dirty
- Páginas de edição chamam `confirmService.confirm(DEFAULT_SAVE_DIALOG_CONFIG)` antes de salvar
- Páginas de edição chamam `confirmService.confirm(DEFAULT_DELETE_DIALOG_CONFIG)` antes de excluir
- **"Delete Selected"** — componentes de lista constroem um array visual `details` com todos os valores selecionados para o diálogo

**Fallback:** Quando nenhum `DialogHostComponent` está registrado (`hasHost()` retorna false), recai para `window.confirm()`.

---

## ActiveFiltersDialogService

Serviço que abre o diálogo de filtros ativos. Substitui o padrão anterior de `ActiveFiltersDialogComponent` via ViewChild — nenhuma referência de template necessária.

```typescript
import { ActiveFiltersDialogService } from 'src/app/core/services/active-filters-dialog.service';

// Em um componente de lista
this.activeFiltersService.open(this.filterForm, this.filterConfig, this.hostRef);
```

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `form` | `FormGroup` | O formulário de filtro de onde ler os valores |
| `filterConfig` | `Record<string, ActiveFilterConfig>` | Objeto de configuração definindo formatação, rótulos e agrupamento por aba |
| `container` | `ElementRef \| HTMLElement \| string` | Elemento host opcional (ou seu `id`) usado para escopar o foco após clicar em um filtro |

**Como funciona:**
- Coleta valores de filtro ativos (não vazios) do formulário usando `collectActiveFilters()`
- Agrupa filtros por `tabId` em cards; cada cabeçalho de card exibe o `tabLabel` e é clicável
- Clicar em uma entrada de filtro: alterna a aba (via `aria-controls`), foca o controle e fecha o diálogo
- Clicar em um cabeçalho de card: alterna a aba e fecha o diálogo sem focar um controle específico
- Usa `restoreFocus: false` no postMessage para que o controle de filtro focado não seja sobrescrito

### Convenção de alternância de abas

Para que a alternância automática de abas funcione, adicione `aria-controls="tab-panel-<tabId>"` em cada botão de aba e `id="tab-panel-<tabId>" role="tabpanel"` em cada painel. Tanto o diálogo quanto o `FocusOnErrorDirective` localizam o botão correspondente e o clicam programaticamente — nenhum binding de evento ou handler no pai é necessário:

```html
<button class="nav-link" (click)="activeTab = 'personal'" aria-controls="tab-panel-personal">Personal</button>
<button class="nav-link" (click)="activeTab = 'contact'"  aria-controls="tab-panel-contact">Contact</button>

<div id="tab-panel-personal" role="tabpanel" [class.d-none]="activeTab !== 'personal'">...</div>
<div id="tab-panel-contact"  role="tabpanel" [class.d-none]="activeTab !== 'contact'">...</div>
```

Páginas sem abas funcionam como antes — o diálogo exibe um card único não agrupado sem cabeçalho, e o foco funciona sem nenhum atributo `aria-controls`.

**Caminhos coringa para controles em FormArray:**

Quando o form de filtro contém um `FormArray` (ex.: números de telefone), `collectActiveFilters()` substitui índices numéricos de array por `*` para combinar com uma única entrada de config. Isso permite que uma única chave de config cubra todas as linhas:

```typescript
const FILTER_CONFIG: Record<string, ActiveFilterConfig> = {
  // phones.0.number, phones.1.number, etc. todos combinam com esta chave:
  'phones.*.number': { label: 'Phone', format: 'phone' },
  'phones.*.label':  { label: 'Phone Label' },
};
```

A regex de normalização `path.replace(/\.\d+(\.|$)/g, '.*$1')` converte `phones.0.number` em `phones.*.number` antes da consulta de config.

**Valores de filtro do tipo objeto:** Se um controle de filtro mantém um objeto não nulo (ex.: um `LookupValue`) e a config não fornece nem `formatter` nem `format`, o controle é **ignorado** em vez de ser renderizado como `"[object Object]"`. Sempre forneça um `formatter` para valores compostos:

```typescript
const FILTER_CONFIG: Record<string, ActiveFilterConfig> = {
  department: {
    label: 'Departamento',
    formatter: (v: LookupValue) => v.display ?? `#${v.id}`,
  },
};
```

---

## Diálogos de Lookup

Diálogos de lookup renderizam o componente de lista da entidade alvo diretamente dentro do diálogo usando `DialogHostService.open()` — o mesmo mecanismo usado pelos diálogos de confirmação e filtros ativos. Sem iframe, sem rota separada, sem troca de token.

**Fluxo de dados:**

```
LookupFormControl → openEntityLookup(dialogHost) → DialogHostService
    → EntityListComponent (mode='selection', renderizado direto no diálogo)
    → usuário clica numa linha → this.resolve(entity) → handleResult() → callback
← Observable → LookupFormControlComponent
```

Abridores de lookup são criados com a função fábrica `createLookupDialogOpener<TEntity>()` de `core/services/lookup-dialog.factory.ts`. A fábrica retorna uma função tipada `(dialogHost, options?) => Observable<TEntity | null>` que abre o componente de lista via `DialogHostService.open()`, define `mode = 'selection'` e conecta `instance.resolve` a `dialogHost.handleResult()` no callback de setup. Quando o usuário clica numa linha, o componente de lista chama `this.resolve(entity)`, o que dispara `handleResult()` e fecha o diálogo. Filtros e controles desabilitados são aplicados diretamente ao `filterForm` do componente no callback de setup.

**Adicionar uma nova entidade de lookup** exige dois passos:

1. Defina o abridor na pasta da feature da entidade usando a fábrica:

```typescript
// features/department/department-lookup.ts
import { createLookupDialogOpener } from '../../core/services/lookup-dialog.factory';
import { DepartmentListComponent } from './department-list.component';
import { Department } from './department.model';

export const openDepartmentLookup = createLookupDialogOpener<Department>({
  component: DepartmentListComponent,
  title: 'Select Department',
  titleIcon: 'bi bi-building',
});
```

2. Use-o no componente consumidor:

```typescript
private readonly dialogHost = inject(DialogHostService);

readonly departmentLookupFn = () =>
  openDepartmentLookup(this.dialogHost).pipe(
    map((dept) => (dept ? { id: dept.id, display: dept.name } : null)),
  );
```

A interface `LookupOptions` suporta pré-preenchimento de filtros (`filters`) e desabilitação de campos de filtro específicos (`disable`).

**Contrato para componentes de lista:** Qualquer componente de lista pode ser usado como alvo de lookup desde que possua:
- `@Input() mode: 'standalone' | 'selection'` — quando `'selection'`, oculta botões CRUD, exibe layout compacto e busca automaticamente no init
- `@Input() resolve: (data: TEntity) => void` — callback invocado quando uma linha é clicada em modo selection

---

## BatchOperationsService

Serviço que consolida operações em lote para páginas de lista e edição: navegação sequencial "Edit Selected" e "Delete Selected" com confirmação. Localizado em `core/services/batch-edit.service.ts`.

**API de Edição em Lote:**

| Membro | Tipo | Descrição |
|--------|------|-----------|
| `isBatching` | `boolean` (getter) | Se uma sessão de edição em lote está ativa |
| `currentIndex` | `number` (getter) | Índice zero-based do item atual |
| `totalCount` | `number` (getter) | Total de itens na fila |
| `currentRoute` | `any[] \| null` (getter) | O array de rota atual, ou `null` se não em batch |
| `startBatch(routes, returnUrl)` | `void` | Inicia edição em lote; navega para a primeira rota |
| `hasNext()` | `boolean` | Se há um próximo item na fila |
| `hasPrev()` | `boolean` | Se há um item anterior na fila |
| `goNext()` | `void` | Navega para o próximo item |
| `goPrev()` | `void` | Navega para o item anterior |
| `finish()` | `void` | Encerra a sessão e navega para a URL de retorno |
| `clear()` | `void` | Reseta estado interno sem navegar |

**Fluxo de Edição em Lote:**

1. **Iniciar** a partir de um componente de lista: `batchOps.startBatch(routes, '/employees')`. Isso armazena a fila e navega para a primeira entidade.
2. **Componente de edição** assina `route.paramMap` (não `snapshot`) para que o mesmo componente recarregue os dados quando o serviço navegar entre itens.
3. **Ao salvar**, chame `goNext()` se `hasNext()`, caso contrário `finish()` para retornar à lista.

**Exemplo de template (cabeçalho de navegação em batch):**

```html
@if (batchOperationsService.isBatching) {
  <span>{{ batchOperationsService.currentIndex + 1 }} of {{ batchOperationsService.totalCount }}</span>
  <button [disabled]="!batchOperationsService.hasPrev()" (click)="batchOperationsService.goPrev()">Prev</button>
  <button [disabled]="!batchOperationsService.hasNext()" (click)="batchOperationsService.goNext()">Next</button>
}
```

> **Importante:** Componentes de edição devem assinar `route.paramMap` (não ler `route.snapshot.paramMap`) para que a mesma instância de componente recarregue os dados quando o serviço navegar entre itens da fila sem destruir e recriar o componente.

**API de Exclusão em Lote:**

| Membro | Tipo | Descrição |
|--------|------|-----------|
| `deleteSelected<T>(config)` | `Observable<{ deleted: boolean; count: number }>` | Confirma e exclui os registros selecionados |

O método `deleteSelected` aceita um objeto de config:

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `items` | `T[]` | Registros selecionados (devem ter `id: number \| null`) |
| `formatDetail` | `(item: T) => string` | Formata cada item para a lista de detalhes do diálogo de confirmação |
| `deleteFn` | `(ids: number[]) => Observable<void>` | A chamada real de exclusão (ex.: `entityService.deleteMany`) |

O serviço cuida da checagem de lista vazia, truncamento de detalhes (máx. 10 itens), diálogo de confirmação e chamada a `deleteFn`. Itens com `id == null` (linhas não salvas) são filtrados **antes** do diálogo de confirmação, de modo que a contagem mostrada ao usuário sempre coincide com o número de registros efetivamente excluídos. O componente controla o que acontece após a exclusão (toast, limpeza de seleção, nova busca).

**Uso de Exclusão em Lote:**

```typescript
onDeleteSelected(): void {
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
```

## DialogIframeComponent

Renderiza um `<iframe>` em sandbox para incorporar páginas de micro-frontend externas. Cuida da comunicação cross-origin via `postMessage` para troca de token e passagem de resultados.

```html
<!-- Usado dentro de um componente de conteúdo renderizado por DialogHostService -->
<dialog-iframe
  src="https://other-app.com/item-picker"
  origin="https://other-app.com"
  [token]="auth.currentUser?.token ?? ''"
  height="600px"
  (result)="onItemPicked($event)"
  (ready)="onIframeReady()"
/>
```

| Input | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `src` | `string` | obrigatório | URL da página externa |
| `origin` | `string` | obrigatório | Origem permitida para validação de `postMessage` |
| `token` | `string` | — | Token de autenticação enviado ao iframe após ele sinalizar prontidão |
| `width` | `string` | `'100%'` | Largura do iframe |
| `height` | `string` | `'500px'` | Altura do iframe |
| `iframeTitle` | `string` | `'External content'` | Título acessível do elemento iframe |

| Output | Tipo | Descrição |
|--------|------|-----------|
| `result` | `EventEmitter<unknown>` | Emite dados do `postMessage` do iframe |
| `ready` | `EventEmitter<void>` | Emite quando o iframe sinaliza prontidão |

**Protocolo de mensagens:**

```typescript
// Iframe → Host
{ type: 'ready' }                    // iframe carregado, solicitando token
{ type: 'result', data: any }        // iframe retornando uma seleção/resultado

// Host → Iframe
{ type: 'token', token: string }     // host enviando token de autenticação
```

**Segurança:**
- `sandbox="allow-scripts allow-same-origin allow-forms"` restringe as capacidades do iframe
- Cada `postMessage` recebido é validado contra o input `origin`
- Token é enviado via `postMessage` (não por parâmetros de URL) para evitar exposição no histórico ou logs do navegador
