import { Component, Input, SkipSelf, inject } from '@angular/core';
import { ControlContainer, ReactiveFormsModule } from '@angular/forms';
import { ErrorMessageComponent } from '../error-message.component';
import { TextFormControlComponent } from './text-form-control.component';
import { CodeFormControlComponent } from './code-form-control.component';
import { CheckboxFormControlComponent } from './checkbox-form-control.component';
import { SelectFormControlComponent, SelectOption } from './select-form-control.component';

export const US_STATES: SelectOption[] = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

@Component({
  selector: 'address-form-control',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TextFormControlComponent,
    CodeFormControlComponent,
    CheckboxFormControlComponent,
    SelectFormControlComponent,
    ErrorMessageComponent,
  ],
  host: { 'data-group-validator': '' },
  styles: [
    `
      fieldset.is-invalid {
        border-left: 2px solid var(--danger);
        padding-left: 0.75rem;
      }
    `,
  ],
  template: `
    <fieldset [class.is-invalid]="isInvalid">
      <legend class="visually-hidden">{{ legend }}</legend>
      <div class="row g-2">
        <div class="col-12">
          <checkbox-form-control
            [fieldId]="primaryControlName"
            [formControlName]="primaryControlName"
            label="Primary"
          />
        </div>
      </div>
      <div class="row g-2">
        <div class="col-md-8">
          <text-form-control
            [fieldId]="streetControlName"
            [formControlName]="streetControlName"
            label="Street"
            [groupInvalid]="isInvalid"
          />
        </div>
        <div class="col-md-4">
          <code-form-control
            [fieldId]="zipControlName"
            [formControlName]="zipControlName"
            label="ZIP Code"
            [maskConfig]="{ maxLength: 5, padded: true }"
            [groupInvalid]="isInvalid"
          />
        </div>
      </div>
      <div class="row g-2">
        <div class="col-md-6">
          <text-form-control
            [fieldId]="cityControlName"
            [formControlName]="cityControlName"
            label="City"
            [groupInvalid]="isInvalid"
          />
        </div>
        <div class="col-md-6">
          <select-form-control
            [fieldId]="stateControlName"
            [formControlName]="stateControlName"
            label="State"
            placeholder="Select a state…"
            [options]="stateOptions"
            [groupInvalid]="isInvalid"
          />
        </div>
      </div>
    </fieldset>
    @if (isInvalid) {
      <error-message
        [control]="controlContainer.control"
        label="Address"
        [customMessages]="{ atLeastOneRequired: atLeastOneMessage }"
      />
    }
  `,
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: (container: ControlContainer) => container,
      deps: [[new SkipSelf(), ControlContainer]],
    },
  ],
})
export class AddressFormControlComponent {
  readonly controlContainer = inject(ControlContainer, { skipSelf: true });

  @Input() legend = 'Address';
  @Input() streetControlName = 'street';
  @Input() zipControlName = 'zip';
  @Input() cityControlName = 'city';
  @Input() stateControlName = 'state';
  @Input() primaryControlName = 'isPrimary';

  readonly stateOptions = US_STATES;
  readonly atLeastOneMessage = () => 'At least one address field (Street, City, State, or ZIP) is required';

  get isInvalid(): boolean {
    const form = this.controlContainer.control;
    if (!form?.errors?.['atLeastOneRequired']) return false;
    return [this.streetControlName, this.cityControlName, this.stateControlName, this.zipControlName].some((k) => {
      const c = form.get(k);
      return c?.touched || c?.dirty;
    });
  }
}
