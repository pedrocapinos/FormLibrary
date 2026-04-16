import { NavigationService } from './navigation.service';

describe('NavigationService', () => {
  let service: NavigationService;

  beforeEach(() => {
    service = new NavigationService();
  });

  it('should start with no return URL', () => {
    expect(service.returnUrl).toBeNull();
  });

  it('should store and retrieve return URL', () => {
    service.setReturnUrl('/employees');
    expect(service.returnUrl).toBe('/employees');
  });

  it('should consume return URL (one-shot)', () => {
    service.setReturnUrl('/employees/5');
    const url = service.consumeReturnUrl();
    expect(url).toBe('/employees/5');
    expect(service.returnUrl).toBeNull();
  });

  it('should return null when consuming with no URL set', () => {
    expect(service.consumeReturnUrl()).toBeNull();
  });

  it('should overwrite previous return URL', () => {
    service.setReturnUrl('/employees');
    service.setReturnUrl('/employees/42');
    expect(service.consumeReturnUrl()).toBe('/employees/42');
  });
});
