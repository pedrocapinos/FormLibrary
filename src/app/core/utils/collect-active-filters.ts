import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { ActiveFilter } from '../types/active-filter';
import { ActiveFilterConfig } from '../types/active-filter-config';
import { FormatService } from '../services/format.service';
import { isEmpty } from './is-empty';

export function collectActiveFilters(
  form: FormGroup,
  config: Record<string, ActiveFilterConfig>,
  formatService: FormatService,
  rootEl?: HTMLElement
): ActiveFilter[] {
  const filters: ActiveFilter[] = [];
  const elementsByName = rootEl ? indexElementsByControlName(rootEl) : null;

  function traverse(control: AbstractControl, path: string) {
    if (control instanceof FormGroup) {
      Object.entries(control.controls).forEach(([name, child]) => {
        traverse(child, path ? `${path}.${name}` : name);
      });
      return;
    }

    if (control instanceof FormArray) {
      control.controls.forEach((child, index) => {
        traverse(child, path ? `${path}.${index}` : index.toString());
      });
      return;
    }

    // Replace array indices with wildcards (e.g. phones.0.number -> phones.*.number)
    const configPath = path.replace(/\.\d+(\.|$)/g, '.*$1');
    const fieldConfig = config[configPath] || config[path];

    if (!fieldConfig || fieldConfig.hidden) return;

    if (elementsByName && isHiddenByHost(path, elementsByName)) return;

    if (isEmpty(control.value)) return;

    let displayValue = '';

    if (fieldConfig.formatter) {
      displayValue = fieldConfig.formatter(control.value);
    } else if (fieldConfig.format) {
      displayValue = formatService.format(
        control.value,
        fieldConfig.format,
        fieldConfig.formatOptions
      );
    } else if (typeof control.value === 'object' && control.value !== null) {
      // Object value with no formatter/format: skip rather than render "[object Object]"
      return;
    } else {
      displayValue = String(control.value);
    }

    if (displayValue) {
      filters.push({
        controlName: path,
        label: fieldConfig.label,
        displayValue,
        tabId: fieldConfig.tabId,
        tabLabel: fieldConfig.tabLabel,
      });
    }
  }

  traverse(form, '');
  return filters;
}

function indexElementsByControlName(rootEl: HTMLElement): Map<string, HTMLElement[]> {
  const map = new Map<string, HTMLElement[]>();
  rootEl.querySelectorAll<HTMLElement>('[formcontrolname]').forEach((el) => {
    const name = el.getAttribute('formcontrolname');
    if (!name) return;
    const bucket = map.get(name);
    if (bucket) bucket.push(el);
    else map.set(name, [el]);
  });
  return map;
}

function isHiddenByHost(path: string, elementsByName: Map<string, HTMLElement[]>): boolean {
  // DOM is indexed only by leaf formcontrolname, so ambiguous paths (nested
  // FormArrays, or duplicate leaf names across groups) cannot be resolved
  // reliably. Skip the host-hide check in those cases rather than risk a
  // false positive on the wrong element.
  const numericSegments = (path.match(/\.\d+(?:\.|$)/g) ?? []).length;
  if (numericSegments > 1) return false;

  const dot = path.lastIndexOf('.');
  const leafName = dot >= 0 ? path.slice(dot + 1) : path;
  const bucket = elementsByName.get(leafName);
  if (!bucket) return false;

  if (numericSegments === 0) {
    return bucket.length === 1 && bucket[0].hasAttribute('data-active-filters-hide');
  }

  const match = path.match(/\.(\d+)(?:\.|$)/);
  const rowIndex = match ? parseInt(match[1], 10) : 0;
  return !!bucket[rowIndex]?.hasAttribute('data-active-filters-hide');
}

