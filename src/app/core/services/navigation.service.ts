import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private _returnUrl: string | null = null;

  get returnUrl(): string | null {
    return this._returnUrl;
  }

  setReturnUrl(url: string): void {
    this._returnUrl = url;
  }

  consumeReturnUrl(): string | null {
    const url = this._returnUrl;
    this._returnUrl = null;
    return url;
  }
}
