import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'unauthorized',
  standalone: true,
  imports: [RouterLink],
  host: { class: 'error-page', style: '--error-color: var(--warn)' },
  template: `
    <div class="error-page__wrap">
      <div class="error-page__panel">
        <div class="error-page__tag">Error / 403</div>
        <div class="error-page__code">403</div>
        <h1 class="error-page__heading">Access denied</h1>
        <p class="error-page__body">
          Your current role lacks permission for this resource. Switch operator
          or request elevation from an administrator.
        </p>
        <a routerLink="/employees" class="error-page__cta">Return to records →</a>
      </div>
    </div>
  `,
})
export class UnauthorizedComponent {}
