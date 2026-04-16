# Design System
[![pt-br](https://img.shields.io/badge/lang-pt--br-green.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/design-system.pt-BR.md)

FormLib ships with an **industrial** design language — crisp borders, tabular numerals, monospace accents, low-radius surfaces, restrained shadows. This page is the reference for the tokens, utilities, and reusable blocks that power every screen. Read it before building a new page or adding new CSS.

The entire system lives in [`src/styles.css`](../src/styles.css). There is no SCSS layer, no preprocessor, and no component library to adopt — only CSS custom properties, Bootstrap 5.3 variable overrides, and a handful of utility classes.

## Table of Contents

- [Principles](#principles)
- [Pipeline](#pipeline)
- [Design Tokens](#design-tokens)
- [Theming](#theming)
- [Typography](#typography)
- [Accessibility & Contrast](#accessibility--contrast)
- [Utility Classes](#utility-classes)
- [Industrial Blocks](#industrial-blocks)
- [Component Authoring Walkthrough](#component-authoring-walkthrough)
- [Extension Rules](#extension-rules)
- [File Locations](#file-locations)
- [Related Docs](#related-docs)

## Principles

1. **Tokens, not hex.** Every color, radius, shadow, duration is a CSS custom property. Hardcoded hex values are a bug — they break dark mode.
2. **Bootstrap as the substrate, not the identity.** Bootstrap 5.3 gives the grid, utilities, reset, and component skeletons. The *look* comes from token overrides layered on top.
3. **Crisp over soft.** Radii cap at 6px. Shadows never blur more than 12px. Borders are hairline-to-strong, never colored.
4. **Tabular numerals everywhere.** ERP screens align numbers in columns — `font-variant-numeric: tabular-nums` is applied globally in `src/styles.css`.
5. **Uppercase labels, monospace tags.** Form labels, table headers, and metadata chips use small uppercase tracking to signal "system UI" rather than content.
6. **Runtime theming.** Themes swap via a single `data-bs-theme` attribute on `<html>`. All tokens resolve at runtime — no rebuild needed to flip themes.

## Pipeline

The stylesheet is organized in four layers, in this order:

```
┌─────────────────────────────────────────┐
│ 1. Design tokens                        │  :root + [data-bs-theme='dark']
├─────────────────────────────────────────┤
│ 2. Bootstrap variable overrides         │  --bs-* mapped to our tokens
├─────────────────────────────────────────┤
│ 3. Component refinements                │  .btn, .form-control, .table, ...
├─────────────────────────────────────────┤
│ 4. Utilities & industrial blocks        │  .u-*, .block, .state, .error-page
└─────────────────────────────────────────┘
```

Downstream layers **consume** tokens; they never redefine them. New styles should follow the same order inside their own component CSS file: token reads first, compositions second.

## Design Tokens

All tokens are declared in [`src/styles.css`](../src/styles.css) under the design-tokens section. The light-theme values are on `:root`; the dark-theme overrides are on `[data-bs-theme='dark']`.

### Ink Scale

A neutral scale that inverts between themes. `ink-900` is always the darkest foreground, `ink-50` is always the lightest surface. In dark mode the scale *flips semantically* — `ink-900` becomes near-white — so the same rule (`color: var(--ink-900)`) produces legible text on either surface.

| Token | Light | Dark | Purpose |
|-------|-------|------|---------|
| `--ink-900` | `#0a0a0a` | `#ececea` | Primary text, headings |
| `--ink-800` | `#161616` | `#dcdcd8` | Body text on elevated surfaces |
| `--ink-700` | `#242424` | `#c4c4c0` | Button labels, list items |
| `--ink-500` | `#4a4a47` | `#8a8a84` | Secondary text, meta |
| `--ink-400` | `#70706a` | `#6a6a64` | Disabled text, decorative marks |
| `--ink-300` | `#9a9a94` | `#4e4e48` | Placeholders, dimmed content |
| `--ink-200` | `#c7c7c1` | `#33332f` | Scrollbar thumb, rule accents |
| `--ink-100` | `#e5e5e0` | `#24241f` | Tertiary surfaces (badges, muted bg) |
| `--ink-50`  | `#f3f3ee` | `#17171a` | Row hover, table headers |
| `--paper` | `#fafaf7` | `#0b0c0e` | Page background |
| `--paper-elevated` | `#ffffff` | `#121317` | Cards, modals, form controls |

### Accent

A single brand-blue family. `--accent-ink` is the color that goes *on top of* `--accent` (label text inside a primary button).

| Token | Light | Dark | Purpose |
|-------|-------|------|---------|
| `--accent` | `#2e5bff` | `#6e8bff` | Primary buttons, focus ring, links |
| `--accent-hover` | `#1d45d9` | `#8aa0ff` | Hover/active state |
| `--accent-ink` | `#ffffff` | `#0a0a0a` | Text/icon on accent fill |
| `--accent-soft` | `#eef1ff` | `rgba(110,139,255,0.12)` | Selected row tint, subtle emphasis |

### State

Semantic colors for non-neutral feedback. Constant across themes — a warning stays amber regardless of theme.

| Token | Value | Purpose |
|-------|-------|---------|
| `--warn` | `#f59e0b` | Warning buttons, pending state |
| `--danger` | `#dc2626` | Destructive actions, invalid input |
| `--success` | `#10b981` | Confirmation, positive status |

### Borders

RGBA-based, so they adapt correctly over either surface. Never use raw `#000` or `#fff` for borders.

| Token | Light | Dark | Purpose |
|-------|-------|------|---------|
| `--border` | `rgba(10,10,10,0.12)` | `rgba(255,255,255,0.10)` | Default component border |
| `--border-strong` | `rgba(10,10,10,0.28)` | `rgba(255,255,255,0.24)` | Emphasized containers (`.block`, form check) |
| `--border-hairline` | `rgba(10,10,10,0.08)` | `rgba(255,255,255,0.06)` | Table row dividers |

### Typography

| Token | Value |
|-------|-------|
| `--font-display` | `'IBM Plex Sans', system-ui, -apple-system, sans-serif` |
| `--font-body` | `'IBM Plex Sans', system-ui, -apple-system, sans-serif` |
| `--font-mono` | `'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace` |

IBM Plex is loaded from Google Fonts in `src/index.html`. Display and body share the same family by design — the distinction is only in weight and tracking.

### Radii

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-xs` | `2px` | Badges, keyboard chips, form check |
| `--radius-sm` | `3px` | Buttons, inputs |
| `--radius` | `4px` | Cards, list groups |
| `--radius-lg` | `6px` | Modals, the biggest surfaces |

### Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-xs` | `0 1px 0 rgba(10,10,10,0.04)` | Card rim-light |
| `--shadow-sm` | `0 1px 2px ..., 0 1px 0 ...` | Button hover lift |
| `--shadow` | `0 4px 12px rgba(10,10,10,0.08)` | Modal, popover |
| `--shadow-focus` | `0 0 0 3px rgba(46,91,255,0.18)` | Focus ring on inputs/buttons |

### Motion

| Token | Value | Usage |
|-------|-------|-------|
| `--ease` | `cubic-bezier(0.2, 0, 0, 1)` | Standard easing |
| `--dur-1` | `120ms` | Hover, focus, small state changes |
| `--dur-2` | `200ms` | Dialog open/close, larger transitions |

## Theming

### How the Toggle Works

The light ↔ dark flip is a single attribute swap on `<html>`, managed by the shell in `src/app/app.component.ts`:

```typescript
// app.component.ts (simplified)
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

`src/index.html` initializes `data-bs-theme="light"` on `<html>` so the first paint is never unstyled; `AppComponent.ngOnInit` then restores the saved preference.

Because every color in the system reads from a token, the DOM never re-renders — only the CSS variable values change, and the browser repaints once.

### Why Not `prefers-color-scheme`?

Users working a long ERP shift want the theme **they** chose, not the one their OS guessed at midnight. The design system supports `prefers-color-scheme` in principle — you could add an `@media (prefers-color-scheme: dark)` block alongside `[data-bs-theme='dark']` — but the current shell stores an explicit user preference in `localStorage.formlib.theme`. This is deliberate.

### Attribute, Not Class

Bootstrap 5.3 reads `data-bs-theme`, so we reuse it. That means Bootstrap's own dark-mode utilities (e.g., `.text-bg-dark`) keep working without extra wiring.

### Adding a Theme-Aware Token

Any new token **must** be defined in both blocks:

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

A token that is defined only in `:root` will inherit its light value into dark mode, and is almost always a bug.

## Typography

### Headings

All headings use `--font-display`, weight 500 by default, with negative letter-spacing that tightens as size grows. Source: [`src/styles.css`](../src/styles.css).

| Level | Font size | Weight | Letter-spacing |
|-------|-----------|--------|----------------|
| `h1` / `.h1` | `2rem` (32px) | 600 | `-0.035em` |
| `h2` / `.h2` | `1.5rem` (24px) | 500 | `-0.025em` |
| `h3` / `.h3` | `1.25rem` (20px) | 500 | `-0.02em` (inherited) |
| `h4` / `.h4` | `1rem` (16px) | 600 | `-0.02em` (inherited) |

```html
<h1>Employees</h1>
<h2>Personal details</h2>
<h3>Contact</h3>
<h4>Phone numbers</h4>
```

### Body

```css
body {
  font-size: 14px;
  letter-spacing: -0.005em;
  font-feature-settings: 'cv11', 'ss01', 'ss03';
}
```

The three `font-feature-settings` turn on IBM Plex's alternate characters — a slashed zero, single-story *a*, and ss03 ligatures — tuned for dense numeric screens.

### Form Labels

Form labels follow a specific industrial convention: small, uppercase, tracked wide. Source: [`src/styles.css`](../src/styles.css).

```css
.form-label {
  font-size: 0.6875rem;   /* 11px */
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-500);
}
```

This is applied automatically to any `<label class="form-label">` or label rendered by a FormLib form control — you do not write these rules yourself.

### Tabular Numerals

Applied globally to tables, form controls, code, and pre blocks:

```css
table, .form-control, .table, code, pre, .font-monospace {
  font-variant-numeric: tabular-nums;
}
```

This is why salary columns line up without explicit width rules.

## Accessibility & Contrast

All foreground/background token pairs are verified against **WCAG 2.1 Level AA**. The library's broader accessibility contract is documented in [`accessibility.md`](./accessibility.md); this section focuses specifically on the color system.

### WCAG AA Thresholds

- Normal body text: **4.5:1**
- Large text (≥ 18pt regular or ≥ 14pt bold): **3:1**
- Non-text UI (icons, borders, focus rings): **3:1**

### Contrast Matrix

Contrast ratios computed using the WCAG 2.1 relative-luminance formula.

#### Light Theme

| Pair | Ratio | WCAG |
|------|-------|------|
| `--ink-900` on `--paper` | **18.9 : 1** | AAA |
| `--ink-800` on `--paper-elevated` | **16.8 : 1** | AAA |
| `--ink-700` on `--paper-elevated` | **14.1 : 1** | AAA |
| `--ink-500` on `--paper` | **8.5 : 1** | AAA |
| `--ink-400` on `--paper` | **4.6 : 1** | AA (normal text) |
| `--accent-ink` on `--accent` | **5.2 : 1** | AA (normal text) |
| `--danger` on `--paper` | **4.6 : 1** | AA (normal text) |
| `--warn` on `--ink-900` (`.btn-warning:hover`) | **9.8 : 1** | AAA |
| `--success` on `--paper-elevated` | **3.3 : 1** | AA (large text / non-text only) |

#### Dark Theme

| Pair | Ratio | WCAG |
|------|-------|------|
| `--ink-900` on `--paper` | **16.5 : 1** | AAA |
| `--ink-800` on `--paper-elevated` | **13.2 : 1** | AAA |
| `--ink-700` on `--paper-elevated` | **9.7 : 1** | AAA |
| `--ink-500` on `--paper` | **4.6 : 1** | AA (normal text) |
| `--accent-ink` on `--accent` | **6.4 : 1** | AA (normal text) |
| `--danger` on `--paper` | **4.1 : 1** | AA (large text + non-text only) ⚠ |
| `--success` on `--paper` | **9.1 : 1** | AAA |

> ⚠ **Known constraint:** `--danger` on `--paper` in dark mode sits at 4.1 : 1 — passes AA for large text and non-text (borders, icons), but not the 4.5 : 1 threshold for body text. FormLib uses `--danger` as a *border/icon* color in dark mode (e.g., `.btn-danger` uses a transparent fill with a red border), not for running text. If you ever render error prose directly in `var(--danger)` on `var(--paper)`, swap to `--ink-900` for the text and keep red only for the icon/border.

### Focus Rings

The system enforces one visible focus style across the whole app:

```css
*:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: var(--radius-xs);
}
```

Inputs and buttons override the outline with `--shadow-focus` (a 3px tinted ring) to avoid double-rings on their own bordered chrome. Source: [`src/styles.css`](../src/styles.css).

Do not remove focus outlines in custom CSS. If your element looks visually wrong with the outline, the fix is to adjust `outline-offset`, not to `outline: none`.

## Utility Classes

Single-purpose classes that compose into industrial UI without new CSS. All live in `src/styles.css`.

### `.u-mono`

Switches to the monospace stack. Use for IDs, codes, timestamps, status tags — anything where character alignment or "system metadata" framing helps.

```html
<span class="u-mono">EMP-00421</span>
```

### `.u-tag`

Monospace + small uppercase + wide tracking. Reads as a system tag next to human content.

```html
<div>
  <span class="u-tag">Status</span>
  <span>Active</span>
</div>
```

### `.u-label`

Like `.u-tag` but in the body font. Used for inline "field labels" outside a real form.

```html
<div><span class="u-label">Department</span> Engineering</div>
```

### `.u-eyebrow`

Tighter than `.u-tag`, looser tracking (0.15em). Used above page titles to signal section/context.

```html
<div class="u-eyebrow">Admin › Settings</div>
<h1>Users</h1>
```

### `.u-ruler` and `.u-ruler-dashed`

Horizontal rules tuned to the token system. Prefer these to raw `<hr>` or custom borders.

```html
<hr class="u-ruler" />
<hr class="u-ruler-dashed" />
```

### `.u-grid-bg`

Paints a 32×32 hairline grid using `--border-hairline`. Used on empty states and the login page to reinforce the "industrial layout" feel without illustrations.

```html
<div class="u-grid-bg" style="min-height: 400px;"></div>
```

### `.u-dot` (with color modifiers)

A small status dot — 6px circle. Default is `--ink-400`; four modifiers cover the semantic colors.

```html
<span class="u-dot u-dot--success"></span> Online
<span class="u-dot u-dot--warn"></span> Pending
<span class="u-dot u-dot--danger"></span> Failed
<span class="u-dot u-dot--accent"></span> Selected
```

### `.u-kbd`

Renders a keyboard-key chip — bottom-heavy border, monospace, small uppercase.

```html
Press <span class="u-kbd">Ctrl</span> + <span class="u-kbd">K</span> to search.
```

## Industrial Blocks

Composite classes that build the recurring "panel" scaffolding seen across list and edit pages. These are higher-level than utilities — they impose layout as well as style.

### `.block` / `.block__head` / `.block__body`

The standard "labeled panel" used on every list page and most edit pages. The head is a small uppercase mono bar; the body is padded content.

```html
<section class="block">
  <header class="block__head">
    <span class="block__tag">Query</span>
    <span class="block__label">Filter employees</span>
    <span class="block__meta">12 active filters</span>
  </header>
  <div class="block__body">
    <!-- form fields or table -->
  </div>
</section>
```

Variants:
- `.block__meta--accent` — right-aligned meta with a left rule and accent color.
- `.block__tag` — accent-colored uppercase label inside the head.

Used in: `employee-list.component.html`, `department-list.component.html`, `employee-edit.component.html`, `department-edit.component.html`.

### `.state` / `.state--empty` / `.state--loading`

The empty-row and loading placeholders for lists. `.state__mark` is a small mono glyph inside a bordered square; `.state__title` and `.state__hint` are the paired labels.

```html
<!-- Empty -->
<div class="state state--empty">
  <span class="state__mark">∅</span>
  <div>
    <div class="state__title">No employees match your filters</div>
    <div class="state__hint">Adjust filters or clear them to see all records.</div>
  </div>
</div>

<!-- Loading -->
<div class="state state--loading">
  <div class="state__bar"></div>
  Loading records…
</div>
```

`.state__bar::after` runs a 1.2s indeterminate animation (`@keyframes block-slide`). It is wired for `prefers-reduced-motion: reduce`.

### `.batch-indicator`

The pill that shows batch-edit position ("2 OF 7") on edit pages. Composed of `__label`, `__pos`, `__sep`, `__nav`, `__btn` parts. Navigation buttons use `border` in the rest state and `--accent` on hover.

```html
<div class="batch-indicator">
  <span class="batch-indicator__label">Batch</span>
  <span class="batch-indicator__pos">2</span>
  <span class="batch-indicator__sep">/</span>
  <span class="batch-indicator__pos">7</span>
  <span class="batch-indicator__nav">
    <button class="batch-indicator__btn" aria-label="Previous">‹</button>
    <button class="batch-indicator__btn" aria-label="Next">›</button>
  </span>
</div>
```

The slide-in animations (`.batch-slide--next`, `.batch-slide--prev`) wrap the edited record during navigation.

### `.error-page`

Full-viewport layout for 404 / 403 pages. Uses `--grid-line` for the background grid and accepts a `--error-color` custom property to tint the corner mark and tag.

```html
<div class="error-page">
  <div class="error-page__wrap">
    <div class="error-page__panel" style="--error-color: var(--warn);">
      <div class="error-page__tag">Not found</div>
      <div class="error-page__code">4<span class="slash">0</span>4</div>
      <h1 class="error-page__heading">This page drifted off the grid</h1>
      <p class="error-page__body">The record you were editing may have been removed.</p>
      <a class="error-page__cta" href="/">Return home</a>
    </div>
  </div>
</div>
```

## Component Authoring Walkthrough

Suppose you are adding a new **"Audit Log"** list page. Walk through these steps before writing any CSS.

### 1. Start from existing blocks

Look at `employee-list.component.html` first. Odds are the skeleton — `.block` header, filter pills, results `.state` — is already what you want. Copy its structure; swap the body.

```html
<section class="block">
  <header class="block__head">
    <span class="block__tag">Log</span>
    <span class="block__label">Audit events</span>
    <span class="block__meta">Last 30 days</span>
  </header>
  <div class="block__body">
    <!-- table -->
  </div>
</section>
```

### 2. Use tokens, not hex

**Wrong:**

```css
.audit-row--highlighted {
  background: #eef1ff;
  border-left: 3px solid #2e5bff;
}
```

This hardcodes the light-mode accent. In dark mode the row would glow like a bug.

**Right:**

```css
.audit-row--highlighted {
  background: var(--accent-soft);
  border-left: 3px solid var(--accent);
}
```

Now the row tracks the theme automatically.

### 3. Reach for utilities first

Need a monospace event ID? Use `.u-mono`. Need a small status dot? Use `.u-dot--success`. Need a section eyebrow? Use `.u-eyebrow`. Only write a new selector when nothing composes.

### 4. Place your custom rules after tokens

Inside `audit-log.component.css`:

```css
/* consume tokens */
.audit-log__timestamp { color: var(--ink-500); font-family: var(--font-mono); }
.audit-log__action    { color: var(--ink-900); font-weight: 500; }
.audit-log__diff      {
  border: 1px solid var(--border-hairline);
  background: var(--ink-50);
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
}
```

No raw hex. No `#000` / `#fff`. No bespoke radii.

### 5. Check both themes before shipping

Run `ng serve`, open the page, click the theme toggle in the topstrip. Every border, every text color, every hover state must stay legible on both surfaces. If something breaks, it is because a rule escaped the token system — not because the theme is at fault.

## Extension Rules

Follow these when you cannot avoid writing new CSS.

1. **Reference tokens via `var(--token-name)`. Never hardcode hex.** Dark mode depends on it.
2. **Never use `#fff` or `#000` directly.** Use `var(--paper-elevated)` / `var(--ink-900)` even when the current theme happens to match.
3. **A new token goes in both `:root` and `[data-bs-theme='dark']`.** Tokens defined only on `:root` leak their light value into dark mode.
4. **Prefer an existing utility class.** `.u-mono`, `.u-tag`, `.u-dot` save you three to five CSS rules each.
5. **Bootstrap overrides go in the overrides section.** If you find yourself overriding a `.btn-*` or `.form-*` rule, add it to the Bootstrap-overrides region of `src/styles.css`, not inside a component stylesheet.
6. **Don't touch focus outlines.** The global `*:focus-visible` rule is load-bearing for accessibility. If something looks off, adjust spacing, not the outline itself.
7. **Radii stop at 6px.** Larger radii break the industrial language. If you need "soft," reconsider the element.
8. **Shadows stop at `--shadow`.** Diffused "glow" shadows are not in the system.

## File Locations

| File | What lives there |
|------|------------------|
| [`src/styles.css`](../src/styles.css) | **Source of truth.** Tokens, Bootstrap overrides, component refinements, utilities, industrial blocks, error-page styles. |
| [`src/app/app.component.css`](../src/app/app.component.css) | Shell layout — topstrip, sidebar, main grid. Consumes tokens only. |
| [`src/app/app.component.ts`](../src/app/app.component.ts) | Theme toggle logic (`toggleTheme()`, `applyTheme()`, `localStorage.formlib.theme`). |
| [`src/app/core/components/generic-table/generic-table.component.css`](../src/app/core/components/generic-table/generic-table.component.css) | Table-specific overrides (sticky headers, sort indicators) — consumes tokens only. |
| [`src/index.html`](../src/index.html) | IBM Plex Sans / Plex Mono `<link>` tags, Bootstrap 5.3 CDN, initial `data-bs-theme` read. |

Everything else — feature components, form controls, dialogs — consumes this system. Nothing re-declares tokens.

## Related Docs

- [Accessibility (WCAG 2.1 AA)](./accessibility.md) — component-level ARIA contract, label association, focus order.
- [Architecture](./architecture.md) — where styles sit in the overall layering.
- [Core Form Controls](./core-form-controls.md) — how the form-control styles in this doc actually get applied.
- [Display Components](./display-components.md) — `generic-table`, `generic-header`, dialog system.
