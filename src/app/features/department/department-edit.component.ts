import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GenericHeaderComponent } from '../../core/components/generic-header.component';
import { BatchNavComponent } from '../../core/components/batch-nav.component';
import { CodeFormControlComponent } from '../../core/components/form-controls/code-form-control.component';
import { TextFormControlComponent } from '../../core/components/form-controls/text-form-control.component';
import { FocusOnErrorDirective } from '../../core/directives/focus-on-error.directive';
import { AuthService } from '../../core/auth/auth.service';
import type { Action, RecordType } from '../../core/auth/auth.types';
import { Department } from './department.model';
import { DepartmentService } from './department.service';
import { BatchOperationsService } from '../../core/services/batch-edit.service';
import { NavigationService } from '../../core/services/navigation.service';
import { ConfirmDialogService, DEFAULT_SAVE_DIALOG_CONFIG, DEFAULT_DELETE_DIALOG_CONFIG } from '../../core/services/confirm-dialog.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'department-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    GenericHeaderComponent,
    BatchNavComponent,
    CodeFormControlComponent,
    TextFormControlComponent,
    FocusOnErrorDirective,
  ],
  templateUrl: './department-edit.component.html',
})
export class DepartmentEditComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly departmentService = inject(DepartmentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly navigationService = inject(NavigationService);
  private readonly confirmService = inject(ConfirmDialogService);
  private readonly toastService = inject(ToastService);

  readonly recordType: RecordType = 'department';
  readonly batchOperationsService = inject(BatchOperationsService);

  form = this.buildForm();
  isNew = true;
  saving = false;
  deleting = false;

  private currentId: number | null = null;
  private returnUrl = '/departments';
  private originalModel: Department = this.formToModel();

  private buildForm(department?: Partial<Department>) {
    return this.fb.group(
      {
        id: this.fb.control<number | null>(department?.id ?? null),
        name: this.fb.control<string | null>(department?.name ?? null, [
          Validators.required,
          Validators.maxLength(100),
        ]),
      },
      { updateOn: 'blur' },
    );
  }

  private formToModel(): Department {
    const raw = this.form.getRawValue();
    return {
      id: raw.id,
      name: raw.name,
    };
  }

  can(action: Action): boolean {
    return this.auth.can(this.recordType, action);
  }

  hasUnsavedChanges(): boolean {
    return JSON.stringify(this.formToModel()) !== JSON.stringify(this.originalModel);
  }

  ngOnInit(): void {
    this.returnUrl = this.navigationService.consumeReturnUrl() ?? '/departments';

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
        this.departmentService
          .getById(this.currentId!)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((department) => {
            if (department) {
              this.form = this.buildForm(department);
              this.originalModel = this.formToModel();
              if (!this.can('edit')) {
                this.form.disable();
              }
            }
          });
      } else {
        this.form = this.buildForm();
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
        this.departmentService
          .save(this.formToModel())
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((saved) => {
            this.form = this.buildForm(saved);
            this.originalModel = this.formToModel();
            this.toastService.success('Department saved successfully');

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
              this.router.navigate(['/departments', saved.id!], { replaceUrl: true });
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
        this.departmentService
          .delete(id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.toastService.success('Department deleted');
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
      this.form = this.buildForm();
    } else {
      this.form = this.buildForm(this.originalModel);
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
