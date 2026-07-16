<script setup lang="ts">
/**
 * DanxPagination - Prev/next + numbered page buttons with ellipsis truncation
 *
 * A declarative pagination control that binds a `page` and `perPage` via
 * `defineModel()`, composing directly with a consumer's `ListController`
 * pager (`pager.page` / `pager.perPage` / `pagedItems.meta.total`). Renders
 * prev/next buttons and a numbered page-button window that truncates large
 * page counts with ellipsis markers. An optional per-page selector and
 * go-to-page input can be toggled on via props.
 *
 * DanxPagination never fetches data or mutates a controller itself — it
 * only updates its two models; the consumer reacts to those changes (e.g.
 * calling `controller.setPagination({ page, perPage })`).
 *
 * @props
 *   total: number - Total item count across all pages (required)
 *   perPageOptions?: number[] - Page-size choices for the per-page selector (default [10, 25, 50, 100])
 *   showPerPageSelector?: boolean - Show the per-page selector dropdown (default false)
 *   showGoToPage?: boolean - Show the go-to-page numeric input + jump button (default false)
 *   maxVisiblePages?: number - Sliding window width before ellipsis truncation (default 7)
 *   disabled?: boolean - Disable all interactive controls (default false)
 *
 * @models
 *   page: number - Current 1-based page (v-model:page)
 *   perPage: number - Items per page (v-model:perPage)
 *
 * @slots
 *   (none)
 *
 * @tokens
 *   --dx-pagination-gap, --dx-pagination-button-size, --dx-pagination-text,
 *   --dx-pagination-text-active, --dx-pagination-bg-active, --dx-pagination-border
 *
 * @example
 *   <DanxPagination v-model:page="pager.page" v-model:perPage="pager.perPage" :total="total" />
 */
import { computed, ref, watch } from "vue";
import { DanxIcon } from "../icon";
import { computePageWindow } from "./usePageWindow";
import type { DanxPaginationProps } from "./types";

const props = withDefaults(defineProps<DanxPaginationProps>(), {
  perPageOptions: () => [10, 25, 50, 100],
  showPerPageSelector: false,
  showGoToPage: false,
  maxVisiblePages: 7,
  disabled: false,
});

const page = defineModel<number>("page", { default: 1 });
const perPage = defineModel<number>("perPage", { default: 10 });

/** Total number of pages, `0` when there are no items. */
const totalPages = computed(() => (props.total > 0 ? Math.ceil(props.total / perPage.value) : 0));

/** Current page, clamped to the valid `[1, totalPages]` range for display/navigation. */
const currentPage = computed(() => {
  if (totalPages.value <= 0) return 1;
  return Math.min(Math.max(page.value, 1), totalPages.value);
});

/** The page-button window (numbers + "ellipsis" gap markers). */
const pageWindow = computed(() =>
  computePageWindow(currentPage.value, totalPages.value, props.maxVisiblePages)
);

const isPrevDisabled = computed(() => props.disabled || currentPage.value <= 1);
const isNextDisabled = computed(() => props.disabled || currentPage.value >= totalPages.value);

/**
 * Navigate to a specific page, ignoring no-op requests.
 *
 * Every call site already guarantees `target` is within `[1, totalPages]`:
 * prev/next are gated by the disabled nav buttons, page-button clicks pass a
 * value straight out of `pageWindow`, and the go-to-page input clamps before
 * calling this. The `totalPages <= 0` guard covers the empty-list case where
 * no page is ever valid.
 */
function goToPage(target: number) {
  if (props.disabled) return;
  if (totalPages.value <= 0) return;
  if (target === page.value) return;
  page.value = target;
}

function goPrev() {
  goToPage(currentPage.value - 1);
}

function goNext() {
  goToPage(currentPage.value + 1);
}

function onPerPageChange(event: Event) {
  const value = Number((event.target as HTMLSelectElement).value);
  if (!Number.isFinite(value) || value <= 0 || value === perPage.value) return;
  perPage.value = value;
  page.value = 1;
}

const goToPageInput = ref("");

// Keep the go-to-page input in sync with the current page whenever it
// changes from elsewhere (prev/next, page-button clicks, external v-model).
watch(
  currentPage,
  (value) => {
    goToPageInput.value = String(value);
  },
  { immediate: true }
);

function submitGoToPage() {
  const parsed = Number.parseInt(goToPageInput.value, 10);
  if (Number.isNaN(parsed)) {
    goToPageInput.value = String(currentPage.value);
    return;
  }
  const clamped = Math.min(Math.max(parsed, 1), Math.max(totalPages.value, 1));
  goToPageInput.value = String(clamped);
  goToPage(clamped);
}
</script>

<template>
  <nav class="danx-pagination" aria-label="Pagination" :class="{ 'is-disabled': disabled }">
    <div class="danx-pagination__pages">
      <button
        type="button"
        class="danx-pagination__nav"
        aria-label="Previous page"
        :disabled="isPrevDisabled"
        @click="goPrev"
      >
        <DanxIcon icon="chevron-left" />
      </button>

      <template v-for="(entry, index) in pageWindow" :key="index">
        <span v-if="entry === 'ellipsis'" class="danx-pagination__ellipsis" aria-hidden="true"
          >&hellip;</span
        >
        <button
          v-else
          type="button"
          class="danx-pagination__page"
          :class="{ 'is-active': entry === currentPage }"
          :aria-current="entry === currentPage ? 'page' : undefined"
          :disabled="disabled"
          @click="goToPage(entry)"
        >
          {{ entry }}
        </button>
      </template>

      <button
        type="button"
        class="danx-pagination__nav"
        aria-label="Next page"
        :disabled="isNextDisabled"
        @click="goNext"
      >
        <DanxIcon icon="chevron-right" />
      </button>
    </div>

    <div v-if="showPerPageSelector || showGoToPage" class="danx-pagination__controls">
      <label v-if="showPerPageSelector" class="danx-pagination__per-page">
        <span class="danx-pagination__per-page-label">Per page</span>
        <select
          class="danx-pagination__select"
          :value="perPage"
          :disabled="disabled"
          @change="onPerPageChange"
        >
          <option v-for="option in perPageOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </label>

      <form
        v-if="showGoToPage"
        class="danx-pagination__go-to-page"
        @submit.prevent="submitGoToPage"
      >
        <span class="danx-pagination__go-to-page-label">Go to page</span>
        <input
          v-model="goToPageInput"
          type="number"
          class="danx-pagination__go-to-page-input"
          aria-label="Go to page"
          min="1"
          :max="Math.max(totalPages, 1)"
          :disabled="disabled"
        />
        <button type="submit" class="danx-pagination__go-to-page-submit" :disabled="disabled">
          Go
        </button>
      </form>
    </div>
  </nav>
</template>
