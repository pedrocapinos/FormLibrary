import { SearchStateService } from './search-state.service';

describe('SearchStateService', () => {
  let svc: SearchStateService;

  beforeEach(() => {
    svc = new SearchStateService();
  });

  it('returns null for an unknown key', () => {
    expect(svc.restore('nonexistent')).toBeNull();
  });

  it('restores a saved value', () => {
    svc.save('employee-filters', { id: 5, name: 'Alice' });
    expect(svc.restore('employee-filters')).toEqual({ id: 5, name: 'Alice' });
  });

  it('returns null after a key is cleared', () => {
    svc.save('employee-filters', { id: 5 });
    svc.clear('employee-filters');
    expect(svc.restore('employee-filters')).toBeNull();
  });

  it('keeps keys independent of each other', () => {
    svc.save('/employees', { id: 1 });
    svc.save('employee-filters', { name: 'Alice' });
    svc.clear('/employees');

    expect(svc.restore('/employees')).toBeNull();
    expect(svc.restore('employee-filters')).toEqual({ name: 'Alice' });
  });

  it('clearAll removes all stored entries', () => {
    svc.save('/employees', { id: 1 });
    svc.save('employee-filters', { name: 'Alice' });
    svc.save('playground-filters', { text: 'hello' });
    svc.clearAll();

    expect(svc.restore('/employees')).toBeNull();
    expect(svc.restore('employee-filters')).toBeNull();
    expect(svc.restore('playground-filters')).toBeNull();
  });
});
