# Diretivas
[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/directives.md)

## AutoAdvanceDirective — `[autoAdvance]`

Move o foco automaticamente para o próximo elemento de formulário quando o input atual está cheio.

```html
<input [autoAdvance]="isFull" />
```

| Input | Tipo | Descrição |
|-------|------|-----------|
| `autoAdvance` | `(el: HTMLInputElement) => boolean` | Retorna `true` quando o campo é considerado cheio |

Move o foco para o próximo elemento focável somente quando o cursor está no fim do campo, evitando interrupção durante edição no meio do campo.

---

## SelectAllOnFocusDirective — `[selectAllOnFocus]`

Seleciona todo o texto de um input quando ele recebe foco.

```html
<input selectAllOnFocus />
```

---

## UnmaskDirective — `[maskito][unmaskHandler]`

Intercepta o `ControlValueAccessor` para aplicar mascaramento e desmascaramento de forma transparente. O modelo do form control mantém o valor sem máscara; o input exibe o valor mascarado.

```html
<input [maskito]="cpfMask" [unmaskHandler]="unmaskCpf" />
```

| Input | Tipo | Descrição |
|-------|------|-----------|
| `unmaskHandler` | `(value: string) => any` | Converte o valor exibido em valor do modelo |
| `maskHandler` | `(value: any) => string` | Converte o valor do modelo em valor exibido (padrão: `maskitoTransform`) |

---

## FocusOnErrorDirective — `form[formGroup][appFocusOnError]`

No submit do formulário, marca todos os controles como touched (disparando a exibição de validação) e rola até o primeiro campo inválido dando foco nele.

```html
<form [formGroup]="form" appFocusOnError (ngSubmit)="onSubmit()">
```

Elimina a necessidade de chamadas manuais a `markAllAsTouched()` e dá ao usuário feedback claro sobre qual campo falhou.

**Suporte a abas:** se o campo inválido está dentro de um painel de aba oculto, a diretiva alterna automaticamente para essa aba antes de focar. Requer a convenção padrão de marcação de abas — veja a [Convenção de alternância de abas](./display-components.pt-BR.md#convenção-de-alternância-de-abas) na seção de Diálogo de Filtros Ativos.

**Validadores de grupo:** quando o único validador que falha está no `FormGroup` (ex.: o validador de intervalo no formulário pai) nenhum controle filho fica `ng-invalid`. A diretiva recorre ao primeiro elemento marcado com `data-group-validator` no host do componente (`RangeCurrencyFormControlComponent`, `AddressFormControlComponent`, etc.) e foca o primeiro input dentro dele.
