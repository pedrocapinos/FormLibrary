import { NgTemplateOutlet } from '@angular/common';
import { Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';

/**
 * Structural component that renders a reactive FormArray as a list of editable rows.
 *
 * The consumer provides a row template via `<ng-template>`. The template context
 * exposes the row's FormGroup as the implicit variable and the row index.
 *
 * ```typescript
 * // model.ts
 * phones: new FormArray([createPhoneRowGroup()])
 * readonly createPhoneRow = () => createPhoneRowGroup();
 * ```
 *
 * ```html
 * <dynamic-rows
 *   [formArray]="form.controls.phones"
 *   [createRow]="createPhoneRow"
 *   addLabel="Add Phone"
 *   emptyMessage="No phone numbers added yet."
 * >
 *   <ng-template let-group let-index="index">
 *     <div [formGroup]="group" class="row g-2">
 *       <div class="col-md-4">
 *         <text-form-control [fieldId]="'label-' + index" formControlName="label" label="Label" />
 *       </div>
 *       <div class="col-md-8">
 *         <text-form-control [fieldId]="'number-' + index" formControlName="number" label="Number" />
 *       </div>
 *     </div>
 *   </ng-template>
 * </dynamic-rows>
 * ```
 */
@Component({
  selector: 'dynamic-rows',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    @if (formArray.controls.length === 0) {
      <p class="text-muted fst-italic small mb-2">{{ emptyMessage }}</p>
    } @else {
      @for (control of formArray.controls; track control; let i = $index) {
        <div class="d-flex align-items-start gap-2 mb-3">
          <div class="flex-grow-1">
            <ng-container
              *ngTemplateOutlet="rowTemplate; context: { $implicit: asGroup(control), index: i }"
            ></ng-container>
          </div>
          @if (canRemove) {
            <div class="flex-shrink-0">
              <label class="d-block">&nbsp;</label>
              <button
                type="button"
                class="btn btn-outline-danger btn-sm mt-4"
                (click)="removeRow(i)"
                [attr.aria-label]="'Remove row ' + (i + 1)"
              >
                <i class="bi bi-trash"></i>
              </button>
            </div>
          }
        </div>
      }
    }
    @if (canAdd) {
      <button type="button" class="btn btn-outline-secondary btn-sm" (click)="addRow()">
        <i class="bi bi-plus-lg me-1"></i> {{ addLabel }}
      </button>
    }
  `,
})
export class DynamicRowsComponent {
  @Input({ required: true }) formArray!: FormArray;
  @Input({ required: true }) createRow!: () => AbstractControl;
  @Input() canAdd = true;
  @Input() canRemove = true;
  @Input() addLabel = 'Add';
  @Input() emptyMessage = 'No items added yet.';

  @ContentChild(TemplateRef) rowTemplate!: TemplateRef<{ $implicit: FormGroup; index: number }>;

  addRow(): void {
    this.formArray.push(this.createRow());
    this.formArray.markAsDirty();
  }

  removeRow(index: number): void {
    this.formArray.removeAt(index);
    this.formArray.markAsDirty();
  }

  asGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }
}
