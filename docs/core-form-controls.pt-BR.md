# Controles de Formulário Principais
[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/core-form-controls.md)

Todos os controles de formulário implementam o `ControlValueAccessor` do Angular e se integram aos bindings `formControlName` e `[formControl]`.

## Hierarquia de Componentes

```
BaseFormControlComponent              ← encanamento compartilhado (ID, estado de validação, debug, NgControl)
  ├── TextFormControlComponent        ← input de texto genérico, máscara opcional
  ├── CurrencyFormControlComponent    ← formatação de moeda pt-BR
  ├── DateFormControlComponent        ← input de data dd/MM/yyyy
  ├── CodeFormControlComponent        ← códigos numéricos com preenchimento de zeros à esquerda
  ├── PhoneFormControlComponent       ← máscara de telefone (DDD-DDDDD-DDDD)
  ├── CpfFormControlComponent         ← máscara de CPF (XXX.XXX.XXX-XX)
  ├── CnpjFormControlComponent        ← máscara de CNPJ (AA.AAA.AAA/AAAA-DD)
  ├── CheckboxFormControlComponent    ← estado booleano (isChecked), valores true/false customizados
  ├── SelectFormControlComponent      ← dropdown com opções fixas
  └── LookupFormControlComponent      ← lookup por código com ID + nome de exibição, busca em diálogo
```

`RangeCurrencyFormControlComponent` e `AddressFormControlComponent` não estendem a hierarquia — são wrappers de grupo sem CVA.

## BaseFormControlComponent

A diretiva abstrata raiz compartilhada por todos os controles de formulário que participam da hierarquia de componentes. Lida com geração de ID, resolução de `NgControl`, estado de validação, modo debug e inputs comuns. **Não** impõe um pipeline de exibição de string, de modo que controles semelhantes a texto e não textuais (checkbox) possam estendê-la.

**Inputs herdados por todos os controles:**

| Input | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `fieldId` | `string` | auto-gerado | Prefixo do ID do elemento input |
| `label` | `string` | obrigatório | Rótulo do campo |
| `disabled` | `boolean` | `false` | Desabilita o controle |
| `required` | `boolean` | `false` | Marca como obrigatório (define `aria-required`) |
| `groupInvalid` | `boolean` | `false` | Propaga um erro de validação em nível de grupo |
| `customMessages` | `Partial<ErrorMessageConfig>` | — | Sobrescritas de mensagens de erro por campo |

## TextFormControlComponent

Input de texto genérico para campos de string simples (sem máscara). Aceita uma máscara Maskito opcional e função de unmask para formatação ad-hoc, mas para formatos bem conhecidos prefira os componentes de máscara dedicados (`PhoneFormControlComponent`, `CpfFormControlComponent`, `CnpjFormControlComponent`).

```html
<text-form-control formControlName="firstName" label="First Name" [maxLength]="10" />
```

| Input | Tipo | Descrição |
|-------|------|-----------|
| `mask` | `MaskitoOptions` | Máscara Maskito opcional |
| `unmask` | `(display: string) => string \| null` | Converte valor exibido em valor do modelo |
| `maxLength` | `number` | Número máximo de caracteres |

Recursos: auto-advance quando cheio, selecionar tudo ao focar.

---

## CodeFormControlComponent

Input numérico para códigos de entidade com formatação de zeros à esquerda. Comprimento e comportamento de preenchimento configuráveis.

```html
<code-form-control formControlName="id" label="Employee ID"
  [maskConfig]="{ maxLength: 4, padded: true }">
</code-form-control>
```

| Input | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `maskConfig` | `LeadingZerosMaskConfig` | `{ maxLength: 4, padded: true }` | Configuração da máscara |

- **Modo padded** (`padded: true`): Campo sempre exibe `maxLength` dígitos, preenchendo com zeros em tempo real (ex.: digitar `5` exibe `0005`).
- **Modo não padded** (`padded: false`): Sem preenchimento; zeros à esquerda são removidos; transbordamento é impedido.

Armazena o valor do modelo como `number | null` via `unmaskLeadingZeros`.

---

## PhoneFormControlComponent

Input de número de telefone com máscara fixa (`DDD-DDDDD-DDDD`, 11 dígitos). Armazena o valor do modelo como `string | null` (apenas dígitos).

```html
<phone-form-control formControlName="number" label="Phone Number" />
```

Usa `inputmode="tel"` para otimização do teclado em mobile. Recursos: auto-advance quando cheio, selecionar tudo ao focar.

---

## CpfFormControlComponent

Input de CPF com máscara fixa (`XXX.XXX.XXX-XX`, 11 dígitos). Armazena o valor do modelo como `string | null` (apenas dígitos).

```html
<cpf-form-control formControlName="cpf" label="CPF" />
```

Usa `inputmode="numeric"`. Recursos: auto-advance quando cheio, selecionar tudo ao focar.

---

## CnpjFormControlComponent

Input alfanumérico de CNPJ com máscara fixa (`AA.AAA.AAA/AAAA-DD`). Aceita letras maiúsculas (A-Z) e dígitos (0-9) nas primeiras 12 posições, apenas dígitos nas 2 últimas (dígitos verificadores). Inclui um preprocessor que força a entrada para maiúsculas.

Armazena o valor do modelo como `string | null` (apenas caracteres alfanuméricos, sem pontuação).

```html
<cnpj-form-control formControlName="cnpj" label="CNPJ" />
```

Recursos: auto-advance quando cheio, selecionar tudo ao focar.

---

## CurrencyFormControlComponent

Input de moeda formatado no estilo pt-BR (vírgula como separador decimal, ponto como separador de milhares). Precisão decimal e limites configuráveis.

```html
<currency-form-control formControlName="salary" label="Salary">
</currency-form-control>
```

| Input | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `fractionDigits` | `number` | `2` | Número de casas decimais |
| `min` | `number` | auto | Valor mínimo (padrão `-currencyMaxValue(fractionDigits)`) |
| `max` | `number` | auto | Valor máximo (padrão `currencyMaxValue(fractionDigits)`) |

Armazena o valor do modelo como `number | null`. O valor exibido `1.250,99` corresponde ao valor de modelo `1250.99`.

Quando `min` e `max` não são fornecidos, o componente deriva automaticamente os limites a partir de `fractionDigits` usando `currencyMaxValue()` — o maior valor em que cada passo decimal na precisão dada ainda mapeia para um float IEEE 754 distinto. Veja [Limites de Precisão de Ponto Flutuante](./input-masks.pt-BR.md#limites-de-precisão-de-ponto-flutuante-currencymaxvalue) na seção Máscaras de Entrada para a explicação completa.

Recursos: auto-advance quando os decimais estão preenchidos, selecionar tudo ao focar.

---

## DateFormControlComponent

Input de data com máscara dd/MM/yyyy. Armazena o valor do modelo como string ISO (`yyyy-MM-dd`) ou `null`.

```html
<date-form-control formControlName="birthDate" label="Birth Date">
</date-form-control>
```

- Exibição: `25/12/1990` — Modelo: `1990-12-25`
- Intervalo: 01/01/1900 até 31/12/2500
- Inclui um ícone de calendário no input group (apenas visual)

---

## CheckboxFormControlComponent

Checkbox com suporte a valores customizados de true/false. Estende `BaseFormControlComponent` e implementa `ControlValueAccessor` diretamente (o pipeline de exibição de string usado pelos controles textuais não se aplica a checkboxes). Integra-se com formulários reativos via `formControlName` / `[formControl]`.

```html
<checkbox-form-control
  formControlName="active"
  label="Active"
  [options]="{ trueValue: 'S', falseValue: 'N', trueLabel: 'Yes', falseLabel: 'No' }">
</checkbox-form-control>
```

| Input | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `label` | `string` | obrigatório | Rótulo do campo |
| `options` | `CheckboxOptions` | `{ trueValue: true, falseValue: false }` | Valores customizados |
| `filterHideFalsy` | `boolean` | `true` | Quando `true`, exclui o checkbox do diálogo/chips de filtros ativos enquanto desmarcado. Define um atributo `data-active-filters-hide` no elemento host, que `collectActiveFilters()` verifica para pular o controle. |

```typescript
interface CheckboxOptions {
  trueValue: any;      // Valor quando marcado
  falseValue: any;     // Valor quando desmarcado
  trueLabel?: string;  // Rótulo de exibição para estado marcado
  falseLabel?: string; // Rótulo de exibição para estado desmarcado
}
```

---

## SelectFormControlComponent

Dropdown para campos com um conjunto fixo de opções. Suporta qualquer tipo de valor primitivo (string, number, boolean). Implementa `ControlValueAccessor` — use com `formControlName` ou `[formControl]`.

```html
<select-form-control
  formControlName="gender"
  label="Gender"
  placeholder="Choose one…"
  [options]="[
    { value: 'M', label: 'Male' },
    { value: 'F', label: 'Female' }
  ]"
/>
```

| Input | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `options` | `SelectOption[]` | `[]` | Array de pares `{ value: any, label: string }` |
| `placeholder` | `string` | `'Select…'` | Texto exibido como primeira opção desabilitada quando nenhum valor está selecionado |

O input `options` é reavaliado sempre que muda, de modo que listas de opções que chegam tardiamente (ex.: carregadas de forma assíncrona após o formulário ser preenchido) resolvem corretamente o item selecionado.

```typescript
export interface SelectOption {
  value: any;
  label: string;
}
```

---

## RangeCurrencyFormControlComponent

Dois inputs de moeda lado a lado com validação cruzada de intervalo. Projetado para ser colocado dentro de um `FormGroup` que tenha um `createRangeValidator()` aplicado.

```html
<range-currency-form-control
  startControlName="salaryMin"
  endControlName="salaryMax"
  startLabel="Salary From"
  endLabel="Salary To"
  [customMessages]="{ rangeInvalid: (label, p) => p.startLabel + ' cannot exceed ' + p.endLabel }">
</range-currency-form-control>
```

| Input | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `startControlName` | `string` | obrigatório | Nome do FormControl para o valor inicial |
| `endControlName` | `string` | obrigatório | Nome do FormControl para o valor final |
| `startLabel` | `string` | `'Start'` | Rótulo do input inicial |
| `endLabel` | `string` | `'End'` | Rótulo do input final |
| `startFieldId` | `string` | — | ID do input inicial |
| `endFieldId` | `string` | — | ID do input final |
| `fractionDigits` | `number` | `2` | Número de casas decimais para ambos os inputs de moeda |
| `min` | `number` | — | Valor mínimo passado para ambos os inputs de moeda |
| `max` | `number` | — | Valor máximo passado para ambos os inputs de moeda |

Lê erros de `rangeInvalid` do `FormGroup` pai e propaga `groupInvalid` para ambos os controles filhos.

---

## AddressFormControlComponent

Componente composto que agrupa rua, CEP, cidade, estado e checkbox de primário em um fieldset reutilizável de endereço. Não implementa `ControlValueAccessor` — delega ao `FormGroup` pai via `ControlContainer` (`viewProviders`), de modo que os controles individuais se ligam diretamente aos nomes de `FormControl` do formulário pai.

```html
<address-form-control
  legend="Home Address"
  streetControlName="street"
  zipControlName="zip"
  cityControlName="city"
  stateControlName="state"
  primaryControlName="isPrimary"
/>
```

| Input | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `legend` | `string` | `'Address'` | Texto da legenda do fieldset |
| `streetControlName` | `string` | `'street'` | Nome do FormControl para o campo rua |
| `zipControlName` | `string` | `'zip'` | Nome do FormControl para o campo CEP |
| `cityControlName` | `string` | `'city'` | Nome do FormControl para o campo cidade |
| `stateControlName` | `string` | `'state'` | Nome do FormControl para o campo estado |
| `primaryControlName` | `string` | `'isPrimary'` | Nome do FormControl para o checkbox de primário |

Usa `code-form-control` com máscara padded de zeros à esquerda de 5 dígitos para o CEP, `text-form-control` para rua/cidade/estado, e `checkbox-form-control` para o flag de primário.

---

## LookupFormControlComponent

Componente CVA para seleção de entidade relacionada via diálogo ou digitando um ID diretamente. Exibe um campo de ID editável (com máscara de zeros à esquerda) e um nome de exibição readonly, com botões de busca e limpar. O valor do controle é um objeto `LookupValue` ou `null`.

```typescript
export interface LookupValue {
  id: number | null;
  display: string | null;
}
```

```html
<lookup-form-control
  fieldId="department"
  formControlName="department"
  label="Department"
  [lookupFn]="departmentLookupFn"
  [lookupByIdFn]="departmentLookupByIdFn"
  placeholder="No department selected"
/>
```

O chamador fornece um `lookupFn` (busca via diálogo) e um `lookupByIdFn` opcional (lookup por ID ao digitar):

```typescript
readonly departmentLookupFn = () =>
  this.departmentLookupService.open().pipe(
    map(dept => dept ? { id: dept.id, display: dept.name } : null),
  );

readonly departmentLookupByIdFn = (id: number): Observable<string | null> =>
  this.departmentService.getById(id).pipe(map(dept => dept?.name ?? null));
```

| Input | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `lookupFn` | `() => Observable<LookupValue \| null>` | obrigatório | Função que abre um diálogo de seleção e retorna o resultado |
| `lookupByIdFn` | `(id: number) => Observable<string \| null>` | — | Função que resolve um nome de exibição a partir de um ID. Chamada no blur do ID. |
| `placeholder` | `string` | `'No selection'` | Placeholder do input de nome de exibição |
| `idPlaceholder` | `string` | `'ID'` | Placeholder do input de ID |
| `idMaskConfig` | `LeadingZerosMaskConfig` | `{ maxLength: 4, padded: true }` | Configuração da máscara de zeros à esquerda para o input de ID |

**Integração com formulário:** O controle armazena o objeto `LookupValue` completo, portanto o pai lê os campos individuais ao montar o modelo:

```typescript
// Definição do form
department: this.fb.control<LookupValue | null>(null),

// Leitura
departmentId: raw.department?.id ?? null,
departmentName: raw.department?.display ?? null,

// Inicialização a partir de uma entidade
department: employee.departmentId
  ? { id: employee.departmentId, display: employee.departmentName }
  : null,
```

**Lookup por digitação:** O usuário pode digitar um ID diretamente no campo de ID. No blur, se `lookupByIdFn` for fornecido, o componente o chama para resolver o nome de exibição. Se o ID for encontrado, ambos os campos são preenchidos. Se não, o campo é limpo. Sem `lookupByIdFn`, o ID é aceito como está com nome de exibição null.

**Interação:** O botão de busca (ícone de lupa) abre o diálogo de lookup. O campo de ID é editável para entrada direta. O campo de nome de exibição é readonly e não responde a cliques. O botão de limpar remove a seleção atual.

**Acessibilidade:** Botões de busca e limpar possuem atributos `aria-label` derivados do input `label`. O botão de limpar é desabilitado quando não há valor selecionado.

---

## DynamicRowsComponent

Componente estrutural que renderiza um `FormArray` reativo como uma lista de linhas editáveis. O consumidor fornece um template de linha via `<ng-template>`; `DynamicRowsComponent` cuida dos botões de adicionar/remover e do estado vazio.

O `FormGroup` de cada linha é exposto como a variável implícita do contexto do template, e o índice da linha é exposto via `let-index`. Vincular `[formGroup]="group"` em um container dentro do template fornece aos diretivas `formControlName` o `ControlContainer` correto para aquela linha.

```typescript
// employee-edit.component.ts — fábrica de linha como método privado usando FormBuilder
private buildPhoneRowGroup(phone?: Partial<{ label: string | null; number: string | null }>) {
  return this.fb.group({
    label: this.fb.control<string | null>(phone?.label ?? null, [Validators.required]),
    number: this.fb.control<string | null>(phone?.number ?? null, [Validators.required]),
  });
}

// Arrow function vinculada ao input [createRow] de DynamicRowsComponent
readonly createPhoneRow = () => this.buildPhoneRowGroup();
```

```html
<dynamic-rows
  [formArray]="form.controls.phones"
  [createRow]="createPhoneRow"
  [canAdd]="can('edit') || isNew"
  [canRemove]="can('edit') || isNew"
  addLabel="Add Phone"
  emptyMessage="No phone numbers added yet."
>
  <ng-template let-group let-index="index">
    <div [formGroup]="group" class="row g-2">
      <div class="col-md-4">
        <text-form-control [fieldId]="'phone-label-' + index" formControlName="label" label="Label" />
      </div>
      <div class="col-md-8">
        <phone-form-control [fieldId]="'phone-number-' + index" formControlName="number" label="Number" />
      </div>
    </div>
  </ng-template>
</dynamic-rows>
```

| Input | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `formArray` | `FormArray` | obrigatório | O FormArray a ser renderizado |
| `createRow` | `() => AbstractControl` | obrigatório | Função fábrica chamada no "Add"; tipicamente retorna um `FormGroup` |
| `canAdd` | `boolean` | `true` | Mostra o botão de adicionar quando true |
| `canRemove` | `boolean` | `true` | Mostra o botão de remover por linha quando true |
| `addLabel` | `string` | `'Add'` | Rótulo do botão de adicionar |
| `emptyMessage` | `string` | `'No items added yet.'` | Texto exibido quando o array não tem linhas |

**Variáveis de contexto do template:**

| Variável | Binding | Tipo | Descrição |
|----------|---------|------|-----------|
| `group` | `let-group` (implícita) | `FormGroup` | O FormGroup da linha |
| `index` | `let-index="index"` | `number` | Índice da linha baseado em zero |

**Integração com o modelo:** Linhas de `FormArray` são filhos simples de `FormGroup` — `getRawValue()` no formulário pai as retorna como array tipado. Quando o formulário usa sub-grupos para escopo de validador, o método `formToModel()` cuida do mapeamento (veja Padrão de Formulário acima).

**Propagação de dirty:** Angular só define `dirty` quando o usuário interage com um controle existente — `push()` e `removeAt()` são programáticos e não o disparam. `DynamicRowsComponent` chama `formArray.markAsDirty()` após cada adição e remoção, para que o `FormGroup` pai se torne dirty. Isso garante que o `unsavedChangesGuard` dispare corretamente quando o usuário navegar após modificar a lista. Observação: adicionar-então-remover deixa o formulário dirty mesmo se o estado líquido for igual ao original.

**Comportamento do Clear:** Como `FormArray.reset()` apenas reseta valores sem adicionar ou remover controles, páginas de edição que usam `DynamicRowsComponent` devem reconstruir o formulário no clear em vez de chamar `reset()`:

```typescript
onClear(): void {
  if (this.isNew) {
    this.form = this.buildEmployeeForm();
  } else {
    this.form = this.buildEmployeeForm(this.originalModel);
  }
}
```
