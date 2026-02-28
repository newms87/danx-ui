/**
 * DanxSelect Type Definitions
 *
 * Types for the select/dropdown component including options,
 * props, emits, and slots.
 */

import type { Component } from "vue";
import type { FormFieldBaseProps, FormFieldEmits } from "../../shared/form-types";
import type { VariantType } from "../../shared/types";
import type { IconName } from "../icon/icons";
import type { PopoverPlacement } from "../popover";

/** A single option in the select dropdown */
export interface SelectOption {
  /** Unique value identifying this option */
  value: string | number;

  /** Display label for the option */
  label: string;

  /** Optional icon (name string, SVG string, or Vue component) */
  icon?: Component | IconName | string;

  /** Optional secondary description text */
  description?: string;

  /** Whether this option is disabled (cannot be selected) */
  disabled?: boolean;

  /** Optional group name for grouping related options */
  group?: string;
}

/** Model type: single value, array for multi, or null for cleared */
export type SelectModelValue = string | number | (string | number)[] | null;

export interface DanxSelectProps extends FormFieldBaseProps {
  /** Available options to choose from */
  options: SelectOption[];

  /** Enable multi-select mode (model becomes array) */
  multiple?: boolean;

  /** Show a search input in the dropdown to filter options */
  filterable?: boolean;

  /** Show a clear button when a value is selected */
  clearable?: boolean;

  /** Visual variant applied to trigger and popover */
  variant?: VariantType;

  /** Key to use for option label when options are objects */
  optionLabel?: string;

  /** Key to use for option value when options are objects */
  optionValue?: string;

  /** Max number of selected chips before showing "+N more" */
  maxSelectedLabels?: number;

  /** Placeholder text for the filter input */
  filterPlaceholder?: string;

  /** Message shown when options array is empty */
  emptyMessage?: string;

  /** Message shown when filter matches nothing */
  emptyFilterMessage?: string;

  /** Show a loading spinner in the dropdown */
  loading?: boolean;

  /** Allow creating new options from filter text */
  creatable?: boolean;

  /** Dropdown placement direction */
  placement?: PopoverPlacement;
}

export interface DanxSelectEmits extends FormFieldEmits {
  /** Emitted with current filter text (for server-side filtering) */
  (e: "filter", text: string): void;

  /** Emitted when a new option is created via creatable mode */
  (e: "create", value: string): void;
}

/** Slot scope for option rendering */
export interface SelectOptionSlotScope {
  /** The option being rendered */
  option: SelectOption;

  /** Whether this option is currently selected */
  selected: boolean;

  /** Whether this option is currently highlighted via keyboard */
  highlighted: boolean;
}

/** Slot scope for selected option rendering */
export interface SelectSelectedSlotScope {
  /** The selected option */
  option: SelectOption;
}

export interface DanxSelectSlots {
  /** Custom rendering for each option in the dropdown */
  option?(props: SelectOptionSlotScope): unknown;

  /** Custom rendering for the selected value in the trigger */
  selected?(props: SelectSelectedSlotScope): unknown;

  /** Custom empty state content */
  empty?(): unknown;

  /** Content above the option list */
  header?(): unknown;

  /** Content below the option list */
  footer?(): unknown;
}
