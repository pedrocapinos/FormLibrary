import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DateFormControlComponent } from './date-form-control.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, DateFormControlComponent],
  template: `<date-form-control [formControl]="ctrl" label="Birth Date" />`,
})
class TestHostComponent {
  ctrl = new FormControl<string | null>(null);
}

describe('DateFormControlComponent', () => {
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

  it('displays dd/MM/yyyy when the model holds an ISO date (toDisplayValue)', () => {
    host.ctrl.setValue('1990-12-25');
    fixture.detectChanges();
    expect(input.value).toBe('25/12/1990');
  });

  it('shows an empty input when the model is null', () => {
    host.ctrl.setValue(null);
    fixture.detectChanges();
    expect(input.value).toBe('');
  });

  it('stores an ISO date string when the user types a complete dd/MM/yyyy value (toModelValue)', () => {
    input.value = '25/12/1990';
    input.dispatchEvent(new Event('input'));
    expect(host.ctrl.value).toBe('1990-12-25');
  });
});
