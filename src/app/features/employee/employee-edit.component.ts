import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { GenericHeaderComponent } from '../../core/components/generic-header.component';
import { BatchNavComponent } from '../../core/components/batch-nav.component';
import { CodeFormControlComponent } from '../../core/components/form-controls/code-form-control.component';
import { TextFormControlComponent } from '../../core/components/form-controls/text-form-control.component';
import { CurrencyFormControlComponent } from '../../core/components/form-controls/currency-form-control.component';
import { CheckboxFormControlComponent } from '../../core/components/form-controls/checkbox-form-control.component';
import { CpfFormControlComponent } from '../../core/components/form-controls/cpf-form-control.component';
import { PhoneFormControlComponent } from '../../core/components/form-controls/phone-form-control.component';
import { AddressFormControlComponent } from '../../core/components/form-controls/address-form-control.component';
import { LookupFormControlComponent, type LookupValue } from '../../core/components/form-controls/lookup-form-control.component';
import { DynamicRowsComponent } from '../../core/components/dynamic-rows.component';
import { FocusOnErrorDirective } from '../../core/directives/focus-on-error.directive';
import { ErrorMessageComponent } from '../../core/components/error-message.component';
import { AuthService } from '../../core/auth/auth.service';
import type { Action, RecordType } from '../../core/auth/auth.types';
import { Employee } from './employee.model';
import { EmployeeService } from './employee.service';
import { BatchOperationsService } from '../../core/services/batch-edit.service';
import { NavigationService } from '../../core/services/navigation.service';
import { ConfirmDialogService, DEFAULT_SAVE_DIALOG_CONFIG, DEFAULT_DELETE_DIALOG_CONFIG } from '../../core/services/confirm-dialog.service';
import { ToastService } from '../../core/services/toast.service';
import { createAtLeastOneRequiredValidator } from '../../core/validators/at-least-one-required-validator';
import { DialogHostService } from '../../core/services/dialog-host.service';
import { openDepartmentLookup } from '../department/department-lookup';
import { DepartmentService } from '../department/department.service';
import type { ErrorMessageConfig } from '../../core/services/error-message.service';

const EMPLOYEE_ID_MESSAGES: Partial<ErrorMessageConfig> = {
  min: (_, p) => `Employee ID must be at least ${p?.min}`,
  max: (_, p) => `Employee ID must not exceed ${p?.max}`,
};

@Component({
  selector: 'employee-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    GenericHeaderComponent,
    BatchNavComponent,
    CodeFormControlComponent,
    TextFormControlComponent,
    CurrencyFormControlComponent,
    CheckboxFormControlComponent,
    CpfFormControlComponent,
    PhoneFormControlComponent,
    AddressFormControlComponent,
    LookupFormControlComponent,
    DynamicRowsComponent,
    FocusOnErrorDirective,
    ErrorMessageComponent,
  ],
  templateUrl: './employee-edit.component.html',
})
export class EmployeeEditComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly navigationService = inject(NavigationService);
  private readonly confirmService = inject(ConfirmDialogService);
  private readonly toastService = inject(ToastService);
  private readonly dialogHost = inject(DialogHostService);
  private readonly departmentService = inject(DepartmentService);

  readonly recordType: RecordType = 'employee';
  readonly batchOperationsService = inject(BatchOperationsService);

  readonly createPhoneRow = () => this.buildPhoneRowGroup();

  readonly idMessages = EMPLOYEE_ID_MESSAGES;

  readonly departmentLookupFn = () =>
    openDepartmentLookup(this.dialogHost).pipe(
      map((dept) => (dept ? { id: dept.id, display: dept.name } : null)),
    );

  readonly departmentLookupByIdFn = (id: number): Observable<string | null> =>
    this.departmentService.getById(id).pipe(map((dept) => dept?.name ?? null));

  form = this.buildEmployeeForm();
  isNew = true;
  saving = false;
  deleting = false;

  private currentId: number | null = null;
  private returnUrl = '/employees';
  private originalModel: Employee = this.formToModel();

  private buildPhoneRowGroup(phone?: Partial<{ label: string | null; number: string | null }>) {
    return this.fb.group({
      label: this.fb.control<string | null>(phone?.label ?? null, [Validators.required]),
      number: this.fb.control<string | null>(phone?.number ?? null, [Validators.required]),
    });
  }

  private buildEmployeeForm(employee?: Partial<Employee>) {
    return this.fb.group(
      {
        identity: this.fb.group(
          {
            id: this.fb.control<number | null>(employee?.id ?? null, [
              Validators.min(0),
              Validators.max(9999),
            ]),
            cpf: this.fb.control<string | null>(employee?.cpf ?? null),
          },
          { validators: [createAtLeastOneRequiredValidator(['id', 'cpf'])] },
        ),
        firstName: this.fb.control<string | null>(employee?.firstName ?? null, [
          Validators.minLength(3),
          Validators.maxLength(100),
          Validators.required
        ]),
        salary: this.fb.control<number | null>(employee?.salary ?? null),
        isActive: this.fb.control<boolean | null>(employee?.isActive ?? null),
        department: this.fb.control<LookupValue | null>(
          employee?.departmentId
            ? { id: employee.departmentId, display: employee.departmentName ?? null }
            : null,
        ),
        address: this.fb.group(
          {
            street: this.fb.control<string | null>(employee?.street ?? null),
            city: this.fb.control<string | null>(employee?.city ?? null),
            state: this.fb.control<string | null>(employee?.state ?? null),
            zip: this.fb.control<string | null>(employee?.zip ?? null),
            isPrimary: this.fb.control<boolean>(employee?.isPrimary ?? false),
          },
          {
            validators: [createAtLeastOneRequiredValidator(['street', 'city', 'state', 'zip'])],
          },
        ),
        phones: this.fb.array((employee?.phones ?? []).map((p) => this.buildPhoneRowGroup(p))),
      },
      { updateOn: 'blur' },
    );
  }

  private formToModel(): Employee {
    const raw = this.form.getRawValue();
    return {
      id: raw.identity.id,
      firstName: raw.firstName,
      cpf: raw.identity.cpf,
      salary: raw.salary,
      isActive: raw.isActive ?? false,
      departmentId: raw.department?.id ?? null,
      departmentName: raw.department?.display ?? null,
      isPrimary: raw.address.isPrimary ?? false,
      street: raw.address.street,
      city: raw.address.city,
      state: raw.address.state,
      zip: raw.address.zip,
      phones: raw.phones,
    };
  }

  get identityGroupInvalid(): boolean {
    const group = this.form.controls.identity;
    if (!group.hasError('atLeastOneRequired')) return false;
    return ['id', 'cpf'].some((k) => {
      const c = group.get(k);
      return c?.touched || c?.dirty;
    });
  }

  can(action: Action): boolean {
    return this.auth.can(this.recordType, action);
  }

  hasUnsavedChanges(): boolean {
    return JSON.stringify(this.formToModel()) !== JSON.stringify(this.originalModel);
  }

  ngOnInit(): void {
    this.returnUrl = this.navigationService.consumeReturnUrl() ?? '/employees';

    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const idParam = params.get('id');
      const isNewRoute = idParam === null || idParam === 'new';

      if (!isNewRoute && Number(idParam) === this.currentId) {
        this.isNew = false;
        return;
      }

      this.isNew = isNewRoute;

      if (!this.isNew && idParam !== null) {
        this.currentId = Number(idParam);
        this.employeeService
          .getById(this.currentId!)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((employee) => {
            if (employee) {
              this.form = this.buildEmployeeForm(employee);
              this.originalModel = this.formToModel();
              if (!this.can('edit')) {
                this.form.disable();
              }
            }
          });
      } else {
        this.form = this.buildEmployeeForm();
        this.originalModel = this.formToModel();
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.confirmService
      .confirm(DEFAULT_SAVE_DIALOG_CONFIG)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.saving = true;
        this.employeeService
          .save(this.formToModel())
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((saved) => {
            this.form = this.buildEmployeeForm(saved);
            this.originalModel = this.formToModel();
            this.toastService.success('Employee saved successfully');

            if (this.batchOperationsService.isBatching) {
              if (this.batchOperationsService.hasNext()) {
                this.batchOperationsService.goNext();
              } else {
                this.batchOperationsService.finish();
              }
              this.saving = false;
              return;
            }

            if (this.isNew) {
              this.isNew = false;
              this.currentId = saved.id;
              this.router.navigate(['/employees', saved.id!], { replaceUrl: true });
            }
            this.saving = false;
          });
      });
  }

  onDelete(): void {
    if (this.currentId === null) return;
    const id = this.currentId;
    this.confirmService
      .confirm(DEFAULT_DELETE_DIALOG_CONFIG)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.deleting = true;
        this.employeeService
          .delete(id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.toastService.success('Employee deleted');
            if (this.batchOperationsService.isBatching) {
              if (this.batchOperationsService.hasNext()) {
                this.batchOperationsService.goNext();
              } else {
                this.batchOperationsService.finish();
              }
              return;
            }
            this.router.navigateByUrl(this.returnUrl);
          });
      });
  }

  onClear(): void {
    if (this.isNew) {
      this.form = this.buildEmployeeForm();
    } else {
      this.form = this.buildEmployeeForm(this.originalModel);
    }
  }

  onBack(): void {
    if (this.batchOperationsService.isBatching) {
      this.batchOperationsService.finish();
      return;
    }
    this.router.navigateByUrl(this.returnUrl);
  }
}
