<!--
/**
 * DanxSelect - Feature-rich dropdown select component
 *
 * A polished select/dropdown built on DanxPopover for the floating panel,
 * DanxChip for option and tag rendering, and the shared form field
 * infrastructure for label/error/helper text. The trigger matches
 * DanxInput styling by default (field background and border).
 *
 * Features:
 * - Single and multi-select modes
 * - Bordered trigger matching DanxInput
 * - Filterable search input with auto-focus
 * - Keyboard navigation (Arrow, Enter, Space, Escape, Home, End)
 * - Option groups with headers
 * - Clearable selection
 * - Creatable mode (create new options from filter text)
 * - Variant coloring on trigger and dropdown
 * - Three sizes (sm, md, lg)
 * - Full ARIA: combobox, listbox, option roles
 * - DanxChip rendering for multi-select tags
 * - Loading and empty states
 * - Custom slots for options, selected value, header, footer, empty
 *
 * @props
 *   options: SelectOption[] - Available options (required)
 *   label?: string - Label text above the field
 *   helperText?: string - Helper text below (hidden when error shown)
 *   error?: string | boolean - Error state/message
 *   disabled?: boolean - Disables the select
 *   readonly?: boolean - Makes the select read-only
 *   required?: boolean - Marks as required (asterisk, aria-required)
 *   size?: InputSize - Field size ("sm" | "md" | "lg", default "md")
 *   placeholder?: string - Placeholder when no value selected
 *   name?: string - Name attribute
 *   id?: string - HTML id (auto-generated if omitted)
 *   multiple?: boolean - Multi-select mode
 *   filterable?: boolean - Search input in dropdown
 *   clearable?: boolean - Show clear button
 *   variant?: VariantType - Trigger + popover coloring
 *   optionLabel?: string - Key for label on option objects
 *   optionValue?: string - Key for value on option objects
 *   maxSelectedLabels?: number - Max chips before "+N more" (default 3)
 *   filterPlaceholder?: string - Filter input placeholder
 *   emptyMessage?: string - Message when no options
 *   emptyFilterMessage?: string - Message when filter matches nothing
 *   loading?: boolean - Show loading indicator
 *   creatable?: boolean - Allow creating new options
 *   placement?: PopoverPlacement - Dropdown direction
 *
 * @emits
 *   focus - When trigger receives focus
 *   blur - When trigger loses focus
 *   clear - When clear button is clicked
 *   filter - With current filter text for server-side filtering
 *   create - With new value text when creating
 *
 * @slots
 *   option({ option, selected, highlighted }) - Custom option rendering
 *   selected({ option }) - Custom selected value in trigger
 *   empty - Custom empty state
 *   header - Content above option list
 *   footer - Content below option list
 *
 * @tokens
 *   --dx-select-trigger-bg - Trigger background (default field bg)
 *   --dx-select-trigger-text - Trigger text color
 *   --dx-select-trigger-border - Trigger border (default field border)
 *   --dx-select-trigger-border-hover - Hover border color
 *   --dx-select-trigger-border-focus - Focus/open border color
 *   --dx-select-trigger-border-error - Error border color
 *   --dx-select-placeholder - Placeholder color
 *   --dx-select-chevron-color - Chevron icon color
 *   --dx-select-option-bg-hover - Option hover background
 *   --dx-select-option-bg-selected - Selected option background
 *   --dx-select-option-check - Checkmark/checkbox color
 *   --dx-select-panel-max-height - Max dropdown height
 *   --dx-select-disabled-opacity - Disabled opacity
 *   --dx-select-{size}-height - Height per size
 *   --dx-select-{size}-font-size - Font per size
 *   --dx-select-{size}-padding-x - Padding per size
 *
 * @example
 *   Basic select:
 *     <DanxSelect v-model="color" :options="colors" label="Color" />
 *
 *   Multi-select:
 *     <DanxSelect v-model="tags" :options="tagOptions" multiple />
 *
 *   Filterable with variant:
 *     <DanxSelect v-model="status" :options="statuses" filterable variant="info" />
 */
-->

<script setup lang="ts">
import { computed, nextTick, ref, toRef, watch } from "vue";
import { useFormField } from "../../shared/composables/useFormField";
import { useVariant } from "../../shared/composables/useVariant";
import { DanxChip } from "../chip";
import { DanxFieldWrapper } from "../field-wrapper";
import { DanxIcon } from "../icon";
import { DanxPopover } from "../popover";
import { DanxScroll } from "../scroll";
import type { DanxSelectEmits, DanxSelectProps, DanxSelectSlots, SelectModelValue } from "./types";
import { useSelect } from "./useSelect";

const props = withDefaults(defineProps<DanxSelectProps>(), {
  size: "md",
  variant: "",
  optionLabel: "label",
  optionValue: "value",
  maxSelectedLabels: 3,
  filterPlaceholder: "Search...",
  emptyMessage: "No options",
  emptyFilterMessage: "No results",
  placement: "bottom",
});

const emit = defineEmits<DanxSelectEmits>();

const model = defineModel<SelectModelValue>();

defineSlots<DanxSelectSlots>();

const { fieldId, hasError, inputAriaAttrs } = useFormField(props);

const SELECT_VARIANT_TOKENS = {
  "--dx-select-trigger-bg": "bg",
  "--dx-select-trigger-text": "text",
  "--dx-select-trigger-border": "border",
};

const variantStyle = useVariant(toRef(props, "variant"), "select", SELECT_VARIANT_TOKENS);

const {
  isOpen,
  filterText,
  highlightedIndex,
  filteredOptions,
  groupedOptions,
  selectedOptions,
  displayLabel,
  showCreateOption,
  panelMinWidth,
  isSelected,
  toggleOption,
  openDropdown,
  closeDropdown,
  handleClear,
  handleKeydown,
  handleFilterInput,
  handleCreate,
  observeTriggerWidth,
  triggerAriaAttrs,
  optionAriaAttrs,
} = useSelect({ model, props, emit });

// Template refs
const triggerRef = ref<HTMLElement | null>(null);
const filterInputRef = ref<HTMLInputElement | null>(null);

/** Container classes following BEM conventions */
const containerClasses = computed(() => {
  const classes = ["danx-select", `danx-select--${props.size || "md"}`];
  if (isOpen.value) classes.push("danx-select--open");
  if (hasError.value) classes.push("danx-select--error");
  if (props.disabled) classes.push("danx-select--disabled");
  if (props.readonly) classes.push("danx-select--readonly");
  if (props.multiple) classes.push("danx-select--multiple");
  return classes;
});

/** Whether the clear button should be visible */
const showClear = computed(() => {
  if (!props.clearable || props.disabled || props.readonly) return false;
  if (props.multiple) return Array.isArray(model.value) && model.value.length > 0;
  return model.value != null;
});

/** Multi-select: visible chips vs overflow count */
const visibleChips = computed(() => selectedOptions.value.slice(0, props.maxSelectedLabels));
const overflowCount = computed(() =>
  Math.max(0, selectedOptions.value.length - props.maxSelectedLabels)
);

/** Flat index list for keyboard navigation across groups */
const flatOptionIndex = computed(() => {
  const indexMap = new Map<string | number, number>();
  filteredOptions.value.forEach((opt, i) => {
    indexMap.set(opt.value, i);
  });
  return indexMap;
});

/** Whether the empty state should show */
const showEmpty = computed(() => !props.loading && filteredOptions.value.length === 0);

const emptyText = computed(() => {
  if (filterText.value && props.options.length > 0) return props.emptyFilterMessage;
  return props.emptyMessage;
});

// Focus the filter input when dropdown opens
watch(isOpen, async (open) => {
  if (open && props.filterable) {
    await nextTick();
    filterInputRef.value?.focus();
  }
  if (!open) {
    // Return focus to trigger on close
    await nextTick();
    triggerRef.value?.focus();
  }
});

// Observe trigger width for panel min-width
watch(triggerRef, (el) => {
  observeTriggerWidth(el);
});

function handleTriggerClick(): void {
  if (props.disabled || props.readonly) return;
  if (isOpen.value) {
    closeDropdown();
  } else {
    openDropdown();
  }
}

function handleChipRemove(value: string | number): void {
  if (props.disabled || props.readonly) return;
  const option =
    filteredOptions.value.find((opt) => opt.value === value) ??
    selectedOptions.value.find((opt) => opt.value === value);
  if (option) toggleOption(option);
}
</script>

<template>
  <DanxFieldWrapper
    :label="label"
    :error="error"
    :helper-text="helperText"
    :field-id="fieldId"
    :required="required"
    :size="size"
    :disabled="disabled"
  >
    <DanxPopover v-model="isOpen" trigger="manual" :placement="placement" :variant="variant">
      <template #trigger>
        <div
          ref="triggerRef"
          :id="fieldId"
          :class="containerClasses"
          :style="variantStyle"
          :tabindex="disabled ? -1 : 0"
          v-bind="{ ...inputAriaAttrs, ...triggerAriaAttrs }"
          @click="handleTriggerClick"
          @keydown="handleKeydown"
          @focus="emit('focus', $event)"
          @blur="emit('blur', $event)"
        >
          <!-- Single-select: display value -->
          <template v-if="!multiple">
            <slot v-if="selectedOptions.length > 0" name="selected" :option="selectedOptions[0]!">
              <span class="danx-select__value">{{ displayLabel }}</span>
            </slot>
            <span v-else class="danx-select__placeholder">
              {{ placeholder || "\u00A0" }}
            </span>
          </template>

          <!-- Multi-select: chips -->
          <template v-else>
            <div v-if="selectedOptions.length > 0" class="danx-select__tags">
              <DanxChip
                v-for="opt in visibleChips"
                :key="opt.value"
                :label="opt.label"
                :icon="opt.icon"
                :variant="variant"
                size="xs"
                removable
                @remove="handleChipRemove(opt.value)"
              />
              <DanxChip
                v-if="overflowCount > 0"
                :label="`+${overflowCount} more`"
                size="xs"
                variant="muted"
              />
            </div>
            <span v-else class="danx-select__placeholder">
              {{ placeholder || "\u00A0" }}
            </span>
          </template>

          <!-- Clear button -->
          <button
            v-if="showClear"
            type="button"
            class="danx-select__clear"
            aria-label="Clear"
            @click.stop="handleClear"
          >
            <DanxIcon icon="close" />
          </button>

          <!-- Chevron -->
          <span class="danx-select__chevron">
            <DanxIcon icon="chevron-down" />
          </span>
        </div>
      </template>

      <!-- Dropdown panel -->
      <div class="danx-select__panel" :style="{ minWidth: panelMinWidth }">
        <!-- Filter search input -->
        <div v-if="filterable" class="danx-select__search">
          <input
            ref="filterInputRef"
            :value="filterText"
            :placeholder="filterPlaceholder"
            type="text"
            @input="handleFilterInput"
            @keydown="handleKeydown"
          />
        </div>

        <!-- Loading indicator -->
        <div v-if="loading" class="danx-select__loading">Loading...</div>

        <!-- Header slot -->
        <slot name="header" />

        <!-- Option list -->
        <DanxScroll
          role="listbox"
          class="danx-select__listbox"
          size="xs"
          :aria-multiselectable="multiple ? 'true' : undefined"
        >
          <template v-for="[group, options] of groupedOptions" :key="group ?? '__ungrouped'">
            <div v-if="group" class="danx-select__group-header">
              {{ group }}
            </div>
            <div
              v-for="option in options"
              :key="option.value"
              :class="[
                'danx-select__option',
                {
                  'danx-select__option--highlighted':
                    highlightedIndex === flatOptionIndex.get(option.value),
                  'danx-select__option--selected': isSelected(option),
                  'danx-select__option--disabled': option.disabled,
                },
              ]"
              v-bind="optionAriaAttrs(option, flatOptionIndex.get(option.value) ?? 0)"
              @click="toggleOption(option)"
              @mouseenter="highlightedIndex = flatOptionIndex.get(option.value) ?? -1"
            >
              <slot
                name="option"
                :option="option"
                :selected="isSelected(option)"
                :highlighted="highlightedIndex === flatOptionIndex.get(option.value)"
              >
                <!-- Checkmark (left side, both single and multi) -->
                <span class="danx-select__option-check">
                  <DanxIcon v-if="isSelected(option)" icon="check" />
                </span>

                <!-- Option icon -->
                <DanxIcon v-if="option.icon" :icon="option.icon" class="danx-select__option-icon" />

                <!-- Option content -->
                <span class="danx-select__option-content">
                  <span>{{ option.label }}</span>
                  <span v-if="option.description" class="danx-select__option-description">
                    {{ option.description }}
                  </span>
                </span>
              </slot>
            </div>
          </template>

          <!-- Creatable option -->
          <div
            v-if="showCreateOption"
            :class="[
              'danx-select__option',
              'danx-select__option--create',
              { 'danx-select__option--highlighted': highlightedIndex >= filteredOptions.length },
            ]"
            @click="handleCreate"
            @mouseenter="highlightedIndex = filteredOptions.length"
          >
            Create "{{ filterText.trim() }}"
          </div>

          <!-- Empty state -->
          <div v-if="showEmpty" class="danx-select__empty">
            <slot name="empty">
              {{ emptyText }}
            </slot>
          </div>
        </DanxScroll>

        <!-- Footer slot -->
        <slot name="footer" />
      </div>
    </DanxPopover>
  </DanxFieldWrapper>
</template>
