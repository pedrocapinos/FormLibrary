import { ErrorMessageService } from './error-message.service';

// Instantiate a fresh service per test — configure() is stateful.
function createService(): ErrorMessageService {
  return new ErrorMessageService();
}

describe('ErrorMessageService', () => {
  describe('resolve() — default messages', () => {
    it('returns the required message with the label', () => {
      const svc = createService();
      expect(svc.resolve({ required: true }, 'Name')).toBe('Name is required');
    });

    it('returns the minlength message with requiredLength param', () => {
      const svc = createService();
      const msg = svc.resolve({ minlength: { requiredLength: 3, actualLength: 1 } }, 'Name');
      expect(msg).toBe('Name must be at least 3 characters');
    });

    it('returns the maxlength message with requiredLength param', () => {
      const svc = createService();
      const msg = svc.resolve({ maxlength: { requiredLength: 8, actualLength: 10 } }, 'Name');
      expect(msg).toBe('Name must not exceed 8 characters');
    });

    it('returns the rangeInvalid message without labels (generic form)', () => {
      const svc = createService();
      const msg = svc.resolve({ rangeInvalid: true }, 'Salary From');
      expect(msg).toBe('Salary From range is invalid');
    });

    it('returns the rangeInvalid message with otherLabel (label-specific form)', () => {
      const svc = createService();
      const msg = svc.resolve(
        { rangeInvalid: { label: 'Salary From', otherLabel: 'Salary To' } },
        'Salary From'
      );
      expect(msg).toBe('Salary From cannot exceed Salary To');
    });

    it('returns the atLeastOneRequired message', () => {
      const svc = createService();
      expect(svc.resolve({ atLeastOneRequired: true }, 'filter')).toBe(
        'At least one filter field is required'
      );
    });

    it('returns "Invalid field" fallback for an unknown error key', () => {
      const svc = createService();
      expect(svc.resolve({ unknownValidator: true }, 'Field')).toBe('Invalid field');
    });
  });

  describe('configure() — global overrides', () => {
    it('overrides the default required message for all subsequent resolve() calls', () => {
      const svc = createService();
      svc.configure({ required: (label) => `${label} cannot be empty` });
      expect(svc.resolve({ required: true }, 'Email')).toBe('Email cannot be empty');
    });

    it('leaves other messages unchanged when only one is overridden', () => {
      const svc = createService();
      svc.configure({ required: () => 'custom required' });
      expect(svc.resolve({ pattern: true }, 'CPF')).toBe('CPF format is invalid');
    });
  });

  describe('resolve() — per-field customMessages', () => {
    it('custom message outranks both configured and default messages', () => {
      const svc = createService();
      svc.configure({ required: (label) => `${label} (configured) is required` });

      const msg = svc.resolve({ required: true }, 'Name', {
        required: () => 'Please enter your full name',
      });
      expect(msg).toBe('Please enter your full name');
    });
  });
});
