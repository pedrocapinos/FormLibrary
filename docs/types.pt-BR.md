# Tipos
[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/types.md)

## ColumnDefinition\<T\>

Descreve uma única coluna em `GenericTableComponent`.

```typescript
interface ColumnDefinition<T = any> extends Formattable {
  key: keyof T & string;                      // Nome da propriedade no objeto de dado
  header: string;                             // Rótulo do cabeçalho da coluna
  width?: string;                             // Largura CSS opcional (ex.: '120px', '10%')
  formatter?: (value: any, row: T) => string; // Formatador de exibição opcional (sobrepõe format)
  calculateTotal?: boolean;                   // Soma esta coluna e exibe na linha de totais do rodapé
  sticky?: boolean;                           // Fixa a coluna à borda esquerda durante rolagem horizontal
  visible?: boolean;                          // Mostra/esconde a coluna (usado com o seletor de colunas)
}
```

Tanto `ColumnDefinition` quanto `ActiveFilterConfig` estendem a interface compartilhada `Formattable`:

```typescript
interface Formattable {
  format?: FormatType;         // Atalho: 'cpf' | 'cnpj' | 'currency' | 'date' | 'boolean' | 'phone' | 'text'
  formatOptions?: FormatOptions; // Opções passadas para FormatService (ex.: currencyCode, trueLabel)
  formatter?: (value: any, ...args: any[]) => string; // Formatador personalizado (sobrepõe format)
}
```

**Exemplo:**
```typescript
const columns: ColumnDefinition<Employee>[] = [
  { key: 'id', header: 'ID', width: '80px' },
  { key: 'firstName', header: 'Name' },
  { key: 'cpf', header: 'CPF', format: 'cpf' },
  { key: 'salary', header: 'Salary', format: 'currency', calculateTotal: true },
  { key: 'isActive', header: 'Active', format: 'boolean', visible: false },
];
```

## ActiveFilterConfig

Declara como um único controle de formulário deve aparecer na barra e no diálogo de filtros ativos. Definido por entidade em `entity.filter.ts` (páginas de lista) ou `entity.model.ts` (páginas de edição).

```typescript
interface ActiveFilterConfig extends Formattable {
  label: string;       // Rótulo legível exibido no chip/diálogo
  hidden?: boolean;    // Exclui este controle dos filtros ativos
  tabId?: string;      // Identificador de aba — usado para agrupar filtros em cards e alternar abas
  tabLabel?: string;   // Nome legível da aba exibido no cabeçalho do card
}
```

Para páginas com abas, use `defineTabFilterConfig()` para declarar a configuração em um formato estruturado, com abas em primeiro lugar. O helper injeta `tabId` e `tabLabel` em cada campo automaticamente:

```typescript
import { defineTabFilterConfig } from '../core/types/active-filter-config';

const MY_FILTER_CONFIG = defineTabFilterConfig([
  {
    tabId: 'personal',
    tabLabel: 'Personal Info',
    fields: {
      firstName: { label: 'First Name' },
      cpf:       { label: 'CPF', format: 'cpf' },
    },
  },
  {
    tabId: 'contact',
    tabLabel: 'Contact',
    fields: {
      phone: { label: 'Phone' },
      email: { label: 'Email' },
    },
  },
]);
```

Para páginas sem abas, a sintaxe simples `Record<string, ActiveFilterConfig>` continua funcionando:

```typescript
const EMPLOYEE_LIST_FILTER_CONFIG: Record<string, ActiveFilterConfig> = {
  id: { label: 'ID' },
  firstName: { label: 'First Name' },
  isActive: { label: 'Active only', format: 'boolean' },
  salaryMin: { label: 'Min Salary', format: 'currency' },
  salaryMax: { label: 'Max Salary', format: 'currency' },
};
```

## ActiveFilter

Descreve uma única entrada de filtro ativo exibida na barra de filtros do `GenericTableComponent` e no `ActiveFiltersContentComponent`.

```typescript
interface ActiveFilter {
  controlName: string;   // Chave do FormControl — usada para focar o input ao clicar
  label: string;         // Rótulo legível (resolvido a partir de ActiveFilterConfig)
  displayValue: string;  // Valor formatado exibido (resolvido via FormatService ou formatador personalizado)
  tabId?: string;        // Propagado de ActiveFilterConfig — usado para agrupamento no diálogo e troca de aba
  tabLabel?: string;     // Propagado de ActiveFilterConfig — exibido como cabeçalho do card no diálogo
}
```

Coletado automaticamente via `collectActiveFilters(form, config, formatService)` de `src/app/core/utils/collect-active-filters.ts`. A função percorre o `FormGroup`, combina cada caminho de controle com o objeto de configuração (suportando caminhos coringa como `phones.*.number`) e formata valores não vazios usando `FormatService` ou um `formatter` personalizado.
