import { Component, Input } from '@angular/core';
import { ActiveFilter } from '../../types/active-filter';
import { ListStateComponent } from '../list-state.component';

export interface FilterGroup {
  tabId?: string;
  tabLabel?: string;
  filters: ActiveFilter[];
}

@Component({
  selector: 'active-filters-content',
  standalone: true,
  imports: [ListStateComponent],
  styles: [
    `
      :host {
        display: block;
        font-family: var(--font-display);
      }

      .groups {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .group {
        border: 1px solid var(--border-strong);
        background: var(--paper);
      }

      .group__head {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 0.8rem;
        background: var(--ink-50);
        border-bottom: 1px solid var(--border);
        cursor: pointer;
        transition: background 120ms ease;
        font-family: var(--font-mono);
        font-size: 0.6875rem;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }
      .group__head:hover,
      .group__head:focus-visible {
        background: var(--accent-soft);
        outline: none;
      }
      .group__head:hover .group__arrow,
      .group__head:focus-visible .group__arrow {
        color: var(--accent);
        transform: translateX(2px);
      }
      .group__tag    { color: var(--accent); font-weight: 500; }
      .group__label  { color: var(--ink-700); }
      .group__arrow  {
        margin-left: auto;
        color: var(--ink-400);
        font-family: var(--font-mono);
        font-size: 0.9rem;
        transition: color 120ms ease, transform 120ms ease;
      }

      .rows {
        display: flex;
        flex-direction: column;
      }

      .row {
        all: unset;
        cursor: pointer;
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 0.75rem;
        align-items: center;
        padding: 0.6rem 0.8rem;
        border-bottom: 1px solid var(--border);
        transition: background 120ms ease;
      }
      .row:last-child { border-bottom: 0; }
      .row:hover,
      .row:focus-visible {
        background: var(--ink-50);
        outline: none;
      }
      .row:focus-visible {
        box-shadow: inset 0 0 0 2px var(--accent);
      }

      .row__label {
        font-family: var(--font-display);
        font-weight: 500;
        color: var(--ink-900);
        font-size: 0.875rem;
      }

      .row__value {
        font-family: var(--font-mono);
        font-size: 0.8125rem;
        color: var(--ink-500);
        text-align: right;
        max-width: 220px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .row__go {
        font-family: var(--font-mono);
        color: var(--ink-400);
        font-size: 0.875rem;
        transition: color 120ms ease, transform 120ms ease;
      }
      .row:hover .row__go,
      .row:focus-visible .row__go {
        color: var(--accent);
        transform: translateX(2px);
      }
    `,
  ],
  template: `
    @if (activeFilters.length === 0) {
      <list-state kind="empty" emptyTitle="No active filters" [emptyHint]="null" />
    } @else {
      <div class="groups">
        @for (group of filterGroups; track group.tabId) {
          <div class="group">
            @if (group.tabId) {
              <button
                type="button"
                class="group__head"
                (click)="onTabClick(group.tabId!)"
              >
                <span class="group__tag">§</span>
                <span class="group__label">{{ group.tabLabel ?? group.tabId }}</span>
                <span class="group__arrow">→</span>
              </button>
            }
            <div class="rows">
              @for (filter of group.filters; track $index) {
                <button
                  type="button"
                  class="row"
                  (click)="onFilterClick(filter)"
                >
                  <span class="row__label">{{ filter.label }}</span>
                  <span class="row__value">{{ filter.displayValue }}</span>
                  <span class="row__go">→</span>
                </button>
              }
            </div>
          </div>
        }
      </div>
    }
  `,
})
export class ActiveFiltersContentComponent {
  @Input() filterGroups: FilterGroup[] = [];
  @Input() activeFilters: ActiveFilter[] = [];
  @Input() resolve: (data: any, options?: { restoreFocus?: boolean }) => void = () => {};

  onFilterClick(filter: ActiveFilter): void {
    this.resolve({ action: 'filter', filter }, { restoreFocus: false });
  }

  onTabClick(tabId: string): void {
    this.resolve({ action: 'tab', tabId }, { restoreFocus: false });
  }
}
