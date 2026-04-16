import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ColumnDefinition } from '../../types/column-definition';
import { ActiveFilter } from '../../types/active-filter';
import { ActiveFilterConfig } from '../../types/active-filter-config';
import { collectActiveFilters } from '../../utils/collect-active-filters';
import {
  copyToClipboard,
  exportToCsv,
  exportToPdf,
  exportToXlsx,
  printTable,
} from '../../utils/table-export';
import { FormatService } from '../../services/format.service';
import { ToastService } from '../../services/toast.service';

const SELECT_COL = '__select__';
const SELECT_COL_WIDTH = 40;

function isPxWidth(width?: string): boolean {
  return !!width && /^\d+(?:\.\d+)?px$/.test(width);
}

@Component({
  selector: 'generic-table',
  standalone: true,
  imports: [CdkTableModule, DragDropModule],
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.css'],
})
export class GenericTableComponent<T = any> implements OnChanges {
  @Input() columns: ColumnDefinition<T>[] = [];
  @Input() data: T[] = [];
  @Input() pageSize: number | undefined = undefined;
  @Input() showActions = true;
  @Input() exportFilename = 'export';
  @Input() selectable = false;
  @Input() selectionKey: keyof T | ((row: T) => unknown) = 'id' as keyof T;
  @Input() reorderableColumns = false;
  @Input() showColumnPicker = false;
  @Input() filterForm?: FormGroup;
  @Input() filterConfig?: Record<string, ActiveFilterConfig>;

  @Output() rowClick = new EventEmitter<T>();
  @Output() selectionChange = new EventEmitter<T[]>();

  @ViewChild('pickerWrapper') pickerWrapper?: ElementRef<HTMLElement>;

  private readonly formatService = inject(FormatService);
  private readonly toastService = inject(ToastService);

  readonly selectCol = SELECT_COL;

  internalColumns: ColumnDefinition<T>[] = [];
  visibleColumnKeys = new Set<string>();
  columnPickerOpen = false;
  sortKey: string | null = null;
  sortDir: 'asc' | 'desc' = 'asc';
  currentPage = 1;
  selectedKeys = new Set<unknown>();
  showSelectedOnly = false;
  copied = false;
  activeFilters: ActiveFilter[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns']) {
      const sticky = this.columns.filter((c) => c.sticky);
      const nonSticky = this.columns.filter((c) => !c.sticky);
      this.internalColumns = [...sticky, ...nonSticky];
      this.visibleColumnKeys = new Set(
        this.columns.filter((c) => c.visible !== false).map((c) => c.key)
      );
      for (const c of sticky) {
        if (!isPxWidth(c.width)) {
          console.warn(
            `[generic-table] Sticky column "${c.key}" needs an explicit "Npx" width (got "${c.width}"). Sticky offsets cannot be computed from "%", "rem", or "auto".`,
          );
        }
      }
    }
    if (changes['data'] || changes['pageSize']) {
      this.clampCurrentPage();
    }
    if (changes['data']) {
      const dataKeys = new Set(this.data.map((r) => this.keyOf(r)));
      this.selectedKeys = new Set([...this.selectedKeys].filter((k) => dataKeys.has(k)));
      if (this.selectedKeys.size === 0) this.showSelectedOnly = false;
      if (this.filterForm) {
        this.activeFilters = collectActiveFilters(
          this.filterForm,
          this.filterConfig ?? {},
          this.formatService,
          document.body
        );
      }
    }
  }

  get activeColumnKeys(): string[] {
    const keys = this.internalColumns
      .filter((c) => this.visibleColumnKeys.has(c.key))
      .map((c) => c.key);
    return this.selectable ? [SELECT_COL, ...keys] : keys;
  }

  get hasSticky(): boolean {
    return this.internalColumns.some((c) => c.sticky);
  }

  get stickyColumns(): ColumnDefinition<T>[] {
    return this.internalColumns.filter((c) => c.sticky);
  }

  getStickyLeft(col: ColumnDefinition<T>): string | null {
    if (!col.sticky) return null;
    const selectOffset = this.selectable ? SELECT_COL_WIDTH : 0;
    let offset = selectOffset;
    for (const sc of this.stickyColumns) {
      if (sc.key === col.key) break;
      offset += this.parsePxWidth(sc.width);
    }
    return offset + 'px';
  }

  private parsePxWidth(width?: string): number {
    if (!width) return 0;
    const match = width.match(/^(\d+(?:\.\d+)?)px$/);
    return match ? parseFloat(match[1]) : 0;
  }

  private keyOf(row: T): unknown {
    return typeof this.selectionKey === 'function'
      ? this.selectionKey(row)
      : (row as any)[this.selectionKey];
  }

  isSelected(row: T): boolean {
    return this.selectedKeys.has(this.keyOf(row));
  }

  /** Sorted data from the raw input (base for paging and exports). */
  get sortedBase(): T[] {
    const base = this.showSelectedOnly
      ? this.data.filter((r) => this.isSelected(r))
      : this.data;

    if (!this.sortKey) return base;
    const key = this.sortKey;
    const dir = this.sortDir === 'asc' ? 1 : -1;
    return [...base].sort((a, b) => {
      const av = (a as any)[key];
      const bv = (b as any)[key];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      return av < bv ? -dir : av > bv ? dir : 0;
    });
  }

  get pagedData(): T[] {
    if (!this.pageSize) return this.sortedBase;
    const start = (this.currentPage - 1) * this.pageSize;
    return this.sortedBase.slice(start, start + this.pageSize);
  }

  private clampCurrentPage(): void {
    if (!this.pageSize) return;
    const maxPage = Math.max(1, Math.ceil(this.sortedBase.length / this.pageSize));
    if (this.currentPage > maxPage) this.currentPage = maxPage;
  }

  get totalPages(): number {
    return this.pageSize ? Math.max(1, Math.ceil(this.sortedBase.length / this.pageSize)) : 1;
  }

  get pageStart(): number {
    return this.sortedBase.length === 0 ? 0 : (this.currentPage - 1) * (this.pageSize ?? 0) + 1;
  }

  get pageEnd(): number {
    return Math.min(this.currentPage * (this.pageSize ?? 0), this.sortedBase.length);
  }

  get isAllSelected(): boolean {
    return this.sortedBase.length > 0 && this.sortedBase.every((r) => this.isSelected(r));
  }

  get isSomeSelected(): boolean {
    return this.selectedKeys.size > 0 && !this.isAllSelected;
  }

  get hasTotals(): boolean {
    return this.columns.some((c) => c.calculateTotal);
  }

  getColumnTotal(col: ColumnDefinition<T>): string {
    const sum = this.sortedBase.reduce((acc, row) => {
      const v = (row as any)[col.key];
      return acc + (typeof v === 'number' ? v : 0);
    }, 0);
    return this.formatValue(col, sum, {} as T);
  }

  formatValue(col: ColumnDefinition<T>, value: any, row: T): string {
    if (value == null || value === '') return '—';
    if (col.formatter) {
      return col.formatter(value, row);
    }
    if (col.format) {
      return this.formatService.format(value, col.format, col.formatOptions);
    }
    return String(value);
  }

  onSort(key: string): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDir = 'asc';
    }
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    this.currentPage = Math.min(Math.max(1, page), this.totalPages);
  }

  // ── Selection ───────────────────────────────────────────────────────────

  private emitSelection(): void {
    this.selectionChange.emit(this.data.filter((r) => this.isSelected(r)));
  }

  private afterSelectionChange(): void {
    if (this.selectedKeys.size === 0) this.showSelectedOnly = false;
    this.clampCurrentPage();
  }

  onToggleRow(row: T): void {
    const key = this.keyOf(row);
    if (this.selectedKeys.has(key)) {
      this.selectedKeys.delete(key);
    } else {
      this.selectedKeys.add(key);
    }
    this.selectedKeys = new Set(this.selectedKeys);
    this.afterSelectionChange();
    this.emitSelection();
  }

  onToggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.sortedBase.forEach((r) => this.selectedKeys.add(this.keyOf(r)));
    } else {
      this.sortedBase.forEach((r) => this.selectedKeys.delete(this.keyOf(r)));
    }
    this.selectedKeys = new Set(this.selectedKeys);
    this.afterSelectionChange();
    this.emitSelection();
  }

  toggleShowSelected(): void {
    this.showSelectedOnly = !this.showSelectedOnly;
    this.currentPage = 1;
  }

  clearSelection(): void {
    this.selectedKeys = new Set();
    this.showSelectedOnly = false;
    this.clampCurrentPage();
    this.selectionChange.emit([]);
  }

  // ── Column reordering ──────────────────────────────────────────────────

  onColumnDrop(event: CdkDragDrop<ColumnDefinition<T>[]>): void {
    const visible = this.internalColumns.filter((c) => this.visibleColumnKeys.has(c.key));
    const stickyCount = visible.filter((c) => c.sticky).length;
    const prevVis = Math.max(event.previousIndex, stickyCount);
    const currVis = Math.max(event.currentIndex, stickyCount);
    if (prevVis === currVis) return;

    const movingCol = visible[prevVis];
    const targetCol = visible[currVis];
    if (!movingCol || !targetCol) return;

    const prevIdx = this.internalColumns.indexOf(movingCol);
    const currIdx = this.internalColumns.indexOf(targetCol);
    if (prevIdx === -1 || currIdx === -1) return;

    moveItemInArray(this.internalColumns, prevIdx, currIdx);
    this.internalColumns = [...this.internalColumns];
  }

  // ── Column visibility ─────────────────────────────────────────────────

  toggleColumnPicker(event: Event): void {
    event.stopPropagation();
    this.columnPickerOpen = !this.columnPickerOpen;
  }

  onToggleColumnVisibility(key: string): void {
    if (this.visibleColumnKeys.has(key)) {
      if (this.visibleColumnKeys.size > 1) {
        this.visibleColumnKeys.delete(key);
      }
    } else {
      this.visibleColumnKeys.add(key);
    }
    this.visibleColumnKeys = new Set(this.visibleColumnKeys);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (
      this.columnPickerOpen &&
      this.pickerWrapper &&
      !this.pickerWrapper.nativeElement.contains(event.target as Node)
    ) {
      this.columnPickerOpen = false;
    }
  }

  // ── Export ──────────────────────────────────────────────────────────────

  private getExportData(): { headers: string[]; rows: string[][] } {
    const visibleCols = this.internalColumns.filter((c) => this.visibleColumnKeys.has(c.key));
    const headers = visibleCols.map((c) => c.header);
    const rows = this.sortedBase.map((row) =>
      visibleCols.map((c) => {
        const v = this.formatValue(c, (row as any)[c.key], row as T);
        return v != null ? String(v) : '';
      })
    );
    return { headers, rows };
  }

  onCopy(): void {
    const { headers, rows } = this.getExportData();
    copyToClipboard(headers, rows).then(() => {
      this.copied = true;
      this.toastService.info('Copied to clipboard');
      setTimeout(() => (this.copied = false), 1500);
    });
  }

  onExportCsv(): void {
    const { headers, rows } = this.getExportData();
    exportToCsv(headers, rows, this.exportFilename);
    this.toastService.info('Exported to CSV');
  }

  onExportXlsx(): void {
    const { headers, rows } = this.getExportData();
    exportToXlsx(headers, rows, this.exportFilename);
    this.toastService.info('Exported to XLSX');
  }

  onExportPdf(): void {
    const { headers, rows } = this.getExportData();
    exportToPdf(headers, rows, this.exportFilename);
    this.toastService.info('Exported to PDF');
  }

  onPrint(): void {
    const { headers, rows } = this.getExportData();
    printTable(headers, rows, this.exportFilename);
  }
}
