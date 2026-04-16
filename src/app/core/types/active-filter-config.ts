import type { FormatType, FormatOptions } from '../services/format.service';

export interface Formattable {
  format?: FormatType;
  formatOptions?: FormatOptions;
  formatter?: (value: any, ...args: any[]) => string;
}

export interface ActiveFilterConfig extends Formattable {
  label: string;
  hidden?: boolean;
  tabId?: string;
  tabLabel?: string;
}

export interface TabDefinition {
  tabId: string;
  tabLabel?: string;
  fields: Record<string, Omit<ActiveFilterConfig, 'tabId' | 'tabLabel'>>;
}

/** Builds a flat ActiveFilterConfig record from a tab-first structured declaration. */
export function defineTabFilterConfig(
  tabs: TabDefinition[]
): Record<string, ActiveFilterConfig> {
  const result: Record<string, ActiveFilterConfig> = {};
  for (const tab of tabs) {
    for (const [key, config] of Object.entries(tab.fields)) {
      result[key] = { ...config, tabId: tab.tabId, tabLabel: tab.tabLabel };
    }
  }
  return result;
}
