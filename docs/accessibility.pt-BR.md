# Acessibilidade (WCAG 2.1 AA)
[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/accessibility.md)

Todos os controles de formulário são projetados para atender à conformidade **WCAG 2.1 Nível AA**. A acessibilidade é incorporada à camada de componentes, de modo que as páginas consumidoras obtenham o comportamento correto sem esforço adicional.

## Atributos ARIA nos Controles de Formulário

Cada controle de formulário (`text-form-control`, `currency-form-control`, `date-form-control`, `code-form-control`, `phone-form-control`, `cpf-form-control`, `cnpj-form-control`, `checkbox-form-control`, `select-form-control`, `lookup-form-control`) expõe estes atributos ARIA em seu elemento interativo (`<input>` ou `<select>`):

| Atributo | Binding | Propósito |
|----------|---------|-----------|
| `aria-invalid` | `[attr.aria-invalid]="isInvalid"` | Anuncia estado inválido a leitores de tela (WCAG 3.3.1) |
| `aria-required` | `[attr.aria-required]="required"` | Indica campos obrigatórios a tecnologias assistivas |
| `aria-describedby` | `[attr.aria-describedby]="errorId"` | Associa o input à sua mensagem de erro para leitura contextual |

O input `required` está disponível em todos os controles:

```html
<text-form-control formControlName="name" label="Name" [required]="true">
</text-form-control>
```

## Vínculo de Mensagem de Erro

`ErrorMessageComponent` aceita um input `[id]` que é renderizado no elemento `<small>`. Cada controle de formulário passa seu `errorId` computado (derivado de `componentId + '-error'`) para que o `aria-describedby` do input corresponda ao `id` da mensagem de erro:

```html
<!-- DOM gerado (simplificado) -->
<input id="name-input" aria-describedby="name-input-error" aria-invalid="true" ...>
<small id="name-input-error" role="alert" aria-live="polite">Name is required</small>
```

Os atributos `role="alert"` e `aria-live="polite"` na mensagem de erro garantem que os leitores de tela anunciem os erros conforme eles aparecem sem interromper o usuário.

## Associação de Rótulos

Todos os controles de formulário usam pareamento explícito `<label for="...">` / `<input id="...">`. IDs são gerados automaticamente quando `fieldId` não é fornecido, garantindo unicidade.

## Ícones Decorativos

Ícones decorativos (ex.: calendário no `DateFormControlComponent`) incluem `aria-hidden="true"` para impedir que leitores de tela os anunciem.

## Controles de Intervalo

`RangeCurrencyFormControlComponent` envolve seus dois inputs de moeda em um container com `role="group"` e um `aria-label` computado (ex.: "Min Salary to Max Salary"), permitindo que leitores de tela anunciem a relação entre os dois campos.

## Resumo de Conformidade

| Critério WCAG | Nível | Status |
|---------------|-------|--------|
| 1.1.1 Conteúdo não textual | A | Ícones decorativos têm `aria-hidden`, botões apenas com ícone têm `aria-label` |
| 1.3.1 Informações e Relações | A | Todos os inputs possuem associação programática de rótulo (`for`/`id`) |
| 3.3.1 Identificação de Erro | A | `aria-invalid` identifica inputs com erro; o texto do erro é vinculado via `aria-describedby` |
| 3.3.2 Rótulos ou Instruções | A | Todos os inputs possuem rótulos visíveis |
| 4.1.2 Nome, Função, Valor | A | Todos os elementos interativos expõem nome acessível e função |
| 1.3.5 Identificar a Finalidade de Entrada | AA | `inputmode="numeric"` em campos de código/CPF, `inputmode="tel"` em campos de telefone |
| 2.4.3 Ordem de Foco | A | Diálogo restaura o foco ao elemento de acionamento ao fechar |
| 2.4.6 Cabeçalhos e Rótulos | AA | Rótulos são descritivos e únicos; diálogos possuem títulos com `aria-labelledby` |
| 3.3.3 Sugestão de Erro | AA | Mensagens de erro descrevem a natureza do erro |
| 3.3.4 Prevenção de Erro | AA | Diálogos de confirmação antes de salvar, excluir e sair de formulários com alterações |
