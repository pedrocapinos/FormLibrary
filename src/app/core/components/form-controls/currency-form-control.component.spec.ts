import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CurrencyFormControlComponent } from './currency-form-control.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyFormControlComponent],
  template: `<currency-form-control [formControl]="ctrl" label="Salary" />`,
})
class TestHostComponent {
  ctrl = new FormControl<number | null>(null);
}

describe('CurrencyFormControlComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let input: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();

    input = fixture.nativeElement.querySelector('input');
  });

  it('displays the formatted value when the model is set (toDisplayValue)', () => {
    host.ctrl.setValue(1250.99);
    fixture.detectChanges();
    expect(input.value).toBe('1.250,99');
  });

  it('displays "0,00" when the model is zero', () => {
    host.ctrl.setValue(0);
    fixture.detectChanges();
    expect(input.value).toBe('0,00');
  });

  it('shows an empty input when the model is null', () => {
    host.ctrl.setValue(null);
    fixture.detectChanges();
    expect(input.value).toBe('');
  });

  it('stores the numeric model value when the user types a formatted currency string (toModelValue)', () => {
    input.value = '1.250,99';
    input.dispatchEvent(new Event('input'));
    expect(host.ctrl.value).toBe(1250.99);
  });
});
