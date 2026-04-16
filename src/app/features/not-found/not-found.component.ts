import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'not-found',
  standalone: true,
  imports: [RouterLink],
  host: { class: 'error-page' },
  template: `
    <div class="error-page__wrap">
      <div class="error-page__panel">
        <div class="error-page__tag">Error / 404</div>
        <div class="error-page__code">404</div>
        <h1 class="error-page__heading">Page not found</h1>
        <p class="error-page__body">
          The requested route did not match any registered component. It may
          have been moved, renamed, or never existed.
        </p>
        <a routerLink="/employees" class="error-page__cta">Return to records →</a>
      </div>
    </div>
  `,
})
export class NotFoundComponent {}
