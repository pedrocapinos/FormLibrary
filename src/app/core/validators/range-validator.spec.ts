import { FormControl, FormGroup } from '@angular/forms';
import { createRangeValidator } from './range-validator';

describe('createRangeValidator', () => {
  describe('default keys (start / end)', () => {
    const validator = createRangeValidator();

    it('returns null when start is null', () => {
      const group = new FormGroup({
        start: new FormControl<number | null>(null),
        end: new FormControl<number | null>(100),
      });
      expect(validator(group)).toBeNull();
    });

    it('returns null when end is null', () => {
      const group = new FormGroup({
        start: new FormControl<number | null>(50),
        end: new FormControl<number | null>(null),
      });
      expect(validator(group)).toBeNull();
    });

    it('returns null when start equals end', () => {
      const group = new FormGroup({
        start: new FormControl<number | null>(100),
        end: new FormControl<number | null>(100),
      });
      expect(validator(group)).toBeNull();
    });

    it('returns null when start is less than end', () => {
      const group = new FormGroup({
        start: new FormControl<number | null>(50),
        end: new FormControl<number | null>(100),
      });
      expect(validator(group)).toBeNull();
    });

    it('returns rangeInvalid: true when start exceeds end (no labels)', () => {
      const group = new FormGroup({
        start: new FormControl<number | null>(200),
        end: new FormControl<number | null>(100),
      });
      expect(validator(group)).toEqual({ rangeInvalid: true });
    });
  });

  describe('custom keys and labels', () => {
    it('reads values using the configured startKey and endKey', () => {
      const validator = createRangeValidator({ startKey: 'salaryMin', endKey: 'salaryMax' });
      const group = new FormGroup({
        salaryMin: new FormControl<number | null>(500),
        salaryMax: new FormControl<number | null>(200),
      });
      expect(validator(group)).not.toBeNull();
    });

    it('includes label params in the error when labels are configured', () => {
      const validator = createRangeValidator({
        startKey: 'salaryMin',
        endKey: 'salaryMax',
        startLabel: 'Salary From',
        endLabel: 'Salary To',
      });
      const group = new FormGroup({
        salaryMin: new FormControl<number | null>(500),
        salaryMax: new FormControl<number | null>(200),
      });
      expect(validator(group)).toEqual({
        rangeInvalid: { label: 'Salary From', otherLabel: 'Salary To' },
      });
    });
  });
});
