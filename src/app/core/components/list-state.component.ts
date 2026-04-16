import { Component, Input } from '@angular/core';

export type ListStateKind = 'loading' | 'no-query' | 'empty';

@Component({
  selector: 'list-state',
  standalone: true,
  template: `
    @switch (kind) {
      @case ('loading') {
        <div class="state state--loading">
          <div class="state__bar"></div>
          <span>{{ loadingLabel }}</span>
        </div>
      }
      @case ('no-query') {
        <div class="state state--empty">
          <span class="state__mark">◇</span>
          <div>
            <div class="state__title">No query executed</div>
            <div class="state__hint">{{ noQueryHint }}</div>
          </div>
        </div>
      }
      @case ('empty') {
        <div class="state state--empty">
          <span class="state__mark">∅</span>
          <div>
            <div class="state__title">{{ emptyTitle }}</div>
            @if (emptyHint) {
              <div class="state__hint">{{ emptyHint }}</div>
            }
          </div>
        </div>
      }
    }
  `,
})
export class ListStateComponent {
  @Input({ required: true }) kind!: ListStateKind;
  @Input() loadingLabel = 'Fetching records…';
  @Input() noQueryHint = 'Set filters above and press Search to retrieve records.';
  @Input() emptyTitle = 'No matching records';
  @Input() emptyHint: string | null = 'Loosen the filters or clear them to try again.';
}
