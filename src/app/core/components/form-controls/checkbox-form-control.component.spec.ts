import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CheckboxFormControlComponent, CheckboxOptions } from './checkbox-form-control.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CheckboxFormControlComponent],
  template: ` <checkbox-form-control [formControl]="ctrl" label="Active" [options]="options" /> `,
})
class TestHostComponent {
  ctrl = new FormControl<any>(null);
  options: CheckboxOptions = { trueValue: true, falseValue: false };
}

describe('CheckboxFormControlComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let checkbox: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();

    checkbox = fixture.nativeElement.querySelector('input[type=checkbox]');
  });

  describe('default boolean options', () => {
    it('checks the checkbox when the model value is true', () => {
      host.ctrl.setValue(true);
      fixture.detectChanges();
      expect(checkbox.checked).toBeTrue();
    });

    it('unchecks the checkbox when the model value is false', () => {
      host.ctrl.setValue(false);
      fixture.detectChanges();
      expect(checkbox.checked).toBeFalse();
    });
  });

  describe('custom trueValue / falseValue options', () => {
    beforeEach(() => {
      host.options = { trueValue: 'S', falseValue: 'N' };
      fixture.detectChanges();
    });

    it('checks the checkbox when the model value matches trueValue', () => {
      host.ctrl.setValue('S');
      fixture.detectChanges();
      expect(checkbox.checked).toBeTrue();
    });

    it('emits the configured trueValue when the checkbox is checked', () => {
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change'));
      expect(host.ctrl.value).toBe('S');
    });

    it('emits the configured falseValue when the checkbox is unchecked', () => {
      checkbox.checked = false;
      checkbox.dispatchEvent(new Event('change'));
      expect(host.ctrl.value).toBe('N');
    });
  });
});
