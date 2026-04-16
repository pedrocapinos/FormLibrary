# FormLib — Angular ERP Form Framework
[![pt-br](https://img.shields.io/badge/lang-pt--br-green.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/README.pt-BR.md)

**🚀 [View Live Demo](https://pedrocapinos.github.io/FormLibrary/)**

A composable toolkit of form controls, directives, masks, validators, and display components for building ERP-style CRUD pages in Angular 17+. FormLib is not a UI component library — it is a set of production-ready building blocks that teams use to construct concrete, entity-specific pages with minimal boilerplate.

---

## Documentation

Documentation is split by topic under [`docs/`](./docs). Start with the overview sections, then dive into the building blocks.

### Overview

- [Project Objectives](./docs/objectives.md) — what problems FormLib solves
- [Architecture](./docs/architecture.md) — layers, form pattern, technology stack
- [Design System](./docs/design-system.md) — tokens, theming, typography, utility classes, industrial blocks
- [Accessibility (WCAG 2.1 AA)](./docs/accessibility.md) — ARIA, label association, compliance summary

### Building Blocks

- [Core Form Controls](./docs/core-form-controls.md) — text, currency, date, code, phone, CPF, CNPJ, checkbox, select, lookup, range, address, dynamic rows
- [Display Components](./docs/display-components.md) — generic table, header, dialog system, confirm/active-filters/lookup dialogs, batch operations
- [Directives](./docs/directives.md) — auto-advance, select-all, unmask, focus-on-error
- [Input Masks](./docs/input-masks.md) — built-in masks, unmask helpers, leading zeros, character replacement, floating-point precision bounds
- [Error Messaging](./docs/error-messaging.md) — `ErrorMessageService`, global config, per-field overrides
- [Validators](./docs/validators.md) — `atLeastOneRequired`, `rangeValidator`
- [Services](./docs/services.md) — `SearchStateService`, `FormatService`, `DebugService`, `ToastService`, batch delete pattern (full `BatchOperationsService` API documented under [Display Components](./docs/display-components.md#batchoperationsservice))
- [Authentication & Authorization](./docs/authentication.md) — `AuthService`, route guards, read-only mode, mock users
- [Cross-Cutting Navigation](./docs/navigation.md) — unsaved-changes guard, deep linking, sidebar, return-to-origin, 404, loading indicator
- [Types](./docs/types.md) — `ColumnDefinition`, `ActiveFilterConfig`, `ActiveFilter`

### Reference & Usage

- [Entity Pattern](./docs/entity-pattern.md) — composition over inheritance, list/edit page composition
- [Example Entity](./docs/example-entity.md) — Employee model, playground
- [Testing](./docs/testing.md) — priority order, principles, commands
- [Development Setup](./docs/development-setup.md) — prerequisites, code formatting
- [Project Structure Reference](./docs/project-structure.md) — full directory layout
