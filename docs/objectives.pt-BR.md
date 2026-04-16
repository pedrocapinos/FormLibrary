# Objetivos do Projeto
[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/objectives.md)

Aplicações ERP compartilham um conjunto consistente de desafios em formulários que o Angular padrão não resolve nativamente:

- **Entradas com máscara** — CPF, CNPJ, moeda, data, códigos numéricos com zeros à esquerda
- **Consultas por código** — digitar um código, buscar e exibir o nome associado de forma assíncrona
- **Campos de intervalo** — duas entradas relacionadas (ex.: salário de/até) com validação cruzada
- **Mensagens de erro consistentes** — desacopladas das definições individuais de campo, configuráveis globalmente e sobrescritíveis por campo
- **Persistência de filtros** — formulários de busca que lembram seus valores entre navegações
- **Tabelas ricas** — ordenáveis, paginadas, selecionáveis, com capacidade de exportação

O FormLib resolve cada um desses problemas com artefatos focados e componíveis:

1. **Controles de formulário** — componentes CVA standalone que se integram a formulários reativos
2. **Diretivas** — comportamentos ortogonais (auto-advance, selecionar tudo, unmask, foco em erro)
3. **Máscaras de entrada** — definições e funções fábrica baseadas em Maskito
4. **Validadores** — fábricas de validadores cruzados reutilizáveis
5. **Mensagens de erro** — sistema baseado em serviço com configuração global e sobrescritas por campo
6. **Componentes de exibição** — tabela genérica, cabeçalho de página, host de diálogo consolidado com componentes de conteúdo
7. **Serviços** — persistência de estado de filtros

As entidades Employee e Department demonstram como compor todos esses recursos em páginas completas de lista e edição. A entidade Department também serve como destino de lookup a partir da página de edição de Employee por meio de diálogos de lookup.
