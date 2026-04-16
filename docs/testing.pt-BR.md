# Testes
[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/testing.md)

**Resumo rápido:**

- **Ordem de prioridade:** Funções puras (validadores, unmask) > Serviços > Auth (serviço + guards) > Diretivas > Componentes CVA
- **Princípio:** Testar o contrato da biblioteca, não o framework. Um teste que falha deve apontar para um bug no *nosso* código.
- **Evitar TestBed quando possível:** Validadores e serviços são testados com instanciação simples via `new`. Diretivas e componentes CVA usam um `TestHostComponent` mínimo + `TestBed`.
- **Executar testes:** `ng test` (ou `ng test --watch=false --browsers=ChromeHeadless` para CI)
