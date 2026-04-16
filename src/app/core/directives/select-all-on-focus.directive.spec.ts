import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectAllOnFocusDirective } from './select-all-on-focus.directive';

@Component({
  standalone: true,
  imports: [SelectAllOnFocusDirective],
  template: `<input selectAllOnFocus id="input" />`,
})
class TestHostComponent {}

describe('SelectAllOnFocusDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let input: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    input = fixture.nativeElement.querySelector('#input');
  });

  it('selects all text when the input receives focus', () => {
    input.value = 'hello world';
    spyOn(input, 'select');

    input.dispatchEvent(new Event('focus'));

    expect(input.select).toHaveBeenCalled();
  });

  it('does not throw when the input is empty', () => {
    input.value = '';
    expect(() => input.dispatchEvent(new Event('focus'))).not.toThrow();
  });
});
