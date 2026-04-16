import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ConfirmDialogService } from './confirm-dialog.service';

@Injectable({
  providedIn: 'root',
})
export class BatchOperationsService {
  private router = inject(Router);
  private confirmService = inject(ConfirmDialogService);

  private _routes: any[][] = [];
  private _currentIndex = -1;
  private _returnUrl: string | null = null;
  private _lastDirection: 'next' | 'prev' | null = null;

  get lastDirection(): 'next' | 'prev' | null {
    return this._lastDirection;
  }

  get isBatching(): boolean {
    return (
      this._routes.length > 0 && this._currentIndex >= 0 && this._currentIndex < this._routes.length
    );
  }

  get currentIndex(): number {
    return this._currentIndex;
  }

  get totalCount(): number {
    return this._routes.length;
  }

  get currentRoute(): any[] | null {
    if (!this.isBatching) return null;
    return this._routes[this._currentIndex];
  }

  startBatch(routes: any[][], returnUrl: string): void {
    if (!routes || routes.length === 0) return;
    this._routes = [...routes];
    this._currentIndex = 0;
    this._returnUrl = returnUrl;
    this._lastDirection = null;
    this.navigateToCurrent();
  }

  hasNext(): boolean {
    return this.isBatching && this._currentIndex < this._routes.length - 1;
  }

  hasPrev(): boolean {
    return this.isBatching && this._currentIndex > 0;
  }

  goNext(): void {
    this.move(1);
  }

  goPrev(): void {
    this.move(-1);
  }

  private move(delta: 1 | -1): void {
    const canMove = delta === 1 ? this.hasNext() : this.hasPrev();
    if (canMove) {
      this._lastDirection = delta === 1 ? 'next' : 'prev';
      this._currentIndex += delta;
      this.navigateToCurrent();
    }
  }

  finish(): void {
    const url = this._returnUrl;
    this.clear();
    if (url) {
      this.router.navigateByUrl(url);
    }
  }

  clear(): void {
    this._routes = [];
    this._currentIndex = -1;
    this._returnUrl = null;
    this._lastDirection = null;
  }

  private navigateToCurrent(): void {
    const route = this.currentRoute;
    if (!route) return;
    this.router.navigate(route);
  }

  deleteSelected<T extends { id: number | null }>(config: {
    items: T[];
    formatDetail: (item: T) => string;
    deleteFn: (ids: number[]) => Observable<void>;
  }): Observable<{ deleted: boolean; count: number }> {
    // Filter items without a persisted id up front so confirmation count and deleted count match.
    const validItems = config.items.filter((item): item is T & { id: number } => item.id != null);
    if (validItems.length === 0) {
      return of({ deleted: false, count: 0 });
    }

    let details = validItems.map(config.formatDetail);
    if (details.length > 10) {
      const more = details.length - 10;
      details = [...details.slice(0, 10), `...and ${more} more records.`];
    }

    const count = validItems.length;
    const message =
      count === 1
        ? 'Are you sure you want to delete the selected record? This action cannot be undone.'
        : `Are you sure you want to delete the ${count} selected records? This action cannot be undone.`;

    return this.confirmService
      .confirm({
        title: 'Delete Selected',
        titleIcon: 'bi bi-trash',
        message,
        details,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        confirmClass: 'btn-danger',
      })
      .pipe(
        switchMap((confirmed) => {
          if (!confirmed) return of({ deleted: false, count: 0 });
          const ids = validItems.map((item) => item.id);
          return config.deleteFn(ids).pipe(
            map(() => ({ deleted: true, count: ids.length })),
          );
        }),
      );
  }
}
