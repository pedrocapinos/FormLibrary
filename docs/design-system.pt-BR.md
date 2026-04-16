# Design System
[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/design-system.md)

O FormLib é entregue com uma linguagem de design **industrial** — bordas nítidas, numerais tabulares, acentos monoespaçados, superfícies de baixo raio de canto e sombras contidas. Esta página é a referência dos tokens, utilitários e blocos reutilizáveis que dão forma a cada tela. Leia-a antes de construir uma nova página ou adicionar novo CSS.

Todo o sistema está em [`src/styles.css`](../src/styles.css). Não há camada SCSS, pré-processador nem biblioteca de componentes a adotar — apenas CSS custom properties, overrides de variáveis do Bootstrap 5.3 e um conjunto enxuto de classes utilitárias.

## Sumário

- [Princípios](#princípios)
- [Pipeline](#pipeline)
- [Design Tokens](#design-tokens)
- [Temas](#temas)
- [Tipografia](#tipografia)
- [Acessibilidade e Contraste](#acessibilidade-e-contraste)
- [Classes Utilitárias](#classes-utilitárias)
- [Blocos Industriais](#blocos-industriais)
- [Guia de Autoria de Componente](#guia-de-autoria-de-componente)
- [Regras de Extensão](#regras-de-extensão)
- [Localização de Arquivos](#localização-de-arquivos)
- [Documentos Relacionados](#documentos-relacionados)

## Princípios

1. **Tokens, não hex.** Toda cor, raio, sombra e duração é uma CSS custom property. Valores hex codificados são bug — quebram o tema escuro.
2. **Bootstrap como substrato, não como identidade.** O Bootstrap 5.3 oferece grid, utilitários, reset e esqueleto de componentes. A *aparência* vem dos overrides de tokens aplicados por cima.
3. **Nítido em vez de suave.** Raios vão até 6px. Sombras jamais borram mais que 12px. Bordas são hairline ou fortes, nunca coloridas.
4. **Numerais tabulares em toda parte.** Telas de ERP alinham números em colunas — `font-variant-numeric: tabular-nums` é aplicado globalmente em `src/styles.css`.
5. **Rótulos em maiúsculas, tags monoespaçadas.** Form labels, cabeçalhos de tabela e chips de metadado usam maiúsculas pequenas com tracking largo para sinalizar "UI de sistema" em vez de conteúdo.
6. **Troca de tema em tempo de execução.** Temas alternam via um único atributo `data-bs-theme` em `<html>`. Todos os tokens resolvem em runtime — sem rebuild para trocar o tema.

## Pipeline

A folha de estilo é organizada em quatro camadas, nesta ordem:

```
┌─────────────────────────────────────────┐
│ 1. Design tokens                        │  :root + [data-bs-theme='dark']
├─────────────────────────────────────────┤
│ 2. Overrides de variáveis do Bootstrap  │  --bs-* mapeados para nossos tokens
├─────────────────────────────────────────┤
│ 3. Refinamentos de componentes          │  .btn, .form-control, .table, ...
├─────────────────────────────────────────┤
│ 4. Utilitários e blocos industriais     │  .u-*, .block, .state, .error-page
└─────────────────────────────────────────┘
```

Camadas inferiores **consomem** os tokens; jamais os redefinem. Novos estilos devem seguir a mesma ordem dentro do próprio CSS do componente: leituras de token primeiro, composições depois.

## Design Tokens

Todos os tokens são declarados em [`src/styles.css`](../src/styles.css) na seção de design tokens. Os valores do tema claro ficam em `:root`; os overrides do tema escuro em `[data-bs-theme='dark']`.

### Escala de Tinta (Ink)

Uma escala neutra que inverte entre temas. `ink-900` é sempre o foreground mais escuro, `ink-50` é sempre a superfície mais clara. No tema escuro a escala *inverte semanticamente* — `ink-900` torna-se quase branco — então a mesma regra (`color: var(--ink-900)`) produz texto legível em qualquer superfície.

| Token | Claro | Escuro | Propósito |
|-------|-------|--------|-----------|
| `--ink-900` | `#0a0a0a` | `#ececea` | Texto principal, títulos |
| `--ink-800` | `#161616` | `#dcdcd8` | Corpo de texto em superfícies elevadas |
| `--ink-700` | `#242424` | `#c4c4c0` | Rótulos de botão, itens de lista |
| `--ink-500` | `#4a4a47` | `#8a8a84` | Texto secundário, metadados |
| `--ink-400` | `#70706a` | `#6a6a64` | Texto desabilitado, marcas decorativas |
| `--ink-300` | `#9a9a94` | `#4e4e48` | Placeholders, conteúdo atenuado |
| `--ink-200` | `#c7c7c1` | `#33332f` | Thumb de scrollbar, acentos de régua |
| `--ink-100` | `#e5e5e0` | `#24241f` | Superfícies terciárias (badges, fundo atenuado) |
| `--ink-50`  | `#f3f3ee` | `#17171a` | Hover de linha, cabeçalho de tabela |
| `--paper` | `#fafaf7` | `#0b0c0e` | Fundo de página |
| `--paper-elevated` | `#ffffff` | `#121317` | Cards, modais, form controls |

### Acento

Uma única família azul-marca. `--accent-ink` é a cor *sobre* `--accent` (texto do rótulo dentro de um botão primário).

| Token | Claro | Escuro | Propósito |
|-------|-------|--------|-----------|
| `--accent` | `#2e5bff` | `#6e8bff` | Botões primários, anel de foco, links |
| `--accent-hover` | `#1d45d9` | `#8aa0ff` | Estado hover/active |
| `--accent-ink` | `#ffffff` | `#0a0a0a` | Texto/ícone sobre preenchimento acentuado |
| `--accent-soft` | `#eef1ff` | `rgba(110,139,255,0.12)` | Tint de linha selecionada, ênfase sutil |

### Estado

Cores semânticas para feedback não neutro. Constantes entre temas — um aviso continua âmbar independentemente do tema.

| Token | Valor | Propósito |
|-------|-------|-----------|
| `--warn` | `#f59e0b` | Botões de aviso, estado pendente |
| `--danger` | `#dc2626` | Ações destrutivas, input inválido |
| `--success` | `#10b981` | Confirmação, status positivo |

### Bordas

Baseadas em RGBA, adaptam-se corretamente sobre qualquer superfície. Nunca use `#000` ou `#fff` puros em bordas.

| Token | Claro | Escuro | Propósito |
|-------|-------|--------|-----------|
| `--border` | `rgba(10,10,10,0.12)` | `rgba(255,255,255,0.10)` | Borda padrão de componente |
| `--border-strong` | `rgba(10,10,10,0.28)` | `rgba(255,255,255,0.24)` | Contêineres enfatizados (`.block`, form check) |
| `--border-hairline` | `rgba(10,10,10,0.08)` | `rgba(255,255,255,0.06)` | Divisores de linhas de tabela |

### Tipografia

| Token | Valor |
|-------|-------|
| `--font-display` | `'IBM Plex Sans', system-ui, -apple-system, sans-serif` |
| `--font-body` | `'IBM Plex Sans', system-ui, -apple-system, sans-serif` |
| `--font-mono` | `'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace` |

A família IBM Plex é carregada via Google Fonts em `src/index.html`. Display e body compartilham a mesma família por decisão de design — a diferença está apenas em peso e tracking.

### Raios

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius-xs` | `2px` | Badges, chips de teclado, form check |
| `--radius-sm` | `3px` | Botões, inputs |
| `--radius` | `4px` | Cards, list groups |
| `--radius-lg` | `6px` | Modais, as maiores superfícies |

### Sombras

| Token | Valor | Uso |
|-------|-------|-----|
| `--shadow-xs` | `0 1px 0 rgba(10,10,10,0.04)` | Luz de borda em card |
| `--shadow-sm` | `0 1px 2px ..., 0 1px 0 ...` | Elevação de botão no hover |
| `--shadow` | `0 4px 12px rgba(10,10,10,0.08)` | Modal, popover |
| `--shadow-focus` | `0 0 0 3px rgba(46,91,255,0.18)` | Anel de foco em inputs/botões |

### Movimento

| Token | Valor | Uso |
|-------|-------|-----|
| `--ease` | `cubic-bezier(0.2, 0, 0, 1)` | Easing padrão |
| `--dur-1` | `120ms` | Hover, foco, pequenas mudanças de estado |
| `--dur-2` | `200ms` | Abertura/fechamento de diálogo, transições maiores |

## Temas

### Como Funciona a Alternância

A troca claro ↔ escuro é uma única alteração de atributo em `<html>`, gerenciada pela shell em `src/app/app.component.ts`:

```typescript
// app.component.ts (simplificado)
type Theme = 'light' | 'dark';

theme: Theme = this.loadTheme();

toggleTheme(): void {
  this.theme = this.theme === 'dark' ? 'light' : 'dark';
  this.applyTheme(this.theme);
  try {
    localStorage.setItem('formlib.theme', this.theme);
  } catch {}
}

private loadTheme(): Theme {
  try {
    const saved = localStorage.getItem('formlib.theme');
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {}
  return 'light';
}

private applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-bs-theme', theme);
}
```

`src/index.html` inicializa `data-bs-theme="light"` em `<html>` para que a primeira pintura nunca fique sem estilo; `AppComponent.ngOnInit` então restaura a preferência salva.

Como cada cor lê de um token, o DOM nunca re-renderiza — apenas os valores das CSS variables mudam e o navegador repinta uma vez.

### Por que não `prefers-color-scheme`?

Usuários em um turno longo de ERP querem o tema **que eles** escolheram, não o que o SO imaginou à meia-noite. O sistema suporta `prefers-color-scheme` em princípio — bastaria um bloco `@media (prefers-color-scheme: dark)` ao lado de `[data-bs-theme='dark']` — mas a shell atual armazena uma preferência explícita do usuário em `localStorage.formlib.theme`. Isso é intencional.

### Atributo, Não Classe

O Bootstrap 5.3 lê `data-bs-theme`, então o reaproveitamos. Isso significa que os utilitários de modo escuro do próprio Bootstrap (p.ex., `.text-bg-dark`) continuam funcionando sem fiação extra.

### Adicionando um Token Ciente de Tema

Qualquer novo token **precisa** ser definido em ambos os blocos:

```css
:root {
  /* ... */
  --highlight-row: #fff8d4;
}

[data-bs-theme='dark'] {
  /* ... */
  --highlight-row: #3d3520;
}
```

Um token definido apenas em `:root` herda seu valor claro para o tema escuro, e isso é quase sempre um bug.

## Tipografia

### Títulos

Todos os títulos usam `--font-display`, peso 500 por padrão, com letter-spacing negativo que aperta conforme o tamanho cresce. Fonte: [`src/styles.css`](../src/styles.css).

| Nível | Font-size | Peso | Letter-spacing |
|-------|-----------|------|----------------|
| `h1` / `.h1` | `2rem` (32px) | 600 | `-0.035em` |
| `h2` / `.h2` | `1.5rem` (24px) | 500 | `-0.025em` |
| `h3` / `.h3` | `1.25rem` (20px) | 500 | `-0.02em` (herdado) |
| `h4` / `.h4` | `1rem` (16px) | 600 | `-0.02em` (herdado) |

```html
<h1>Funcionários</h1>
<h2>Dados pessoais</h2>
<h3>Contato</h3>
<h4>Números de telefone</h4>
```

### Corpo

```css
body {
  font-size: 14px;
  letter-spacing: -0.005em;
  font-feature-settings: 'cv11', 'ss01', 'ss03';
}
```

Os três `font-feature-settings` ativam caracteres alternativos do IBM Plex — zero cortado, *a* de um andar e ligaduras ss03 — ajustados para telas numéricas densas.

### Form Labels

Form labels seguem convenção industrial específica: pequenos, em maiúsculas, com tracking largo. Fonte: [`src/styles.css`](../src/styles.css).

```css
.form-label {
  font-size: 0.6875rem;   /* 11px */
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-500);
}
```

Essa regra é aplicada automaticamente a qualquer `<label class="form-label">` ou label renderizado por um form control do FormLib — você não escreve essas regras manualmente.

### Numerais Tabulares

Aplicados globalmente em tabelas, form controls, code e pre:

```css
table, .form-control, .table, code, pre, .font-monospace {
  font-variant-numeric: tabular-nums;
}
```

É por isso que colunas de salário ficam alinhadas sem regras explícitas de largura.

## Acessibilidade e Contraste

Todos os pares de token foreground/background são verificados contra **WCAG 2.1 Nível AA**. O contrato mais amplo de acessibilidade da biblioteca está em [`accessibility.pt-BR.md`](./accessibility.pt-BR.md); esta seção foca especificamente no sistema de cores.

### Limiares WCAG AA

- Texto corpo normal: **4,5:1**
- Texto grande (≥ 18pt regular ou ≥ 14pt bold): **3:1**
- UI não textual (ícones, bordas, anéis de foco): **3:1**

### Matriz de Contraste

Razões de contraste calculadas pela fórmula de luminância relativa do WCAG 2.1.

#### Tema Claro

| Par | Razão | WCAG |
|-----|-------|------|
| `--ink-900` sobre `--paper` | **18,9 : 1** | AAA |
| `--ink-800` sobre `--paper-elevated` | **16,8 : 1** | AAA |
| `--ink-700` sobre `--paper-elevated` | **14,1 : 1** | AAA |
| `--ink-500` sobre `--paper` | **8,5 : 1** | AAA |
| `--ink-400` sobre `--paper` | **4,6 : 1** | AA (texto normal) |
| `--accent-ink` sobre `--accent` | **5,2 : 1** | AA (texto normal) |
| `--danger` sobre `--paper` | **4,6 : 1** | AA (texto normal) |
| `--warn` sobre `--ink-900` (`.btn-warning:hover`) | **9,8 : 1** | AAA |
| `--success` sobre `--paper-elevated` | **3,3 : 1** | AA (apenas texto grande / não textual) |

#### Tema Escuro

| Par | Razão | WCAG |
|-----|-------|------|
| `--ink-900` sobre `--paper` | **16,5 : 1** | AAA |
| `--ink-800` sobre `--paper-elevated` | **13,2 : 1** | AAA |
| `--ink-700` sobre `--paper-elevated` | **9,7 : 1** | AAA |
| `--ink-500` sobre `--paper` | **4,6 : 1** | AA (texto normal) |
| `--accent-ink` sobre `--accent` | **6,4 : 1** | AA (texto normal) |
| `--danger` sobre `--paper` | **4,1 : 1** | AA (apenas texto grande + não textual) ⚠ |
| `--success` sobre `--paper` | **9,1 : 1** | AAA |

> ⚠ **Limitação conhecida:** `--danger` sobre `--paper` no tema escuro fica em 4,1 : 1 — passa AA para texto grande e não textual (bordas, ícones), mas não o limiar de 4,5 : 1 para texto corpo. O FormLib usa `--danger` como cor de *borda/ícone* no tema escuro (p.ex., `.btn-danger` usa preenchimento transparente com borda vermelha), não para texto corrido. Se alguma vez você renderizar prosa de erro diretamente em `var(--danger)` sobre `var(--paper)`, troque para `--ink-900` no texto e mantenha o vermelho apenas no ícone/borda.

### Anéis de Foco

O sistema impõe um único estilo visível de foco em toda a aplicação:

```css
*:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: var(--radius-xs);
}
```

Inputs e botões sobrescrevem o outline com `--shadow-focus` (um anel tonal de 3px) para evitar anéis duplos sobre seu próprio chrome já bordado. Fonte: [`src/styles.css`](../src/styles.css).

Não remova outlines de foco em CSS customizado. Se seu elemento parecer visualmente errado com o outline, o ajuste é em `outline-offset`, não em `outline: none`.

## Classes Utilitárias

Classes de propósito único que se compõem em UI industrial sem novo CSS. Todas vivem em `src/styles.css`.

### `.u-mono`

Troca para a família monoespaçada. Use para IDs, códigos, timestamps, tags de status — qualquer coisa em que alinhamento de caracteres ou enquadramento "metadado de sistema" ajude.

```html
<span class="u-mono">EMP-00421</span>
```

### `.u-tag`

Monoespaçada + maiúsculas pequenas + tracking largo. Lê-se como tag de sistema ao lado de conteúdo humano.

```html
<div>
  <span class="u-tag">Status</span>
  <span>Ativo</span>
</div>
```

### `.u-label`

Como `.u-tag`, mas na fonte body. Usada para "rótulos de campo" inline fora de um formulário real.

```html
<div><span class="u-label">Departamento</span> Engenharia</div>
```

### `.u-eyebrow`

Mais apertada que `.u-tag`, tracking mais largo (0.15em). Usada acima de títulos de página para sinalizar seção/contexto.

```html
<div class="u-eyebrow">Admin › Configurações</div>
<h1>Usuários</h1>
```

### `.u-ruler` e `.u-ruler-dashed`

Linhas horizontais afinadas ao sistema de tokens. Prefira-as a `<hr>` puro ou bordas customizadas.

```html
<hr class="u-ruler" />
<hr class="u-ruler-dashed" />
```

### `.u-grid-bg`

Pinta uma grade 32×32 em hairline usando `--border-hairline`. Usada em estados vazios e na tela de login para reforçar a sensação de "layout industrial" sem ilustrações.

```html
<div class="u-grid-bg" style="min-height: 400px;"></div>
```

### `.u-dot` (com modificadores de cor)

Um pequeno ponto de status — círculo de 6px. Padrão é `--ink-400`; quatro modificadores cobrem as cores semânticas.

```html
<span class="u-dot u-dot--success"></span> Online
<span class="u-dot u-dot--warn"></span> Pendente
<span class="u-dot u-dot--danger"></span> Falhou
<span class="u-dot u-dot--accent"></span> Selecionado
```

### `.u-kbd`

Renderiza um chip de tecla de teclado — borda inferior reforçada, monoespaçada, maiúsculas pequenas.

```html
Pressione <span class="u-kbd">Ctrl</span> + <span class="u-kbd">K</span> para buscar.
```

## Blocos Industriais

Classes compostas que montam o scaffolding recorrente de "painel" visto em páginas de lista e edição. São de nível mais alto que utilitários — impõem layout além de estilo.

### `.block` / `.block__head` / `.block__body`

O "painel rotulado" padrão usado em toda página de lista e na maioria das páginas de edição. O head é uma barra pequena em maiúsculas monoespaçadas; o body é conteúdo com padding.

```html
<section class="block">
  <header class="block__head">
    <span class="block__tag">Consulta</span>
    <span class="block__label">Filtrar funcionários</span>
    <span class="block__meta">12 filtros ativos</span>
  </header>
  <div class="block__body">
    <!-- campos de formulário ou tabela -->
  </div>
</section>
```

Variantes:
- `.block__meta--accent` — meta alinhado à direita com régua esquerda e cor de acento.
- `.block__tag` — rótulo em maiúsculas com cor de acento dentro do head.

Usado em: `employee-list.component.html`, `department-list.component.html`, `employee-edit.component.html`, `department-edit.component.html`.

### `.state` / `.state--empty` / `.state--loading`

Placeholders de linha vazia e de carregamento para listas. `.state__mark` é um glifo mono pequeno dentro de um quadrado bordado; `.state__title` e `.state__hint` são os rótulos pareados.

```html
<!-- Vazio -->
<div class="state state--empty">
  <span class="state__mark">∅</span>
  <div>
    <div class="state__title">Nenhum funcionário corresponde aos filtros</div>
    <div class="state__hint">Ajuste ou limpe os filtros para ver todos os registros.</div>
  </div>
</div>

<!-- Carregando -->
<div class="state state--loading">
  <div class="state__bar"></div>
  Carregando registros…
</div>
```

`.state__bar::after` roda uma animação indeterminada de 1.2s (`@keyframes block-slide`). Está preparada para `prefers-reduced-motion: reduce`.

Aplicado via o componente `list-state.component.ts` (núcleo), não diretamente nas features.

### `.batch-indicator`

A pílula que mostra a posição de edição em lote ("2 DE 7") em páginas de edição. Composta de partes `__label`, `__pos`, `__sep`, `__nav`, `__btn`. Os botões de navegação usam `border` no estado de repouso e `--accent` no hover.

```html
<div class="batch-indicator">
  <span class="batch-indicator__label">Lote</span>
  <span class="batch-indicator__pos">2</span>
  <span class="batch-indicator__sep">/</span>
  <span class="batch-indicator__pos">7</span>
  <span class="batch-indicator__nav">
    <button class="batch-indicator__btn" aria-label="Anterior">‹</button>
    <button class="batch-indicator__btn" aria-label="Próximo">›</button>
  </span>
</div>
```

As animações de slide-in (`.batch-slide--next`, `.batch-slide--prev`) envolvem o registro editado durante a navegação. Aplicado via `batch-nav.component.ts` (núcleo).

### `.error-page`

Layout em viewport cheio para páginas 404 / 403. Usa `--grid-line` para a grade de fundo e aceita uma custom property `--error-color` para tingir a marca de canto e a tag.

```html
<div class="error-page">
  <div class="error-page__wrap">
    <div class="error-page__panel" style="--error-color: var(--warn);">
      <div class="error-page__tag">Não encontrado</div>
      <div class="error-page__code">4<span class="slash">0</span>4</div>
      <h1 class="error-page__heading">Esta página saiu do grid</h1>
      <p class="error-page__body">O registro que você editava pode ter sido removido.</p>
      <a class="error-page__cta" href="/">Voltar ao início</a>
    </div>
  </div>
</div>
```

## Guia de Autoria de Componente

Suponha que você esteja adicionando uma nova página de lista **"Log de Auditoria"**. Siga estes passos antes de escrever qualquer CSS.

### 1. Comece pelos blocos existentes

Abra primeiro `employee-list.component.html`. Provavelmente o esqueleto — header `.block`, chips de filtro, `.state` de resultados — já é o que você quer. Copie a estrutura; troque o body.

```html
<section class="block">
  <header class="block__head">
    <span class="block__tag">Log</span>
    <span class="block__label">Eventos de auditoria</span>
    <span class="block__meta">Últimos 30 dias</span>
  </header>
  <div class="block__body">
    <!-- tabela -->
  </div>
</section>
```

### 2. Use tokens, não hex

**Errado:**

```css
.audit-row--highlighted {
  background: #eef1ff;
  border-left: 3px solid #2e5bff;
}
```

Isso fixa o acento do tema claro. No tema escuro a linha brilharia como bug.

**Certo:**

```css
.audit-row--highlighted {
  background: var(--accent-soft);
  border-left: 3px solid var(--accent);
}
```

Agora a linha acompanha o tema automaticamente.

### 3. Recorra a utilitários antes

Precisa de um ID monoespaçado? Use `.u-mono`. Precisa de um pequeno ponto de status? Use `.u-dot--success`. Precisa de um eyebrow de seção? Use `.u-eyebrow`. Só escreva um seletor novo quando nada compõe.

### 4. Coloque suas regras customizadas depois dos tokens

Dentro de `audit-log.component.css`:

```css
/* consome tokens */
.audit-log__timestamp { color: var(--ink-500); font-family: var(--font-mono); }
.audit-log__action    { color: var(--ink-900); font-weight: 500; }
.audit-log__diff      {
  border: 1px solid var(--border-hairline);
  background: var(--ink-50);
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
}
```

Sem hex puro. Sem `#000` / `#fff`. Sem raios arbitrários.

### 5. Verifique ambos os temas antes de entregar

Rode `ng serve`, abra a página, clique no toggle de tema na topstrip. Cada borda, cada cor de texto, cada estado de hover precisa permanecer legível em ambas as superfícies. Se algo quebra, é porque uma regra escapou do sistema de tokens — não é culpa do tema.

## Regras de Extensão

Siga estas ao escrever novo CSS.

1. **Referencie tokens via `var(--nome-do-token)`. Nunca codifique hex.** O tema escuro depende disso.
2. **Nunca use `#fff` ou `#000` diretamente.** Use `var(--paper-elevated)` / `var(--ink-900)` mesmo quando o tema atual combine por acaso.
3. **Um novo token vai em `:root` e em `[data-bs-theme='dark']`.** Tokens definidos só em `:root` vazam seu valor claro para o tema escuro.
4. **Prefira uma classe utilitária existente.** `.u-mono`, `.u-tag`, `.u-dot` poupam três a cinco regras CSS cada.
5. **Overrides do Bootstrap vão na seção de overrides.** Se você acabar sobrescrevendo uma regra `.btn-*` ou `.form-*`, adicione-a à região de overrides do Bootstrap em `src/styles.css`, não dentro de um stylesheet de componente.
6. **Não mexa nos outlines de foco.** A regra global `*:focus-visible` é crítica para acessibilidade. Se algo fica estranho, ajuste espaçamento, não o outline.
7. **Raios param em 6px.** Raios maiores quebram a linguagem industrial. Se precisar de "suave", reconsidere o elemento.
8. **Sombras param em `--shadow`.** Sombras difusas de "glow" não pertencem ao sistema.

## Localização de Arquivos

| Arquivo | O que vive lá |
|---------|---------------|
| [`src/styles.css`](../src/styles.css) | **Fonte da verdade.** Tokens, overrides do Bootstrap, refinamentos de componentes, utilitários, blocos industriais, estilos de error-page. |
| [`src/app/app.component.css`](../src/app/app.component.css) | Layout da shell — topstrip, sidebar, grid principal. Consome apenas tokens. |
| [`src/app/app.component.ts`](../src/app/app.component.ts) | Lógica do toggle de tema (`toggleTheme()`, `applyTheme()`, `localStorage.formlib.theme`). |
| [`src/app/core/components/generic-table/generic-table.component.css`](../src/app/core/components/generic-table/generic-table.component.css) | Overrides específicos de tabela (cabeçalhos sticky, indicadores de ordenação) — consome apenas tokens. |
| [`src/index.html`](../src/index.html) | Tags `<link>` para IBM Plex Sans / Plex Mono, CDN do Bootstrap 5.3, leitura inicial de `data-bs-theme`. |

Todo o resto — componentes de feature, form controls, diálogos — consome este sistema. Nada re-declara tokens.

## Documentos Relacionados

- [Acessibilidade (WCAG 2.1 AA)](./accessibility.pt-BR.md) — contrato ARIA no nível de componente, associação de rótulos, ordem de foco.
- [Arquitetura](./architecture.pt-BR.md) — onde estilos ficam na estratificação geral.
- [Controles de Formulário Principais](./core-form-controls.pt-BR.md) — como os estilos de form control deste documento são efetivamente aplicados.
- [Componentes de Exibição](./display-components.pt-BR.md) — `generic-table`, `generic-header`, sistema de diálogos.
