# Serviços
[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/services.md)

## SearchStateService

Armazenamento em memória chave-valor para persistir valores de formulários de filtro entre navegações. O estado é perdido ao recarregar a página.

```typescript
import { SearchStateService } from 'src/app/core/services/search-state.service';
```

```typescript
// Salvar estado do filtro antes de navegar
service.save<EmployeeFilter>('employee-filters', filterForm.value);

// Restaurar ao inicializar o componente
const saved = service.restore<EmployeeFilter>('employee-filters');
if (saved) filterForm.patchValue(saved);

// Limpar ao reset explícito
service.clear('employee-filters');
```

| Método | Descrição |
|--------|-----------|
| `save<T>(key, value)` | Armazena qualquer valor sob uma chave string |
| `restore<T>(key)` | Recupera valor armazenado, ou `null` se não encontrado |
| `clear(key)` | Remove um valor armazenado |
| `clearAll()` | Remove todos os valores armazenados (chamado por `AuthService.logout()`) |

---

## FormatService

Serviço singleton que formata valores brutos em strings de exibição. Usado por `GenericTableComponent` (formatação de coluna), `ActiveFiltersDialogService` (exibição de valor de filtro) e `collectActiveFilters()`.

```typescript
import { FormatService } from 'src/app/core/services/format.service';
```

**API:**

```typescript
service.format(value: any, type?: FormatType, options?: FormatOptions): string
```

| FormatType | Entrada de Exemplo | Saída de Exemplo | Notas |
|------------|---------------------|-------------------|-------|
| `'cpf'` | `'12345678909'` | `'123.456.789-09'` | Aplica máscara de CPF |
| `'cnpj'` | `'A1B2C3D40001G7'` | `'A1.B2C.3D4/0001-G7'` | Aplica máscara alfanumérica de CNPJ |
| `'phone'` | `'01198765432'` | `'011-98765-4321'` | Aplica máscara de telefone |
| `'date'` | `'1990-12-25'` | `'25/12/1990'` | ISO para dd/MM/yyyy |
| `'currency'` | `1250.99` | `'R$ 1.250,99'` | Usa `CurrencyPipe` do Angular |
| `'boolean'` | `true` | `'Yes'` | Rótulos configuráveis |
| `'text'` / `undefined` | `42` | `'42'` | Fallback `String(value)` |

Retorna `options.defaultFallback` (padrão `'—'`) para valores null, undefined ou vazios.

**FormatOptions:**

| Opção | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `currencyCode` | `string` | `'BRL'` | Código de moeda para o tipo `'currency'` |
| `display` | `string \| boolean` | `'symbol-narrow'` | Modo de exibição do CurrencyPipe |
| `digitsInfo` | `string` | — | Informação de dígitos do CurrencyPipe |
| `trueLabel` | `string` | `'Yes'` | Rótulo de exibição para valores `true` |
| `falseLabel` | `string` | `'No'` | Rótulo de exibição para valores `false` |
| `defaultFallback` | `string` | `'—'` | Retornado para valores vazios |

**Integração com configurações de tabela e filtro:** Tanto `ColumnDefinition` quanto `ActiveFilterConfig` suportam `format?: FormatType` e `formatOptions?: FormatOptions`, permitindo formatação declarativa sem funções `formatter` personalizadas.

---

## DebugService

Serviço singleton que provê um toggle global de debug para todos os controles de formulário. Quando ativado, cada controle exibe seu valor bruto e estado interno (dirty, touched, errors). O estado persiste entre navegações mas é resetado ao recarregar a página.

Um botão de toggle está disponível na sidebar (acima do botão Logout). O botão usa `btn-warning` quando ativo e `btn-outline-warning` quando inativo.

```typescript
import { DebugService } from 'src/app/core/services/debug.service';
```

**API:**

| Membro | Tipo | Descrição |
|--------|------|-----------|
| `enabled` | `boolean` | Se o modo debug está ativo (padrão `false`) |
| `toggle()` | `void` | Inverte o estado de debug |

Todos os controles de formulário (via `BaseFormControlComponent`) e `RangeCurrencyFormControlComponent` leem deste serviço automaticamente — nenhum binding `[debugMode]` por controle é necessário.

---

## ToastService

Serviço singleton de notificações que exibe toasts não bloqueantes com auto-dismiss e empilhamento. Fornece feedback visual para operações de salvar, excluir, exportar e em lote.

```typescript
import { ToastService } from 'src/app/core/services/toast.service';
```

**Métodos de atalho:**

```typescript
toastService.success('Employee saved successfully'); // verde, auto-dismiss em 4s
toastService.error('Failed to save');               // vermelho, fixo (dismiss manual)
toastService.warning('Unsaved changes');             // amarelo, auto-dismiss em 6s
toastService.info('Exported to CSV');                // azul, auto-dismiss em 4s
```

**Controle completo:**

```typescript
toastService.show({
  message: 'Custom toast',
  type: 'success',
  duration: 8000,       // ms; 0 = apenas dismiss manual
  dismissible: true,    // exibe botão de fechar (padrão: true)
});
```

| Método | Descrição |
|--------|-----------|
| `success(message)` | Exibe um toast de sucesso (4s) |
| `error(message)` | Exibe um toast de erro (fixo) |
| `warning(message)` | Exibe um toast de aviso (6s) |
| `info(message)` | Exibe um toast informativo (4s) |
| `show(config)` | Exibe um toast com controle completo via `ToastConfig` |
| `dismiss(id)` | Dispensa um toast manualmente |

**ToastContainerComponent** é colocado uma única vez em `AppComponent` (mesmo padrão de `<dialog-host>`). Os toasts empilham-se verticalmente no canto inferior direito. Cada toast usa `role="alert"` com `aria-live="polite"` (success/info) ou `aria-live="assertive"` (error/warning) para conformidade WCAG 2.1 AA.

**Integração embutida:**
- Páginas de edição exibem toasts de sucesso após salvar e excluir
- Páginas de lista exibem um toast de contagem após exclusão em lote (via `BatchOperationsService.deleteSelected`)
- `GenericTableComponent` exibe toasts informativos ao exportar CSV/XLSX/PDF e copiar para área de transferência

## Padrão de Exclusão em Lote

Páginas de lista consolidam a exclusão em lote através de `BatchOperationsService.deleteSelected()` — veja a seção [BatchOperationsService](./display-components.pt-BR.md#batchoperationsservice) para a API completa e exemplo de uso. O serviço trata a verificação de itens vazios, o truncamento dos detalhes (máx. 10), o diálogo de confirmação e a filtragem de IDs nulos; o chamador fornece `items`, `formatDetail` e uma `deleteFn`, e controla o comportamento pós-exclusão (toast, limpar seleção, re-pesquisar) na subscrição do resultado.
