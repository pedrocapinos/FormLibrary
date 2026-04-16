import { Component, HostListener, inject, OnInit, OnDestroy } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './core/auth/auth.service';
import { DebugService } from './core/services/debug.service';
import { DialogHostComponent } from './core/components/dialog-host.component';
import { ToastContainerComponent } from './core/components/toast-container.component';

type Theme = 'light' | 'dark';

const MOBILE_BREAKPOINT = 900;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    DialogHostComponent,
    ToastContainerComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  readonly auth = inject(AuthService);
  readonly debugService = inject(DebugService);
  private readonly router = inject(Router);
  private routerSub!: Subscription;

  navigating = false;
  theme: Theme = this.loadTheme();
  isMobile = this.detectMobile();
  drawerOpen = this.loadDrawerState();

  constructor() {
    this.applyTheme(this.theme);
  }

  ngOnInit(): void {
    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.navigating = true;
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.navigating = false;
        if (this.isMobile) this.drawerOpen = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  @HostListener('window:resize')
  onResize(): void {
    const wasMobile = this.isMobile;
    this.isMobile = this.detectMobile();
    if (wasMobile === this.isMobile) return;
    this.drawerOpen = this.isMobile ? false : this.readStoredDrawerState();
    this.persistDrawerState();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.drawerOpen && this.isMobile) this.drawerOpen = false;
  }

  toggleDrawer(): void {
    this.drawerOpen = !this.drawerOpen;
    this.persistDrawerState();
  }

  closeDrawer(): void {
    if (!this.drawerOpen) return;
    this.drawerOpen = false;
    this.persistDrawerState();
  }

  onLogout(): void {
    this.router.navigate(['/login']).then((navigated) => {
      if (navigated) {
        this.auth.logout();
      }
    });
  }

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

  private detectMobile(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT;
  }

  private loadDrawerState(): boolean {
    if (this.isMobile) return false;
    return this.readStoredDrawerState();
  }

  private readStoredDrawerState(): boolean {
    try {
      const saved = localStorage.getItem('formlib.drawer');
      if (saved === 'closed') return false;
      if (saved === 'open') return true;
    } catch {}
    return true;
  }

  private persistDrawerState(): void {
    if (this.isMobile) return;
    try {
      localStorage.setItem('formlib.drawer', this.drawerOpen ? 'open' : 'closed');
    } catch {}
  }
}
