# Entidade de Exemplo
[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/example-entity.md)

## Employee

```typescript
interface EmployeePhone {
  label: string | null;
  number: string | null;
}

interface Employee {
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

**Validadores do formulário:** `id` — min 0, max 9999 (com mensagens personalizadas por campo) · `firstName` — minLength 3, maxLength 100, required

**Validadores cruzados (com escopo de FormGroup):** sub-grupo `identity` — `createAtLeastOneRequiredValidator` (ao menos um entre id, cpf) · sub-grupo `address` — `createAtLeastOneRequiredValidator` (ao menos um entre street, city, state, zip)

**Formulário de filtro:** `id`, `firstName`, intervalo de salário (`salaryMin`/`salaryMax`) com `createRangeValidator`, checkbox `isActive`

**Controles utilizados:** `code-form-control` (ID), `text-form-control` (nome), `cpf-form-control` (CPF), `currency-form-control` (salário), `checkbox-form-control` (ativo), `lookup-form-control` (departamento), `address-form-control` (fieldset de endereço), `dynamic-rows` (telefones com rótulo e número por linha)

A entidade Employee possui um serviço em memória alimentado por [`@faker-js/faker`](https://fakerjs.dev) com seed fixo (reproduzível a cada reinício): 50 funcionários. Chamadas de rede são simuladas com atraso de 200ms.

**MockSeedService** (`src/app/features/mock-seed.service.ts`) é o singleton que detém os dados-semente tanto de `employee.service.ts` quanto de `department.service.ts`. Ele primeiro semeia 15 departamentos (`DEPARTMENT_SEED = 99`), depois 50 funcionários (`EMPLOYEE_SEED = 42`) com ~70% de chance de receberem um departamento aleatório. Ambos os serviços injetam esse provider e servem mutações contra seus arrays, mantendo referências cruzadas consistentes (o `departmentId` de um funcionário sempre resolve para um departamento real). Substitua este serviço por implementações via HTTP para conectar a um backend real — os serviços de entidade são os únicos chamadores.

## Playground de Componentes

Uma página de demonstração interativa em `/playground` que permite explorar cada controle de formulário da biblioteca. Organizada em quatro abas:

| Aba | Componentes |
|-----|-------------|
| **Text & Masked** | `text-form-control`, `cpf-form-control`, `cnpj-form-control`, `phone-form-control`, `date-form-control` |
| **Numeric** | `code-form-control`, `currency-form-control` |
| **Selection** | `select-form-control`, `checkbox-form-control` |
| **Compound** | `range-currency-form-control`, `address-form-control` |

Cada card de componente possui um painel de **Configuração** ao vivo onde você pode alternar propriedades (`disabled`, `required`, `maxLength`, `padded`, `fractionDigits`, `min`/`max`, `placeholder`, etc.) e ver o efeito em tempo real. A página inclui ainda:

- Painel **Form Value** — card fixo à direita com visualização JSON ao vivo de `form.getRawValue()` e um badge de status válido/inválido
- Diálogo **Active Filters** — testa o recurso de filtros ativos contra o formulário do playground
- **Submit** — marca todos os controles como touched para disparar a exibição de validação
- **Clear** — reseta o formulário inteiro
