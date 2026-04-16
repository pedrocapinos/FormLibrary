import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SearchStateService {
  private readonly state = new Map<string, unknown>();

  save<T>(key: string, value: T): void {
    this.state.set(key, value);
  }

  restore<T>(key: string): T | null {
    return (this.state.get(key) as T) ?? null;
  }

  clear(key: string): void {
    this.state.delete(key);
  }

  clearAll(): void {
    this.state.clear();
  }
}
