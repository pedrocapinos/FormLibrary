# Referência de Estrutura do Projeto
[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/project-structure.md)

```
src/
└── app/
    ├── core/
    │   ├── auth/
    │   │   ├── auth.types.ts
    │   │   ├── auth.service.ts
    │   │   ├── auth.guard.ts
    │   │   ├── unsaved-changes.guard.ts
    │   │   └── mock-auth.api.ts
    │   ├── components/
    │   │   ├── error-message.component.ts
    │   │   ├── debug-mode.component.ts
    │   │   ├── dynamic-rows.component.ts
    │   │   ├── generic-header.component.ts
    │   │   ├── generic-table/
    │   │   │   ├── generic-table.component.ts
    │   │   │   ├── generic-table.component.html
    │   │   │   └── generic-table.component.css
    │   │   ├── list-state.component.ts
    │   │   ├── batch-nav.component.ts
    │   │   ├── dialog-host.component.ts
    │   │   ├── toast-container.component.ts
    │   │   ├── dialog-iframe.component.ts
    │   │   ├── dialog-content/
    │   │   │   ├── active-filters-content.component.ts
    │   │   │   └── confirm-dialog-content.component.ts
    │   │   └── form-controls/
    │   │       ├── base-form-control.component.ts
    │   │       ├── text-form-control.component.ts
    │   │       ├── code-form-control.component.ts
    │   │       ├── currency-form-control.component.ts
    │   │       ├── date-form-control.component.ts
    │   │       ├── phone-form-control.component.ts
    │   │       ├── cpf-form-control.component.ts
    │   │       ├── cnpj-form-control.component.ts
    │   │       ├── checkbox-form-control.component.ts
    │   │       ├── select-form-control.component.ts
    │   │       ├── lookup-form-control.component.ts
    │   │       ├── range-currency-form-control.component.ts
    │   │       └── address-form-control.component.ts
    │   ├── directives/
    │   │   ├── auto-advance.directive.ts
    │   │   ├── select-all-on-focus.directive.ts
    │   │   ├── unmask.directive.ts
    │   │   └── focus-on-error.directive.ts
    │   ├── masks/
    │   │   └── masks.ts
    │   ├── services/
    │   │   ├── error-message.service.ts
    │   │   ├── search-state.service.ts
    │   │   ├── navigation.service.ts
    │   │   ├── dialog-host.service.ts
    │   │   ├── confirm-dialog.service.ts
    │   │   ├── active-filters-dialog.service.ts
    │   │   ├── lookup-dialog.factory.ts
    │   │   ├── debug.service.ts
    │   │   ├── batch-edit.service.ts          # BatchOperationsService
    │   │   ├── toast.service.ts
    │   │   └── format.service.ts
    │   ├── validators/
    │   │   ├── range-validator.ts
    │   │   └── at-least-one-required-validator.ts
    │   ├── types/
    │   │   ├── column-definition.ts
    │   │   ├── active-filter.ts
    │   │   ├── active-filter-config.ts
    │   │   ├── toast.ts
    │   │   └── crud-service.ts
    │   └── utils/
    │       ├── focus-utils.ts
    │       ├── table-export.ts
    │       ├── is-empty.ts
    │       └── collect-active-filters.ts
    ├── features/
    │   ├── mock-seed.service.ts        # Dados de departamentos + funcionários gerados via Faker
    │   ├── login/
    │   │   └── login.component.ts
    │   ├── unauthorized/
    │   │   └── unauthorized.component.ts
    │   ├── not-found/
    │   │   └── not-found.component.ts
    │   ├── playground/
    │   │   ├── playground.component.ts
    │   │   └── playground.component.html
    │   ├── employee/
    │   │   ├── employee.model.ts
    │   │   ├── employee.filter.ts
    │   │   ├── employee.service.ts
    │   │   ├── employee-list.component.ts
    │   │   ├── employee-list.component.html
    │   │   ├── employee-edit.component.ts
    │   │   └── employee-edit.component.html
    │   └── department/
    │       ├── department.model.ts
    │       ├── department.filter.ts
    │       ├── department.service.ts
    │       ├── department-lookup.ts
    │       ├── department-list.component.ts
    │       ├── department-list.component.html
    │       ├── department-edit.component.ts
    │       └── department-edit.component.html
    ├── app.component.ts
    ├── app.component.html
    ├── app.routes.ts
    └── app.config.ts
```
