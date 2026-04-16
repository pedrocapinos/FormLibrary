import { ElementRef, Injectable, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActiveFilterConfig } from '../types/active-filter-config';
import { ActiveFilter } from '../types/active-filter';
import { FormatService } from './format.service';
import { DialogHostService } from './dialog-host.service';
import {
  ActiveFiltersContentComponent,
  FilterGroup,
} from '../components/dialog-content/active-filters-content.component';
import { collectActiveFilters } from '../utils/collect-active-filters';
import { focusControlByKey } from '../utils/focus-utils';

@Injectable({ providedIn: 'root' })
export class ActiveFiltersDialogService {
  private readonly dialogHost = inject(DialogHostService);
  private readonly formatService = inject(FormatService);

  open(
    form: FormGroup,
    filterConfig: Record<string, ActiveFilterConfig>,
    container?: ElementRef<HTMLElement> | HTMLElement | string,
  ): void {
    const rootEl = this.resolveElement(container);
    const filters = collectActiveFilters(form, filterConfig, this.formatService, rootEl);
    const filterGroups = this.buildGroups(filters);

    this.dialogHost.open(
      ActiveFiltersContentComponent,
      { title: 'Active Filters', titleIcon: 'bi bi-funnel' },
      (instance) => {
        instance.filterGroups = filterGroups;
        instance.activeFilters = filters;
        instance.resolve = (data: any, options?: { restoreFocus?: boolean }) =>
          this.dialogHost.handleResult(data, options);
      },
      (result: { action: string; filter?: ActiveFilter; tabId?: string } | null) => {
        if (!result) return;
        if (result.action === 'filter' && result.filter) {
          this.navigateToFilter(result.filter, container);
        }
        if (result.action === 'tab' && result.tabId) {
          this.navigateToTab(result.tabId);
        }
      },
    );
  }

  private buildGroups(filters: ActiveFilter[]): FilterGroup[] {
    const groupMap = new Map<string, FilterGroup>();
    for (const filter of filters) {
      const key = filter.tabId ?? '';
      if (!groupMap.has(key)) {
        groupMap.set(key, { tabId: filter.tabId, tabLabel: filter.tabLabel, filters: [] });
      }
      groupMap.get(key)!.filters.push(filter);
    }
    return [...groupMap.values()];
  }

  private navigateToFilter(
    filter: ActiveFilter,
    container?: ElementRef<HTMLElement> | HTMLElement | string,
  ): void {
    if (filter.tabId) {
      document.querySelector<HTMLElement>(`[aria-controls="tab-panel-${filter.tabId}"]`)?.click();
    }

    const hostEl = container ? this.resolveElementRef(container) : undefined;
    if (hostEl) {
      focusControlByKey(filter.controlName, hostEl);
    }
  }

  private navigateToTab(tabId: string): void {
    document.querySelector<HTMLElement>(`[aria-controls="tab-panel-${tabId}"]`)?.click();
  }

  private resolveElement(
    container?: ElementRef<HTMLElement> | HTMLElement | string,
  ): HTMLElement | undefined {
    if (!container) return undefined;
    if (container instanceof ElementRef) return container.nativeElement;
    if (container instanceof HTMLElement) return container;
    if (typeof container === 'string') return document.getElementById(container) ?? undefined;
    return undefined;
  }

  private resolveElementRef(
    container: ElementRef<HTMLElement> | HTMLElement | string,
  ): ElementRef<HTMLElement> | undefined {
    const el = this.resolveElement(container);
    return el ? new ElementRef(el) : undefined;
  }
}
