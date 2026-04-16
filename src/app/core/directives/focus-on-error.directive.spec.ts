import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FocusOnErrorDirective } from './focus-on-error.directive';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, FocusOnErrorDirective],
  template: `
    <form [formGroup]="form" appFocusOnError (ngSubmit)="submitted = true">
      <input id="name" formControlName="name" />
      <input id="email" formControlName="email" />
      <button type="submit">Submit</button>
    </form>
  `,
})
class TestHostComponent {
  form = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', Validators.required),
  });
  submitted = false;
}

describe('FocusOnErrorDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function submit(): void {
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
  }

  it('marks all controls as touched on submit when the form is invalid', fakeAsync(() => {
    submit();
    tick(200);

    expect(host.form.get('name')!.touched).toBe(true);
    expect(host.form.get('email')!.touched).toBe(true);
  }));

  it('focuses the first invalid control on submit', fakeAsync(() => {
    const nameInput = fixture.nativeElement.querySelector('#name') as HTMLInputElement;
    spyOn(nameInput, 'focus');
    spyOn(nameInput, 'scrollIntoView');

    submit();
    tick(200);

    expect(nameInput.focus).toHaveBeenCalled();
  }));

  it('does nothing when the form is valid', fakeAsync(() => {
    host.form.setValue({ name: 'x', email: 'y' });
    fixture.detectChanges();

    const nameInput = fixture.nativeElement.querySelector('#name') as HTMLInputElement;
    spyOn(nameInput, 'focus');

    submit();
    tick(200);

    expect(host.form.get('name')!.touched).toBe(false);
    expect(nameInput.focus).not.toHaveBeenCalled();
  }));
});
