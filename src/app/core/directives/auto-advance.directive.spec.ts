import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AutoAdvanceDirective } from './auto-advance.directive';

@Component({
  standalone: true,
  imports: [AutoAdvanceDirective],
  template: `
    <form>
      <input id="first" [autoAdvance]="isFull" />
      <input id="second" />
    </form>
  `,
})
class TestHostComponent {
  isFull = (_el: HTMLInputElement) => false;
}

describe('AutoAdvanceDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let first: HTMLInputElement;
  let second: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();

    first = fixture.nativeElement.querySelector('#first');
    second = fixture.nativeElement.querySelector('#second');
  });

  function dispatchKeyUp(target: HTMLInputElement, key: string): void {
    target.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }));
  }

  it('focuses the next input when the field is full and the cursor is at the end', () => {
    host.isFull = () => true;
    fixture.detectChanges();

    first.value = '12';
    first.setSelectionRange(2, 2); // cursor at end

    spyOn(second, 'focus');
    dispatchKeyUp(first, '2');

    expect(second.focus).toHaveBeenCalled();
  });

  it('does NOT advance when isFull returns false', () => {
    host.isFull = () => false;
    fixture.detectChanges();

    first.value = '1';
    first.setSelectionRange(1, 1);

    spyOn(second, 'focus');
    dispatchKeyUp(first, '1');

    expect(second.focus).not.toHaveBeenCalled();
  });

  it('does NOT advance when the cursor is not at the end of the value', () => {
    host.isFull = () => true;
    fixture.detectChanges();

    first.value = '12';
    first.setSelectionRange(1, 1); // cursor in the middle

    spyOn(second, 'focus');
    dispatchKeyUp(first, '1');

    expect(second.focus).not.toHaveBeenCalled();
  });

  it('does NOT advance on non-printable keys like ArrowLeft', () => {
    host.isFull = () => true;
    fixture.detectChanges();

    first.value = '12';
    first.setSelectionRange(2, 2);

    spyOn(second, 'focus');
    dispatchKeyUp(first, 'ArrowLeft');

    expect(second.focus).not.toHaveBeenCalled();
  });

  it('does NOT advance a second time when the field is already in the ready state (wasReady guard)', () => {
    host.isFull = () => true;
    fixture.detectChanges();

    first.value = '12';
    first.setSelectionRange(2, 2);

    spyOn(second, 'focus');

    // First keyup — should advance
    dispatchKeyUp(first, '2');
    expect(second.focus).toHaveBeenCalledTimes(1);

    // Second keyup without the field changing — should NOT advance again
    dispatchKeyUp(first, '2');
    expect(second.focus).toHaveBeenCalledTimes(1);
  });
});
