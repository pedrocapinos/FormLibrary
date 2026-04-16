import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DebugService {
  enabled = false;

  toggle(): void {
    this.enabled = !this.enabled;
  }
}
