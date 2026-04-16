import { Component, OnInit, Input, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { createRangeValidator } from '../../core/validators/range-validator';
import { defineTabFilterConfig } from '../../core/types/active-filter-config';
import { GenericHeaderComponent } from '../../core/components/generic-header.component';
import { GenericTableComponent } from '../../core/components/generic-table/generic-table.component';
import { ListStateComponent } from '../../core/components/list-state.component';
import { CodeFormControlComponent } from '../../core/components/form-controls/code-form-control.component';
import { CheckboxFormControlComponent } from '../../core/components/form-controls/checkbox-form-control.component';
import { RangeCurrencyFormControlComponent } from '../../core/components/form-controls/range-currency-form-control.component';
import { TextFormControlComponent } from '../../core/components/form-controls/text-form-control.component';
import { FocusOnErrorDirective } from '../../core/directives/focus-on-error.directive';
import { AuthService } from '../../core/auth/auth.service';
import type { Action, RecordType } from '../../core/auth/auth.types';
import { ColumnDefinition } from '../../core/types/column-definition';
import { SearchStateService } from '../../core/services/search-state.service';
import { BatchOperationsService } from '../../core/services/batch-edit.service';
import { NavigationService } from '../../core/services/navigation.service';
import { FormatService } from '../../core/services/format.service';
import { ToastService } from '../../core/services/toast.service';
import { ActiveFiltersDialogService } from '../../core/services/active-filters-dialog.service';
import { Employee } from './employee.model';
import { EmployeeSearchFilters } from './employee.filter';
import { EmployeeService } from './employee.service';

const EMPLOYEE_LIST_FILTER_CONFIG = defineTabFilterConfig([
  {
    tabId: 'filters',
    fields: {
      id:        { label: 'ID' },
      firstName: { label: 'First Name' },
      isActive:  { label: 'Active only', format: 'boolean' },
      salaryMin: { label: 'Min Salary', format: 'currency' },
      salaryMax: { label: 'Max Salary',   format: 'currency' },
    },
  },
]);

@Component({
  selector: 'employee-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    GenericHeaderComponent,
    GenericTableComponent,
    ListStateComponent,
    CodeFormControlComponent,
    RangeCurrencyFormControlComponent,
    TextFormControlComponent,
    CheckboxFormControlComponent,
    FocusOnErrorDirective,
  ],
  templateUrl: './employee-list.component.html',
})
export class EmployeeListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly searchStateService = inject(SearchStateService);
  private readonly batchOps = inject(BatchOperationsService);
  private readonly navigationService = inject(NavigationService);
  private readonly toastService = inject(ToastService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formatService = inject(FormatService);
  readonly activeFiltersService = inject(ActiveFiltersDialogService);

  @Input() mode: 'standalone' | 'selection' = 'standalone';
  @Input() resolve: (data: Employee) => void = () => {};

  readonly recordType: RecordType = 'employee';

  filterForm = this.buildFilterForm();
  data: Employee[] | null = null;
  selectedEmployees: Employee[] = [];
  loading = false;

  readonly filterConfig = EMPLOYEE_LIST_FILTER_CONFIG;

  readonly columns: ColumnDefinition<Employee>[] = [
    { key: 'id', header: 'ID', width: '80px', sticky: true, formatter: (v) => v != null ? String(v).padStart(4, '0') : '' },
    { key: 'firstName', header: 'First Name' },
    { key: 'cpf', header: 'CPF', format: 'cpf' },
    { key: 'salary', header: 'Salary', format: 'currency', calculateTotal: true },
    { key: 'isActive', header: 'Active', width: '80px', format: 'boolean', visible: false },
  ];

  private buildFilterForm() {
    return this.fb.group(
      {
        id: this.fb.control<number | null>(null),
        firstName: this.fb.control<string | null>(null),
        salaryMin: this.fb.control<number | null>(null),
        salaryMax: this.fb.control<number | null>(null),
        isActive: this.fb.control<boolean | null>(null),
      },
      {
        validators: [
          createRangeValidator({
            startKey: 'salaryMin',
            endKey: 'salaryMax',
            startLabel: 'Min Salary',
            endLabel: 'Max Salary',
          }),
        ],
        updateOn: 'blur',
      }
    );
  }

  can(action: Action): boolean {
    return this.auth.can(this.recordType, action);
  }

  ngOnInit(): void {
    if (this.mode === 'standalone') {
      const saved = this.searchStateService.restore<EmployeeSearchFilters>('/employees');
      if (saved) {
        this.filterForm.patchValue(saved);
        this.onSearch();
      } else {
        this.employeeService
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
      this.searchStateService.save('/employees', this.filterForm.value);
    }
    this.loading = true;
    this.employeeService
      .search(this.filterForm.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((results) => {
        this.data = results;
        this.loading = false;
      });
  }

  onRowClick(employee: Employee): void {
    if (this.mode === 'selection') {
      this.resolve(employee);
      return;
    }
    if (employee.id == null) return;
    this.navigationService.setReturnUrl('/employees');
    this.router.navigate(['/employees', employee.id]);
  }

  onNew(): void {
    this.navigationService.setReturnUrl('/employees');
    this.router.navigate(['/employees', 'new']);
  }

  onClearFilters(): void {
    if (this.mode === 'standalone') {
      this.searchStateService.clear('/employees');
    }
    this.filterForm.reset();
    this.data = null;
  }

  onSelectionChange(selected: Employee[]): void {
    this.selectedEmployees = selected;
  }

  onEditSelected(): void {
    if (this.selectedEmployees.length === 0) return;
    const routes = this.selectedEmployees.map((e) => ['/employees', e.id!]);
    this.batchOps.startBatch(routes, this.router.url);
  }

  onDeleteSelected(): void {
    this.batchOps
      .deleteSelected({
        items: this.selectedEmployees,
        formatDetail: (e) => {
          const cpfFormatted = this.formatService.format(e.cpf, 'cpf');
          return `ID: ${e.id} - ${e.firstName} (CPF: ${cpfFormatted})`;
        },
        deleteFn: (ids) => this.employeeService.deleteMany(ids),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (!result.deleted) return;
        this.toastService.success(`${result.count} record(s) deleted`);
        this.selectedEmployees = [];
        this.onSearch();
      });
  }

  onBack(): void {
    this.router.navigateByUrl('/employees');
  }
}
