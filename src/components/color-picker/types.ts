/**
 * DanxColorPicker Type Definitions
 */

import type { PopoverPlacement, VariantType } from "../../shared/types";
import type { ColorFormat } from "./color-utils";

export type DanxColorPickerOutputFormat = ColorFormat;

export interface DanxColorPickerProps {
  /**
   * Two-way bound color string. Accepts hex (`#abc`, `#aabbcc`, `#aabbccdd`),
   * `rgb()`, `rgba()`, `hsl()`, `hsla()`. Emitted values match `output`.
   */
  modelValue: string;
  /** Optional inline label rendered to the LEFT of the swatch trigger. */
  label?: string;
  /** Disables every interactive control. */
  disabled?: boolean;
  /**
   * Test-id prefix. `<prefix>-{container,swatch,input,error,panel,...}`.
   */
  testId?: string;
  /**
   * Placeholder shown in the text input when empty.
   * @default "#aabbcc"
   */
  placeholder?: string;
  /**
   * Preset palette swatches. Each entry is any color string `parseColor`
   * accepts; the panel falls back to a curated default when omitted.
   */
  swatches?: string[];
  /** Number of palette columns. @default 8 */
  paletteCols?: number;
  /** Enable alpha channel (alpha strip + alpha row in inputs). @default false */
  alpha?: boolean;
  /** Output format for emitted values. @default "hex" */
  output?: DanxColorPickerOutputFormat;
  /** Render a Clear button inside the panel. @default false */
  clearable?: boolean;
  /** Value emitted when the Clear button is pressed. @default "" */
  clearValue?: string;
  /** Persistence key for the recent-colors strip. Omit to disable. */
  storageKey?: string;
  /** Maximum recents tracked. @default 8 */
  recentLimit?: number;
  /** Variant for accent (highlight ring, active tab underline). @default "" */
  variant?: VariantType;
  /** Popover placement around the trigger. @default "bottom" */
  placement?: PopoverPlacement;
  /** Disable the popover panel — useful for inline-only flows. @default false */
  panelDisabled?: boolean;
}

export interface DanxColorPickerEmits {
  /**
   * Fired when the operator commits a new color (text blur/Enter, swatch click,
   * palette click, panel input commit, alpha strip release, eyedropper success,
   * clear button). Format matches the `output` prop.
   */
  (e: "update:modelValue", value: string): void;
  /** Fired when the panel opens. */
  (e: "open"): void;
  /** Fired when the panel closes. */
  (e: "close"): void;
}

export interface DanxColorPickerSlots {
  /** Content rendered AFTER the swatch + text input (trigger row). */
  suffix?(): unknown;
}
