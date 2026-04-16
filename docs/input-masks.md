# Input Masks
[![pt-br](https://img.shields.io/badge/lang-pt--br-green.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/input-masks.pt-BR.md)

All masks use [Maskito](https://maskito.dev). Import from `src/app/core/masks/masks.ts`.

## Built-in Mask Constants

| Export | Format | Example |
|--------|--------|---------|
| `CPF_MASK` | `XXX.XXX.XXX-XX` | `123.456.789-09` |
| `PHONE_MASK` | `DDD-DDDDD-DDDD` | `011-98765-4321` |
| `CURRENCY_MASK` | Numeric, 2 decimals, comma separator | `1.250,99` |
| `CNPJ_MASK_ALFANUMERICO` | Alphanumeric CNPJ | `AB.CDE.FGH/0001-35` |

## Unmask Functions

| Function | Input | Output | Description |
|----------|-------|--------|-------------|
| `unmaskCpf(value)` | `string` | `string` | Removes all non-digits |
| `unmaskPhone(value)` | `string` | `string` | Removes all non-digits |
| `unmaskCurrency(value)` | `string` | `number \| null` | Parses pt-BR currency to number; returns `null` for empty/unparseable input |
| `unmaskDate(value)` | `string` | `string \| null` | Converts `dd/MM/yyyy` → `yyyy-MM-dd` |
| `unmaskLeadingZeros(value)` | `string` | `number \| null` | Removes leading zeros, returns number |
| `unmaskCnpjAlfanumerico(value)` | `string` | `string` | Removes non-alphanumeric characters |

## Date Helpers

| Function | Description |
|----------|-------------|
| `maskDate(iso)` | Converts `yyyy-MM-dd` → `dd/MM/yyyy` for display |
| `unmaskDate(display)` | Converts `dd/MM/yyyy` → `yyyy-MM-dd` for the model |

## createLeadingZerosMask(config)

Creates a numeric mask that pads or trims leading zeros.

```typescript
const mask = createLeadingZerosMask({ maxLength: 4, padded: true });
```

```typescript
interface LeadingZerosMaskConfig {
  maxLength: number;  // Must be a positive integer
  padded: boolean;    // true = pad with zeros; false = trim leading zeros
}
```

**Padded mode behavior:**
- Programmatic values (e.g. `writeValue`, patched form values) render padded to `maxLength` immediately.
- During focus the input stays unpadded — typing `5` shows `5`, not `0005`. Padding applies on blur.
- Insertion is blocked once the field holds `maxLength` digits (no shift-left, no overflow).
- Backspace on a field containing only zeros clears it completely (control becomes `null`).

**Non-padded mode behavior:**
- Trims leading zeros (e.g. `00005` → `5`).
- Insertion is blocked once the field holds `maxLength` digits.

## createCharacterReplacementMask(replacements)

Creates a mask that transforms specific characters as the user types.

```typescript
const mask = createCharacterReplacementMask([
  { from: '<', to: '«' },
  { from: '>', to: '»' }
]);
```

```typescript
interface CharacterReplacement {
  from: string;  // Character or string to find (regex-escaped automatically)
  to: string;    // Replacement character or string
}
```

All occurrences are replaced globally. Useful for typographic replacements (`--` → `—`, `...` → `…`).

## Floating-Point Precision Bounds (`currencyMaxValue`)

JavaScript uses IEEE 754 double-precision floats (64-bit) for all numbers. A double has a 52-bit significand (mantissa), which means it can represent integers exactly up to 2^53 (≈ 9 × 10^15). Beyond that threshold, consecutive floats are more than 1 apart — so incrementing by 1 may not change the value at all.

When a currency field has `fractionDigits` decimal places, the smallest meaningful step is 10^(−fractionDigits). For the mask to work correctly, every step of that size must land on a **distinct** float. As the integer part grows, the gap between adjacent floats (the *unit in the last place*, ULP) eventually exceeds the step size, and two different decimal values silently alias to the same float.

`currencyMaxValue(fractionDigits)` computes the largest value where this aliasing cannot happen:

```
E  = floor(52 − fd × log₂(10))
max = 2^(E+1) − 10^(−fd)
```

- **E** is the highest binary exponent at which the ULP (2^(E−52)) is still smaller than the decimal step (10^(−fd)).
- **2^(E+1)** is the first power of two where the ULP would equal or exceed the step — so we stay just below it.
- Subtracting **10^(−fd)** gives a value whose last decimal digit is all 9s, making it the tightest representable upper bound.

**Concrete values for `fractionDigits` 0–15:**

| `fractionDigits` | `currencyMaxValue` | Step size |
|------------------:|-------------------:|----------:|
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

Each additional decimal place reduces the maximum by roughly a factor of 8 (since log₂(10) ≈ 3.32, every extra digit costs ~3.32 bits of mantissa).

**How it wires into the component:**

`CurrencyFormControlComponent` calls `currencyMaxValue(this.fractionDigits)` during `ngOnInit()`. When `min` or `max` inputs are not provided, the component uses `±currencyMaxValue` as the default bounds for `createCurrencyMask()`. This means the mask automatically prevents the user from typing values that would lose precision — no manual calculation needed. If you pass explicit `min`/`max` values that are tighter than the precision bound, those are used instead.

```typescript
// currency-form-control.component.ts (simplified)
const defaultMax = currencyMaxValue(this.fractionDigits);
this.currencyMask = createCurrencyMask(
  this.fractionDigits,
  this.min ?? -defaultMax,
  this.max ?? defaultMax,
);
```
