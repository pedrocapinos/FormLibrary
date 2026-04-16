import { FormControl, FormGroup, AbstractControl } from '@angular/forms';
import {
  atLeastOneRequiredValidator,
  createAtLeastOneRequiredValidator,
} from './at-least-one-required-validator';

describe('atLeastOneRequiredValidator', () => {
  function makeGroup(values: Record<string, any>): FormGroup {
    const controls: Record<string, FormControl> = {};
    for (const [key, value] of Object.entries(values)) {
      controls[key] = new FormControl(value);
    }
    return new FormGroup(controls);
  }

  it('returns an error when all controls are null', () => {
    const group = makeGroup({ id: null, name: null, salary: null });
    expect(atLeastOneRequiredValidator(group)).toEqual({ atLeastOneRequired: true });
  });

  it('returns an error when all controls are empty strings', () => {
    const group = makeGroup({ id: '', name: '' });
    expect(atLeastOneRequiredValidator(group)).toEqual({ atLeastOneRequired: true });
  });

  it('returns an error when all values are whitespace only', () => {
    const group = makeGroup({ name: '   ', code: '  ' });
    expect(atLeastOneRequiredValidator(group)).toEqual({ atLeastOneRequired: true });
  });

  it('returns null when at least one control has a non-empty string value', () => {
    const group = makeGroup({ id: null, name: 'Alice' });
    expect(atLeastOneRequiredValidator(group)).toBeNull();
  });

  it('returns null when a control has value 0 (zero is a valid filter value)', () => {
    const group = makeGroup({ id: 0, name: null });
    expect(atLeastOneRequiredValidator(group)).toBeNull();
  });

  it('returns null when passed a non-FormGroup control', () => {
    const singleControl = new FormControl('test') as unknown as AbstractControl;
    expect(atLeastOneRequiredValidator(singleControl)).toBeNull();
  });
});

describe('createAtLeastOneRequiredValidator', () => {
  function makeGroup(values: Record<string, any>): FormGroup {
    const controls: Record<string, FormControl> = {};
    for (const [key, value] of Object.entries(values)) {
      controls[key] = new FormControl(value);
    }
    return new FormGroup(controls);
  }

  it('with no keys behaves identically to atLeastOneRequiredValidator', () => {
    const validator = createAtLeastOneRequiredValidator();
    const emptyGroup = makeGroup({ name: null, code: null });
    const filledGroup = makeGroup({ name: 'Alice', code: null });
    expect(validator(emptyGroup)).toEqual({ atLeastOneRequired: true });
    expect(validator(filledGroup)).toBeNull();
  });

  it('only checks specified keys — ignores other controls', () => {
    const validator = createAtLeastOneRequiredValidator(['name', 'code']);
    // Group has an extra filled control `description`, but it's not in keys
    const group = makeGroup({ name: null, code: null, description: 'some value' });
    expect(validator(group)).toEqual({ atLeastOneRequired: true });
  });

  it('returns null when one of the specified keys has a value', () => {
    const validator = createAtLeastOneRequiredValidator(['name', 'code']);
    const group = makeGroup({ name: 'Alice', code: null, description: null });
    expect(validator(group)).toBeNull();
  });

  it('treats 0 as a valid value for a specified key', () => {
    const validator = createAtLeastOneRequiredValidator(['code', 'name']);
    const group = makeGroup({ code: 0, name: null, description: null });
    expect(validator(group)).toBeNull();
  });

  it('ignores unknown keys (control does not exist in the group)', () => {
    const validator = createAtLeastOneRequiredValidator(['nonExistent']);
    const group = makeGroup({ name: 'Alice' });
    // nonExistent resolves to null, filtered out → no controls to check → invalid
    expect(validator(group)).toEqual({ atLeastOneRequired: true });
  });

  it('returns null when passed a non-FormGroup control', () => {
    const validator = createAtLeastOneRequiredValidator(['name']);
    const singleControl = new FormControl('test') as unknown as AbstractControl;
    expect(validator(singleControl)).toBeNull();
  });
});
