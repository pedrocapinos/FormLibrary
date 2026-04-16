# Project Objectives
[![pt-br](https://img.shields.io/badge/lang-pt--br-green.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/objectives.pt-BR.md)

ERP applications share a consistent set of form challenges that standard Angular does not solve out of the box:

- **Masked inputs** — CPF, CNPJ, currency, date, numeric codes with leading zeros
- **Code lookups** — enter a code, fetch and display the associated name asynchronously
- **Range fields** — two related inputs (e.g. salary from/to) with cross-field validation
- **Consistent error messages** — decoupled from individual field definitions, configurable globally and overridable per field
- **Filter persistence** — search forms that remember their values across navigation
- **Rich tables** — sortable, paginated, selectable, with export capabilities

FormLib solves each of these with focused, composable artifacts:

1. **Form controls** — standalone CVA components that plug into reactive forms
2. **Directives** — orthogonal behaviors (auto-advance, select-all, unmask, focus-on-error)
3. **Input masks** — Maskito-based mask definitions and factory functions
4. **Validators** — reusable cross-field validator factories
5. **Error messaging** — a service-based system with global configuration and per-field overrides
6. **Display components** — generic table, page header, consolidated dialog host with content components
7. **Services** — filter state persistence

The Employee and Department entities demonstrate how to compose all of these into complete list and edit pages. The Department entity also serves as a lookup target from the Employee edit page via lookup dialogs.
