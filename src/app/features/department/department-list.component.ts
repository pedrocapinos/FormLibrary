import { Component, OnInit, Input, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { defineTabFilterConfig } from '../../core/types/active-filter-config';
import { GenericHeaderComponent } from '../../core/components/generic-header.component';
import { GenericTableComponent } from '../../core/components/generic-table/generic-table.component';
import { ListStateComponent } from '../../core/components/list-state.component';
import { CodeFormControlComponent } from '../../core/components/form-controls/code-form-control.component';
import { TextFormControlComponent } from '../../core/components/form-controls/text-form-control.component';
import { FocusOnErrorDirective } from '../../core/directives/focus-on-error.directive';
import { AuthService } from '../../core/auth/auth.service';
import type { Action, RecordType } from '../../core/auth/auth.types';
import { ColumnDefinition } from '../../core/types/column-definition';
import { SearchStateService } from '../../core/services/search-state.service';
import { BatchOperationsService } from '../../core/services/batch-edit.service';
import { NavigationService } from '../../core/services/navigation.service';
import { ToastService } from '../../core/services/toast.service';
import { ActiveFiltersDialogService } from '../../core/services/active-filters-dialog.service';
import { Department } from './department.model';
import { DepartmentSearchFilters } from './department.filter';
import { DepartmentService } from './department.service';

const DEPARTMENT_LIST_FILTER_CONFIG = defineTabFilterConfig([
  {
    tabId: 'filters',
    fields: {
      id:   { label: 'ID' },
      name: { label: 'Name' },
    },
  },
]);

@Component({
  selector: 'department-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    GenericHeaderComponent,
    GenericTableComponent,
    ListStateComponent,
    CodeFormControlComponent,
    TextFormControlComponent,
    FocusOnErrorDirective,
  ],
  templateUrl: './department-list.component.html',
})
export class DepartmentListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly departmentService = inject(DepartmentService);
  private readonly searchStateService = inject(SearchStateService);
  private readonly batchOps = inject(BatchOperationsService);
  private readonly navigationService = inject(NavigationService);
  private readonly toastService = inject(ToastService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly activeFiltersService = inject(ActiveFiltersDialogService);

  @Input() mode: 'standalone' | 'selection' = 'standalone';
  @Input() resolve: (data: Department) => void = () => {};

  readonly recordType: RecordType = 'department';

  filterForm = this.buildFilterForm();
  data: Department[] | null = null;
  selectedDepartments: Department[] = [];
  loading = false;

  readonly filterConfig = DEPARTMENT_LIST_FILTER_CONFIG;

  readonly columns: ColumnDefinition<Department>[] = [
    { key: 'id', header: 'ID', width: '80px', sticky: true, formatter: (v) => v != null ? String(v).padStart(4, '0') : '' },
    { key: 'name', header: 'Name' },
  ];

  private buildFilterForm() {
    return this.fb.group(
      {
        id: this.fb.control<number | null>(null),
        name: this.fb.control<string | null>(null),
      },
      { updateOn: 'blur' },
    );
  }

  can(action: Action): boolean {
    return this.auth.can(this.recordType, action);
  }

  ngOnInit(): void {
    if (this.mode === 'standalone') {
      const saved = this.searchStateService.restore<DepartmentSearchFilters>('/departments');
      if (saved) {
        this.filterForm.patchValue(saved);
        this.onSearch();
      } else {
        this.departmentService
          .count()
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((total) => {
            if (total < 20) this.onSearch();
          });
      }

      this.filterForm.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.data = null;
        });
    } else if (this.mode === 'selection') {
      this.onSearch();
    }
  }

  onSearch(): void {
    if (this.filterForm.invalid) return;
    if (this.mode === 'standalone') {
      this.searchStateService.save('/departments', this.filterForm.value);
    }
    this.loading = true;
    this.departmentService
      .search(this.filterForm.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((results) => {
        this.data = results;
        this.loading = false;
      });
  }

  onRowClick(department: Department): void {
    if (this.mode === 'selection') {
      this.resolve(department);
      return;
    }
    if (department.id == null) return;
    this.navigationService.setReturnUrl('/departments');
    this.router.navigate(['/departments', department.id]);
  }

  onNew(): void {
    this.navigationService.setReturnUrl('/departments');
    this.router.navigate(['/departments', 'new']);
  }

  onClearFilters(): void {
    if (this.mode === 'standalone') {
      this.searchStateService.clear('/departments');
    }
    this.filterForm.reset();
    this.data = null;
  }

  onSelectionChange(selected: Department[]): void {
    this.selectedDepartments = selected;
  }

  onEditSelected(): void {
    if (this.selectedDepartments.length === 0) return;
    const routes = this.selectedDepartments.map((d) => ['/departments', d.id!]);
    this.batchOps.startBatch(routes, this.router.url);
  }

  onDeleteSelected(): void {
    this.batchOps
      .deleteSelected({
        items: this.selectedDepartments,
        formatDetail: (d) => `ID: ${d.id} - ${d.name}`,
        deleteFn: (ids) => this.departmentService.deleteMany(ids),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (!result.deleted) return;
        this.toastService.success(`${result.count} record(s) deleted`);
        this.selectedDepartments = [];
        this.onSearch();
      });
  }
}
