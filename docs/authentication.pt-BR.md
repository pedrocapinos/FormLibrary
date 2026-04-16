# Autenticação e Autorização
[![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/pedrocapinos/FormLibrary/blob/main/docs/authentication.md)

Um sistema de autenticação mock que protege rotas e controla a visibilidade de elementos da UI com base nas permissões do usuário. Projetado para refletir padrões reais de autenticação (guards, checagem de permissão, modo somente leitura), de modo que substituir por um provedor real exija mudanças mínimas.

## Conceitos

| Termo | Descrição |
|-------|-----------|
| `RecordType` | `'employee' \| 'department'` — a entidade sendo acessada |
| `Action` | `'consult' \| 'new' \| 'edit' \| 'delete'` — o que o usuário quer fazer |
| `Permission` | Um par `{ recordType, action }` concedido a um usuário |

## AuthService

Serviço singleton que mantém o usuário atual e suas permissões em memória. Baseado em sessão — reseta ao recarregar a página, redirecionando para a página de login.

```typescript
import { AuthService } from 'src/app/core/auth/auth.service';
```

**API:**

| Membro | Tipo | Descrição |
|--------|------|-----------|
| `currentUser` | `AuthUser \| null` | O usuário logado, ou `null` |
| `isAuthenticated` | `boolean` | Se há um usuário logado |
| `login(username)` | `Observable<AuthUser \| null>` | Autentica e armazena em cache usuário + permissões |
| `logout()` | `void` | Limpa o usuário atual |
| `can(recordType, action)` | `boolean` | Verifica se o usuário atual possui uma permissão específica |

Nenhum signal ou observable é necessário em templates — `isAuthenticated` e `can()` são getters/métodos síncronos que funcionam com detecção de mudanças padrão.

## Guards de Rota

Dois guards funcionais protegem rotas:

```typescript
import { authGuard, permissionGuard } from 'src/app/core/auth/auth.guard';
```

- **`authGuard`** — redireciona para `/login` se não autenticado
- **`permissionGuard`** — lê `recordType` e `action` de `route.data`, redireciona para `/unauthorized` se negado

**Configuração de rotas:**
```typescript
{ path: '', redirectTo: 'employees', pathMatch: 'full' },
{ path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
{ path: 'unauthorized', loadComponent: () => import('./features/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent) },
{ path: 'playground', loadComponent: () => ..., canActivate: [authGuard] },
{
  path: 'employees',
  loadComponent: () => import('./features/employee/employee-list.component').then(m => m.EmployeeListComponent),
  canActivate: [authGuard, permissionGuard],
  data: { recordType: 'employee', action: 'consult' },
},
{
  path: 'employees/new',
  canActivate: [authGuard, permissionGuard],
  canDeactivate: [unsavedChangesGuard],
  data: { recordType: 'employee', action: 'new' },
  // ...
},
{
  path: 'employees/:id',
  canActivate: [authGuard, permissionGuard],
  canDeactivate: [unsavedChangesGuard],
  data: { recordType: 'employee', action: 'consult' },  // consult, não edit — usuários read-only podem visualizar
  // ...
},
// Rotas de department seguem o mesmo padrão com recordType: 'department'
{ path: 'departments', /* ... */ data: { recordType: 'department', action: 'consult' } },
{ path: 'departments/new', /* ... */ data: { recordType: 'department', action: 'new' } },
{ path: 'departments/:id', /* ... */ data: { recordType: 'department', action: 'consult' } },
// Wildcard 404 (deve ser o último)
{ path: '**', loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent) },
```

## Checagens de Permissão no Template

Cada componente declara seu `recordType` e implementa um método `can()` que delega para `AuthService.can()`:

```typescript
// employee-list.component.ts
readonly recordType: RecordType = 'employee';

can(action: Action): boolean {
  return this.auth.can(this.recordType, action);
}
```

```html
<!-- Parâmetro único — verifica contra o recordType atual -->
@if (can('new')) {
  <button (click)="onNew()">New Employee</button>
}

@if (can('edit') || isNew) {
  <button type="submit">Save</button>
}

@if (!isNew && can('delete')) {
  <button (click)="onDelete()">Delete</button>
}
```

## Modo Somente Leitura

Páginas de edição com permissão apenas de `consult` exibem o registro mas desativam a interação:

- O formulário é desativado via `this.form.disable()` quando o usuário não tem permissão `edit`
- Botões Save e Delete são ocultados
- O título da página se adapta: "View Employee" em vez de "Edit Employee"

## Usuários Mock

| Nome de Usuário | Nome de Exibição | Permissões |
|-----------------|-------------------|------------|
| `admin` | Admin User | Todas as ações em todos os tipos de registro (`employee`, `department`) |
| `viewer` | View-Only User | Apenas `consult` em todos os tipos de registro |
| `employee-manager` | Employee Manager | Todas as ações apenas em `employee` |

## MockAuthApi

Serviço injetável que simula o backend de autenticação. Retorna dados de usuário com atraso de 200ms.

```typescript
import { MockAuthApi } from 'src/app/core/auth/mock-auth.api';
```

| Método | Descrição |
|--------|-----------|
| `getAvailableUsers()` | Retorna nomes de usuário e nomes de exibição (sem permissões) |
| `login(username)` | Retorna o `AuthUser` completo com permissões, ou `null` |

Para substituir por um provedor real, substitua `MockAuthApi` por um serviço que chame sua API real — o `AuthService`, os guards e os wrappers `can()` dos componentes permanecem inalterados.
