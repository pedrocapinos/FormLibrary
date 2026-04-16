# FormLib — Framework de Formulários ERP em Angular
[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/README.md)

**🚀 [Ver Demonstração Online](https://pedrocapinos.github.io/FormLibrary/)**

Um toolkit composto por controles de formulário, diretivas, máscaras, validadores e componentes de exibição para construção de páginas CRUD estilo ERP em Angular 17+. FormLib não é uma biblioteca de componentes de UI — é um conjunto de blocos de construção prontos para produção que equipes utilizam para montar páginas concretas, específicas por entidade, com o mínimo de boilerplate.

---

## Documentação

A documentação está dividida por tópico em [`docs/`](./docs). Comece pelas seções de visão geral, depois aprofunde-se nos blocos de construção.

### Visão Geral

- [Objetivos do Projeto](./docs/objectives.pt-BR.md) — quais problemas o FormLib resolve
- [Arquitetura](./docs/architecture.pt-BR.md) — camadas, padrão de formulário, stack tecnológico
- [Design System](./docs/design-system.pt-BR.md) — tokens, temas, tipografia, classes utilitárias, blocos industriais
- [Acessibilidade (WCAG 2.1 AA)](./docs/accessibility.pt-BR.md) — ARIA, associação de rótulos, resumo de conformidade

### Blocos de Construção

- [Controles de Formulário Principais](./docs/core-form-controls.pt-BR.md) — texto, moeda, data, código, telefone, CPF, CNPJ, checkbox, select, lookup, range, endereço, linhas dinâmicas
- [Componentes de Exibição](./docs/display-components.pt-BR.md) — tabela genérica, cabeçalho, sistema de diálogos, diálogos de confirmação/filtros ativos/lookup, operações em lote
- [Diretivas](./docs/directives.pt-BR.md) — auto-advance, selecionar tudo, unmask, foco em erro
- [Máscaras de Entrada](./docs/input-masks.pt-BR.md) — máscaras embutidas, helpers de unmask, zeros à esquerda, substituição de caracteres, limites de precisão de ponto flutuante
- [Mensagens de Erro](./docs/error-messaging.pt-BR.md) — `ErrorMessageService`, configuração global, sobrescritas por campo
- [Validadores](./docs/validators.pt-BR.md) — `atLeastOneRequired`, `rangeValidator`
- [Serviços](./docs/services.pt-BR.md) — `SearchStateService`, `FormatService`, `DebugService`, `ToastService`, padrão de exclusão em lote (API completa do `BatchOperationsService` documentada em [Componentes de Exibição](./docs/display-components.pt-BR.md#batchoperationsservice))
- [Autenticação e Autorização](./docs/authentication.pt-BR.md) — `AuthService`, guards de rota, modo somente leitura, usuários mock
- [Navegação Transversal](./docs/navigation.pt-BR.md) — guard de alterações não salvas, deep linking, sidebar, retorno à origem, 404, indicador de carregamento
- [Tipos](./docs/types.pt-BR.md) — `ColumnDefinition`, `ActiveFilterConfig`, `ActiveFilter`

### Referência e Uso

- [Padrão de Entidade](./docs/entity-pattern.pt-BR.md) — composição sobre herança, composição de páginas lista/edição
- [Entidade de Exemplo](./docs/example-entity.pt-BR.md) — modelo Employee, playground
- [Testes](./docs/testing.pt-BR.md) — ordem de prioridade, princípios, comandos
- [Configuração de Desenvolvimento](./docs/development-setup.pt-BR.md) — pré-requisitos, formatação de código
- [Referência de Estrutura do Projeto](./docs/project-structure.pt-BR.md) — layout completo de diretórios
