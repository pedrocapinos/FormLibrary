# Navegação Transversal
[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/navigation.md)

Seis recursos de navegação que trabalham em conjunto com o sistema de autenticação para prover uma experiência completa de roteamento.

## 1. Guard de Alterações Não Salvas

Impede que usuários saiam acidentalmente de uma página de edição com alterações pendentes. Usa um guard `canDeactivate` que realiza comparação profunda dos valores atuais do formulário contra os valores originais do registro (usando `structuredClone` + `JSON.stringify`), em vez de depender do flag `dirty` do formulário.

```typescript
import { unsavedChangesGuard, HasUnsavedChanges } from 'src/app/core/auth/unsaved-changes.guard';
```

**Interface:** Componentes de edição devem implementar `HasUnsavedChanges`:

```typescript
interface HasUnsavedChanges {
  form: FormGroup;
  saving: boolean;              // Pula prompt durante submissão do formulário
  deleting: boolean;            // Pula prompt durante exclusão
  hasUnsavedChanges(): boolean; // Comparação profunda de valores atuais vs originais
}
```

**Implementação em componentes de edição:**
```typescript
// Quando o formato do formulário corresponde ao formato do modelo (form plano):
private originalValues = structuredClone(this.form.getRawValue());
hasUnsavedChanges(): boolean {
  return JSON.stringify(this.form.getRawValue()) !== JSON.stringify(this.originalValues);
}

// Quando o formulário usa sub-grupos (form aninhado com camada de mapeamento):
private originalModel: Employee = this.formToModel();
hasUnsavedChanges(): boolean {
  return JSON.stringify(this.formToModel()) !== JSON.stringify(this.originalModel);
}
```

**Configuração de rota:**
```typescript
{
  path: 'employees/:id',
  canDeactivate: [unsavedChangesGuard],
  // ...
}
```

**Comportamento:**
- Nenhuma alteração detectada (valores coincidem com os originais) → navegação permitida silenciosamente
- Alterações detectadas → `ConfirmDialogService` pergunta ao usuário se deseja sair
- `saving` ou `deleting` é `true` → navegação permitida silenciosamente (submissão em andamento)
- Editar um campo de volta ao valor original → sem prompt (ao contrário do flag `dirty`, que permanece true)

## 2. Deep Linking Após Login

Quando um usuário não autenticado tenta acessar uma rota protegida, `authGuard` redireciona para `/login` preservando a URL pretendida como query parameter `returnUrl`. Após login bem-sucedido, o usuário é redirecionado ao destino original em vez de uma página padrão.

**Fluxo:**
1. Usuário acessa `/employees/42` → `authGuard` redireciona para `/login?returnUrl=/employees/42`
2. Página de login lê `returnUrl` de `ActivatedRoute.snapshot.queryParams`
3. Após `AuthService.login()` ter sucesso, `router.navigateByUrl(returnUrl)` envia o usuário para `/employees/42`
4. Se não houver `returnUrl`, volta para `/employees`

## 3. Sidebar Sensível a Permissões

A navegação da sidebar em `AppComponent` renderiza condicionalmente links conforme as permissões do usuário atual:

```html
@if (auth.isAuthenticated) {
  <!-- conteúdo da sidebar -->
  @if (auth.can('employee', 'consult')) {
    <a routerLink="/employees">Employees</a>
  }
}
```

Usuários só veem links para páginas nas quais têm ao menos permissão `consult`. A sidebar inteira é ocultada na página de login.

## 4. Navegação de Retorno à Origem

`NavigationService` provê um padrão de URL de retorno de uso único, de modo que botões "Voltar" em páginas de edição retornem o usuário ao local de onde veio, não a uma rota fixa. Componentes de lista e edição usam `NavigationService` junto com `Router` e `BatchOperationsService` diretamente.

```typescript
import { NavigationService } from 'src/app/core/services/navigation.service';
```

**API:**

| Método | Descrição |
|--------|-----------|
| `setReturnUrl(url)` | Armazena a URL de retorno (chamado pela lista antes de navegar para edição) |
| `consumeReturnUrl()` | Recupera e limpa a URL de retorno; retorna `null` se não definida |
| `returnUrl` (getter) | Lê a URL de retorno atual sem consumi-la |

**Uso em componentes de lista:**
```typescript
onRowClick(employee: Employee): void {
  this.navigationService.setReturnUrl('/employees');
  this.router.navigate(['/employees', employee.id]);
}
```

**Uso em componentes de edição:**
```typescript
private returnUrl = '/employees'; // fallback

ngOnInit() {
  this.returnUrl = this.navigationService.consumeReturnUrl() ?? '/employees';
}

onBack() {
  if (this.batchOperationsService.isBatching) {
    this.batchOperationsService.finish();
    return;
  }
  this.router.navigateByUrl(this.returnUrl);
}
```

O padrão `consumeReturnUrl()` garante que a URL seja usada uma única vez — leituras subsequentes retornam `null`, impedindo navegação obsoleta.

## 5. Página 404 Não Encontrada

Uma rota wildcard (`**`) captura todas as URLs não correspondidas e exibe uma página estilizada "Page Not Found" com um link de volta para a home.

```typescript
// app.routes.ts
{ path: '**', loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent) }
```

Esta rota deve ser a última entrada no array de rotas.

## 6. Indicador de Carregamento

`AppComponent` assina eventos do router para exibir uma barra fina de progresso no topo da área de conteúdo durante transições de rota — o mesmo padrão usado por GitHub e YouTube. A barra é absolutamente posicionada dentro de `<main>`, de modo a não causar deslocamento de layout.

```typescript
navigating = false;

ngOnInit() {
  this.routerSub = this.router.events.subscribe(event => {
    if (event instanceof NavigationStart) this.navigating = true;
    else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
      this.navigating = false;
    }
  });
}
```

```html
<main class="flex-grow-1 overflow-auto position-relative">
  @if (navigating) {
    <div class="route-loading-bar"></div>
  }
  <router-outlet />
</main>
```

A `.route-loading-bar` é uma barra de 3px de altura com animação CSS indeterminada de deslizamento. Aparece durante transições de rota com lazy-loading e resolução de guards, e é ocultada em `NavigationEnd`, `NavigationCancel` ou `NavigationError`. A assinatura é liberada em `ngOnDestroy`.
