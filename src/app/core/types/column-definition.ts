import type { Formattable } from './active-filter-config';

export interface ColumnDefinition<T = any> extends Formattable {
  key: keyof T & string;
  header: string;
  width?: string;
  formatter?: (value: any, row: T) => string;
  calculateTotal?: boolean;
  sticky?: boolean;
  visible?: boolean;
}
