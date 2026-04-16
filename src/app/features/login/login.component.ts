import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { MockAuthApi } from '../../core/auth/mock-auth.api';

@Component({
  selector: 'login',
  standalone: true,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        background:
          linear-gradient(var(--grid-line) 1px, transparent 1px) 0 0 / 48px 48px,
          linear-gradient(90deg, var(--grid-line) 1px, transparent 1px) 0 0 / 48px 48px,
          var(--ink-50);
        color: var(--ink-900);
      }

      .shell {
        display: grid;
        grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
        min-height: 100vh;
      }

      @media (max-width: 900px) {
        .shell {
          grid-template-columns: 1fr;
        }
        .rail {
          display: none;
        }
      }

      .rail {
        position: relative;
        padding: 3rem 3rem 2rem;
        border-right: 1px solid var(--border-strong);
        background: var(--ink-50);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        overflow: hidden;
      }

      .rail::before {
        content: '';
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at 85% 15%, var(--accent-soft), transparent 50%),
          radial-gradient(circle at 10% 90%, rgba(0, 0, 0, 0.04), transparent 50%);
        pointer-events: none;
      }

      .brand-mark {
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
        font-family: var(--font-mono);
        font-size: 0.75rem;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--ink-700);
      }

      .brand-mark .dot {
        width: 10px;
        height: 10px;
        background: var(--accent);
        border-radius: 1px;
        box-shadow: 0 0 0 3px var(--accent-soft);
      }

      .wordmark {
        position: relative;
        margin: 3.5rem 0 2rem;
        font-family: var(--font-display);
        font-weight: 700;
        font-size: clamp(3rem, 6vw, 4.75rem);
        line-height: 0.95;
        letter-spacing: -0.04em;
        color: var(--ink-900);
      }

      .wordmark .accent {
        color: var(--accent);
      }

      .wordmark .slash {
        display: inline-block;
        margin: 0 0.15em;
        color: var(--ink-400);
        font-weight: 400;
      }

      .tagline {
        position: relative;
        max-width: 34ch;
        font-size: 1.0625rem;
        line-height: 1.55;
        color: var(--ink-700);
        margin-bottom: 2rem;
      }

      .specs {
        position: relative;
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.5rem 1.25rem;
        padding: 1.25rem 0;
        border-top: 1px solid var(--border);
        border-bottom: 1px solid var(--border);
        font-family: var(--font-mono);
        font-size: 0.75rem;
        line-height: 1.6;
      }

      .specs dt {
        color: var(--ink-500);
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }

      .specs dd {
        margin: 0;
        color: var(--ink-900);
      }

      .footer-mark {
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        font-family: var(--font-mono);
        font-size: 0.6875rem;
        color: var(--ink-500);
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }

      .panel {
        padding: 3rem 3rem 2rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
        max-width: 560px;
        width: 100%;
        margin-inline: auto;
      }

      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-family: var(--font-mono);
        font-size: 0.6875rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--accent);
        margin-bottom: 0.75rem;
      }

      .eyebrow::before {
        content: '';
        display: inline-block;
        width: 1.5rem;
        height: 1px;
        background: var(--accent);
      }

      h1.heading {
        font-family: var(--font-display);
        font-weight: 600;
        font-size: 1.75rem;
        letter-spacing: -0.01em;
        margin-bottom: 0.5rem;
        color: var(--ink-900);
      }

      .heading-sub {
        color: var(--ink-600);
        font-size: 0.9375rem;
        margin-bottom: 2.25rem;
      }

      .users-label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-family: var(--font-mono);
        font-size: 0.6875rem;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--ink-500);
        margin-bottom: 0.75rem;
      }

      .user-list {
        display: flex;
        flex-direction: column;
        border: 1px solid var(--border-strong);
        background: var(--paper);
      }

      .user-row {
        all: unset;
        cursor: pointer;
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
        gap: 1rem;
        padding: 0.9rem 1.1rem;
        border-bottom: 1px solid var(--border);
        transition: background 120ms ease, color 120ms ease;
        position: relative;
      }

      .user-row:last-child {
        border-bottom: 0;
      }

      .user-row:hover:not(:disabled),
      .user-row:focus-visible {
        background: var(--ink-100);
        outline: none;
      }

      .user-row:focus-visible {
        box-shadow: inset 0 0 0 2px var(--accent);
      }

      .user-row:disabled {
        opacity: 0.55;
        cursor: wait;
      }

      .user-row .who {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }

      .user-row .name {
        font-family: var(--font-display);
        font-weight: 600;
        font-size: 0.9375rem;
        color: var(--ink-900);
        letter-spacing: -0.005em;
      }

      .user-row .uname {
        font-family: var(--font-mono);
        font-size: 0.75rem;
        color: var(--ink-500);
        margin-top: 2px;
      }

      .user-row .arrow {
        font-family: var(--font-mono);
        color: var(--ink-400);
        font-size: 1rem;
        transition: transform 120ms ease, color 120ms ease;
      }

      .user-row:hover:not(:disabled) .arrow {
        color: var(--accent);
        transform: translateX(2px);
      }

      .skeleton {
        display: flex;
        flex-direction: column;
        gap: 1px;
        border: 1px solid var(--border-strong);
        background: var(--border);
      }

      .skeleton-row {
        height: 58px;
        background: var(--paper);
        position: relative;
        overflow: hidden;
      }

      .skeleton-row::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          transparent 0%,
          var(--ink-100) 50%,
          transparent 100%
        );
        animation: sweep 1.4s infinite;
      }

      @keyframes sweep {
        from {
          transform: translateX(-100%);
        }
        to {
          transform: translateX(100%);
        }
      }

      .status-bar {
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid var(--border);
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-family: var(--font-mono);
        font-size: 0.6875rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--ink-500);
      }

      .status-bar .live {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
      }

      .status-bar .live::before {
        content: '';
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--success);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--success) 20%, transparent);
      }

      .load-entry {
        animation: rise 360ms cubic-bezier(0.22, 1, 0.36, 1) backwards;
      }

      .load-entry:nth-child(1) {
        animation-delay: 40ms;
      }
      .load-entry:nth-child(2) {
        animation-delay: 80ms;
      }
      .load-entry:nth-child(3) {
        animation-delay: 120ms;
      }
      .load-entry:nth-child(4) {
        animation-delay: 160ms;
      }
      .load-entry:nth-child(5) {
        animation-delay: 200ms;
      }
      .load-entry:nth-child(6) {
        animation-delay: 240ms;
      }

      @keyframes rise {
        from {
          opacity: 0;
          transform: translateY(6px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
  template: `
    <div class="shell">
      <aside class="rail">
        <div>
          <h2 class="wordmark">
            Form<span class="slash">/</span><span class="accent">Lib</span>
          </h2>
          <p class="tagline">
            A precision reactive-forms toolkit. Typed controls, honest validators,
            minimal surface.
          </p>
        </div>
      </aside>

      <section class="panel">
        <div class="eyebrow">Access</div>
        <h1 class="heading">Select an operator</h1>
        <p class="heading-sub">
          This is a demo environment. Pick any of the mock users below to enter
          the workspace.
        </p>

        <div class="users-label">
          <span>Available operators</span>
        </div>

        @if (loading) {
          <div class="skeleton">
            <div class="skeleton-row"></div>
            <div class="skeleton-row"></div>
            <div class="skeleton-row"></div>
          </div>
        } @else {
          <div class="user-list">
            @for (user of users; track user.username) {
              <button
                type="button"
                class="user-row load-entry"
                [disabled]="loggingIn"
                (click)="onLogin(user.username)"
              >
                <span class="who">
                  <span class="name">{{ user.displayName }}</span>
                  <span class="uname">&#64;{{ user.username }}</span>
                </span>
                <span class="arrow">→</span>
              </button>
            }
          </div>
        }

        @if (loggingIn) {
          <div class="status-bar">
            <span>Authenticating…</span>
          </div>
        }
      </section>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  private readonly api = inject(MockAuthApi);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private returnUrl = '/employees';

  users: { username: string; displayName: string }[] = [];
  loading = true;
  loggingIn = false;

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/employees';

    if (this.auth.isAuthenticated) {
      this.router.navigateByUrl(this.returnUrl);
      return;
    }

    this.api.getAvailableUsers().subscribe((users) => {
      this.users = users;
      this.loading = false;
    });
  }

  onLogin(username: string): void {
    this.loggingIn = true;
    this.auth.login(username).subscribe((user) => {
      this.loggingIn = false;
      if (user) {
        this.router.navigateByUrl(this.returnUrl);
      }
    });
  }
}
