import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogIframeComponent } from './dialog-iframe.component';

describe('DialogIframeComponent', () => {
  let fixture: ComponentFixture<DialogIframeComponent>;
  let component: DialogIframeComponent;
  let nativeElement: HTMLElement;

  const TEST_ORIGIN = 'https://other-app.com';
  const TEST_SRC = 'https://other-app.com/picker';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogIframeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogIframeComponent);
    component = fixture.componentInstance;
    component.src = TEST_SRC;
    component.origin = TEST_ORIGIN;
    fixture.detectChanges();

    nativeElement = fixture.nativeElement;
  });

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------

  describe('rendering', () => {
    it('renders an iframe element', () => {
      const iframe = nativeElement.querySelector('iframe');
      expect(iframe).toBeTruthy();
    });

    it('sets the sandbox attribute', () => {
      const iframe = nativeElement.querySelector('iframe')!;
      expect(iframe.getAttribute('sandbox')).toBe('allow-scripts allow-same-origin allow-forms');
    });

    it('applies default width and height', () => {
      const iframe = nativeElement.querySelector('iframe')!;
      expect(iframe.style.width).toBe('100%');
      expect(iframe.style.height).toBe('500px');
    });

    it('applies custom width and height', () => {
      component.width = '800px';
      component.height = '600px';
      fixture.detectChanges();

      const iframe = nativeElement.querySelector('iframe')!;
      expect(iframe.style.width).toBe('800px');
      expect(iframe.style.height).toBe('600px');
    });

    it('sets the title attribute for accessibility', () => {
      const iframe = nativeElement.querySelector('iframe')!;
      expect(iframe.title).toBe('External content');
    });

    it('uses custom iframe title', () => {
      component.iframeTitle = 'Class Picker';
      fixture.detectChanges();

      const iframe = nativeElement.querySelector('iframe')!;
      expect(iframe.title).toBe('Class Picker');
    });
  });

  // ---------------------------------------------------------------------------
  // postMessage — token handshake
  // ---------------------------------------------------------------------------

  describe('token handshake', () => {
    it('sends token when iframe posts ready message', () => {
      component.token = 'test-jwt-token';
      fixture.detectChanges();

      const iframe = nativeElement.querySelector('iframe')!;
      const postMessageSpy = spyOn(iframe.contentWindow!, 'postMessage');

      window.dispatchEvent(
        new MessageEvent('message', {
          data: { type: 'ready' },
          origin: TEST_ORIGIN,
        })
      );

      expect(postMessageSpy).toHaveBeenCalled();
      const args = postMessageSpy.calls.mostRecent().args as unknown[];
      expect(args[0]).toEqual({ type: 'token', token: 'test-jwt-token' });
      expect(args[1]).toBe(TEST_ORIGIN);
    });

    it('emits ready event when iframe posts ready message', () => {
      const readySpy = spyOn(component.ready, 'emit');

      window.dispatchEvent(
        new MessageEvent('message', {
          data: { type: 'ready' },
          origin: TEST_ORIGIN,
        })
      );

      expect(readySpy).toHaveBeenCalled();
    });

    it('does not send token if token input is not set', () => {
      component.token = undefined;
      fixture.detectChanges();

      const iframe = nativeElement.querySelector('iframe')!;
      const postMessageSpy = spyOn(iframe.contentWindow!, 'postMessage');

      window.dispatchEvent(
        new MessageEvent('message', {
          data: { type: 'ready' },
          origin: TEST_ORIGIN,
        })
      );

      expect(postMessageSpy).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // postMessage — result
  // ---------------------------------------------------------------------------

  describe('result', () => {
    it('emits result data when iframe posts result message', () => {
      const resultSpy = spyOn(component.result, 'emit');
      const payload = { id: 42, name: 'Test Class' };

      window.dispatchEvent(
        new MessageEvent('message', {
          data: { type: 'result', data: payload },
          origin: TEST_ORIGIN,
        })
      );

      expect(resultSpy).toHaveBeenCalledWith(payload);
    });
  });

  // ---------------------------------------------------------------------------
  // Origin validation
  // ---------------------------------------------------------------------------

  describe('origin validation', () => {
    it('ignores messages from a different origin', () => {
      const resultSpy = spyOn(component.result, 'emit');
      const readySpy = spyOn(component.ready, 'emit');

      window.dispatchEvent(
        new MessageEvent('message', {
          data: { type: 'result', data: { id: 1 } },
          origin: 'https://malicious-site.com',
        })
      );

      expect(resultSpy).not.toHaveBeenCalled();
      expect(readySpy).not.toHaveBeenCalled();
    });

    it('ignores messages with invalid data format', () => {
      const resultSpy = spyOn(component.result, 'emit');

      window.dispatchEvent(
        new MessageEvent('message', {
          data: 'not an object',
          origin: TEST_ORIGIN,
        })
      );

      expect(resultSpy).not.toHaveBeenCalled();
    });

    it('ignores messages without a type field', () => {
      const resultSpy = spyOn(component.result, 'emit');

      window.dispatchEvent(
        new MessageEvent('message', {
          data: { foo: 'bar' },
          origin: TEST_ORIGIN,
        })
      );

      expect(resultSpy).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // Cleanup
  // ---------------------------------------------------------------------------

  describe('cleanup', () => {
    it('removes the message listener on destroy', () => {
      const removeSpy = spyOn(window, 'removeEventListener').and.callThrough();
      fixture.destroy();
      expect(removeSpy).toHaveBeenCalledWith('message', jasmine.any(Function));
    });

    it('does not emit after destroy', () => {
      const resultSpy = spyOn(component.result, 'emit');
      fixture.destroy();

      window.dispatchEvent(
        new MessageEvent('message', {
          data: { type: 'result', data: { id: 1 } },
          origin: TEST_ORIGIN,
        })
      );

      expect(resultSpy).not.toHaveBeenCalled();
    });
  });
});
