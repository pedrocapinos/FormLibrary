# Testing
[![pt-br](https://img.shields.io/badge/lang-pt--br-green.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/testing.pt-BR.md)

**Quick summary:**

- **Priority order:** Pure functions (validators, unmask) > Services > Auth (service + guards) > Directives > CVA Components
- **Principle:** Test the library contract, not the framework. A failing test should point at a bug in *our* code.
- **No TestBed when possible:** Validators and services are tested with plain `new` instantiation. Directives and CVA components use a minimal `TestHostComponent` + `TestBed`.
- **Run tests:** `ng test` (or `ng test --watch=false --browsers=ChromeHeadless` for CI)
