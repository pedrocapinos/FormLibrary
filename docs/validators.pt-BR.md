# Validadores
[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/validators.md)

## atLeastOneRequiredValidator

Uma função fábrica que retorna um `ValidatorFn` para um `FormGroup`. Exige que ao menos um dos controles especificados tenha um valor não vazio. Trata `0` como valor válido (preenchido).

```typescript
import { createAtLeastOneRequiredValidator } from 'src/app/core/validators/at-least-one-required-validator';

// Usado no sub-grupo de endereço do formulário de edição de funcionário
address: this.fb.group({
  street: this.fb.control<string | null>(null),
  city: this.fb.control<string | null>(null),
  state: this.fb.control<string | null>(null),
  zip: this.fb.control<string | null>(null),
}, { validators: [createAtLeastOneRequiredValidator(['street', 'city', 'state', 'zip'])] });
```

Retorna `{ atLeastOneRequired: true }` quando todos os controles especificados estão vazios. A vacuidade é determinada pelo helper compartilhado `isEmpty()` em `src/app/core/utils/is-empty.ts`, que trata `null`, `undefined`, `NaN`, strings em branco, arrays vazios e objetos cujos valores são todos vazios como vazios. A mensagem padrão do `ErrorMessageService` é: `"At least one {label} field is required"`.

O `AddressFormControlComponent` propaga o estado inválido internamente — ele lê o erro do grupo e aplica `[groupInvalid]` aos controles filhos automaticamente.

**Usado em:** página de edição de Employee — o fieldset de endereço exige ao menos um campo de endereço (rua, cidade, estado ou CEP).

---

## createRangeValidator(config)

Função fábrica que retorna um `ValidatorFn` para um `FormGroup`. Valida que o valor inicial não excede o valor final.

```typescript
createEmployeeFilterForm() {
  return new FormGroup({
    salaryMin: new FormControl<number | null>(null),
    salaryMax: new FormControl<number | null>(null),
  }, {
    validators: createRangeValidator({
      startKey: 'salaryMin',
      endKey: 'salaryMax',
      startLabel: 'Salary From',
      endLabel: 'Salary To',
    })
  });
}
```

```typescript
interface RangeConfig {
  startKey?: string;    // Chave do FormControl para o valor inicial (padrão: 'start')
  endKey?: string;      // Chave do FormControl para o valor final (padrão: 'end')
  startLabel?: string;  // Rótulo do campo inicial (usado nos parâmetros do erro)
  endLabel?: string;    // Rótulo do campo final (usado nos parâmetros do erro)
}
```

Retorna `{ rangeInvalid: { label: startLabel, otherLabel: endLabel } }` quando start > end. Retorna `null` quando qualquer dos valores é `null` (validação é ignorada se qualquer campo estiver vazio).
