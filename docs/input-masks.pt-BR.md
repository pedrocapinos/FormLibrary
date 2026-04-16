# Máscaras de Entrada
[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/input-masks.md)

Todas as máscaras usam [Maskito](https://maskito.dev). Importe de `src/app/core/masks/masks.ts`.

## Constantes de Máscara Embutidas

| Exportação | Formato | Exemplo |
|------------|---------|---------|
| `CPF_MASK` | `XXX.XXX.XXX-XX` | `123.456.789-09` |
| `PHONE_MASK` | `DDD-DDDDD-DDDD` | `011-98765-4321` |
| `CURRENCY_MASK` | Numérico, 2 decimais, separador de vírgula | `1.250,99` |
| `CNPJ_MASK_ALFANUMERICO` | CNPJ alfanumérico | `AB.CDE.FGH/0001-35` |

## Funções de Unmask

| Função | Entrada | Saída | Descrição |
|--------|---------|-------|-----------|
| `unmaskCpf(value)` | `string` | `string` | Remove todos os não-dígitos |
| `unmaskPhone(value)` | `string` | `string` | Remove todos os não-dígitos |
| `unmaskCurrency(value)` | `string` | `number \| null` | Converte moeda pt-BR em número; retorna `null` para entrada vazia/não parseável |
| `unmaskDate(value)` | `string` | `string \| null` | Converte `dd/MM/yyyy` → `yyyy-MM-dd` |
| `unmaskLeadingZeros(value)` | `string` | `number \| null` | Remove zeros à esquerda, retorna número |
| `unmaskCnpjAlfanumerico(value)` | `string` | `string` | Remove caracteres não alfanuméricos |

## Helpers de Data

| Função | Descrição |
|--------|-----------|
| `maskDate(iso)` | Converte `yyyy-MM-dd` → `dd/MM/yyyy` para exibição |
| `unmaskDate(display)` | Converte `dd/MM/yyyy` → `yyyy-MM-dd` para o modelo |

## createLeadingZerosMask(config)

Cria uma máscara numérica que completa ou remove zeros à esquerda.

```typescript
const mask = createLeadingZerosMask({ maxLength: 4, padded: true });
```

```typescript
interface LeadingZerosMaskConfig {
  maxLength: number;  // Deve ser um inteiro positivo
  padded: boolean;    // true = completa com zeros; false = remove zeros à esquerda
}
```

**Comportamento do modo padded:**
- Mantém sempre `maxLength` dígitos (ex.: `maxLength: 4` → digitar `5` exibe `0005`)
- Desloca os dígitos para a esquerda quando o campo está cheio e começa com zero
- Backspace limpa todo o campo quando ele contém apenas zeros

**Comportamento do modo não padded:**
- Remove zeros à esquerda (ex.: `00005` → `5`)
- Impede transbordamento além de `maxLength` dígitos

## createCharacterReplacementMask(replacements)

Cria uma máscara que transforma caracteres específicos conforme o usuário digita.

```typescript
const mask = createCharacterReplacementMask([
  { from: '<', to: '«' },
  { from: '>', to: '»' }
]);
```

```typescript
interface CharacterReplacement {
  from: string;  // Caractere ou string a ser localizado (regex-escapado automaticamente)
  to: string;    // Caractere ou string de substituição
}
```

Todas as ocorrências são substituídas globalmente. Útil para substituições tipográficas (`--` → `—`, `...` → `…`).

## Limites de Precisão de Ponto Flutuante (`currencyMaxValue`)

JavaScript utiliza floats IEEE 754 de precisão dupla (64-bit) para todos os números. Um double possui um significando (mantissa) de 52 bits, o que significa que ele pode representar inteiros exatamente até 2^53 (≈ 9 × 10^15). Além desse limite, floats consecutivos distam mais de 1 entre si — portanto, incrementar em 1 pode não alterar o valor.

Quando um campo de moeda tem `fractionDigits` casas decimais, o menor passo significativo é 10^(−fractionDigits). Para que a máscara funcione corretamente, cada passo desse tamanho deve corresponder a um float **distinto**. Conforme a parte inteira cresce, a distância entre floats adjacentes (a *unit in the last place*, ULP) eventualmente excede o tamanho do passo, e dois valores decimais diferentes silenciosamente colapsam no mesmo float.

`currencyMaxValue(fractionDigits)` calcula o maior valor em que esse colapso não pode ocorrer:

```
E  = floor(52 − fd × log₂(10))
max = 2^(E+1) − 10^(−fd)
```

- **E** é o maior expoente binário no qual a ULP (2^(E−52)) ainda é menor que o passo decimal (10^(−fd)).
- **2^(E+1)** é a primeira potência de dois em que a ULP igualaria ou excederia o passo — portanto, ficamos logo abaixo.
- Subtrair **10^(−fd)** produz um valor cujo último dígito decimal é todo 9s, resultando no limite superior representável mais apertado.

**Valores concretos para `fractionDigits` 0–15:**

| `fractionDigits` | `currencyMaxValue` | Tamanho do passo |
|------------------:|-------------------:|-----------------:|
| 0 | 9,007,199,254,740,991 | 1 |
| 1 | 562,949,953,421,311.9 | 0.1 |
| 2 | 70,368,744,177,663.99 | 0.01 |
| 3 | 8,796,093,022,207.999 | 0.001 |
| 4 | 549,755,813,887.9999 | 0.0001 |
| 5 | 68,719,476,735.99999 | 0.00001 |
| 6 | 8,589,934,591.999999 | 0.000001 |
| 7 | 536,870,911.9999999 | 0.0000001 |
| 8 | 67,108,863.99999999 | 0.00000001 |
| 9 | 8,388,607.999999999 | 0.000000001 |
| 10 | 524,287.9999999999 | 0.0000000001 |
| 11 | 65,535.99999999999 | 0.00000000001 |
| 12 | 8,191.999999999999 | 0.000000000001 |
| 13 | 511.9999999999999 | 0.0000000000001 |
| 14 | 63.99999999999999 | 0.00000000000001 |
| 15 | 7.999999999999999 | 0.000000000000001 |

Cada casa decimal adicional reduz o máximo em aproximadamente um fator de 8 (como log₂(10) ≈ 3.32, cada dígito extra custa ~3.32 bits de mantissa).

**Como se conecta ao componente:**

`CurrencyFormControlComponent` chama `currencyMaxValue(this.fractionDigits)` em `ngOnInit()`. Quando os inputs `min` ou `max` não são fornecidos, o componente usa `±currencyMaxValue` como limites padrão para `createCurrencyMask()`. Isso significa que a máscara impede automaticamente que o usuário digite valores que causariam perda de precisão — nenhum cálculo manual é necessário. Se você passar valores explícitos de `min`/`max` mais restritivos que o limite de precisão, estes são utilizados no lugar.

```typescript
// currency-form-control.component.ts (simplificado)
const defaultMax = currencyMaxValue(this.fractionDigits);
this.currencyMask = createCurrencyMask(
  this.fractionDigits,
  this.min ?? -defaultMax,
  this.max ?? defaultMax,
);
```
