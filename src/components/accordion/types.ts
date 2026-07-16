/**
 * DanxAccordion Type Definitions
 */

/**
 * A single collapsible section. Header/panel content comes from the
 * `header`/`panel` scoped slots — `label` is a plain-text convenience for
 * when no `header` slot content is given.
 */
export interface AccordionItem {
  /** Unique identifier for this item, matched against modelValue. */
  value: string;

  /** Convenience header text, rendered when no `header` slot is provided. */
  label?: string;

  /** Disables toggling this item; it stays in its current open/closed state. */
  disabled?: boolean;
}

export interface DanxAccordionProps {
  /** The collapsible sections to render. */
  items: AccordionItem[];

  /**
   * When true, any number of items may be open at once and `modelValue`
   * is a `string[]` of open item values. When false (default), at most
   * one item is open and `modelValue` is a single `string | null`.
   * @default false
   */
  multiple?: boolean;
}

export interface DanxAccordionSlots {
  /** Header content for an item. Falls back to `item.label`. */
  header?(props: { item: AccordionItem; isOpen: boolean }): unknown;
  /** Panel content for an item, rendered only while the item is open. */
  panel?(props: { item: AccordionItem; isOpen: boolean }): unknown;
}
