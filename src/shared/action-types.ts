/**
 * Actions + List Controls — Type Definitions
 *
 * Callback fields use method syntax (`onAction?(...)`) rather than arrow-property
 * syntax so they stay parameter-bivariant: route handlers, optimistic callbacks
 * and consumer overrides all interoperate without strict-function-type friction,
 * matching the dynamically-shaped nature of the action system.
 */

import type { ComputedRef, Ref, ShallowRef, VNode } from "vue";
import type { RequestCallOptions } from "./request-types";
import type { AnyObject, LabelValueItem, TypedObject } from "./store-types";

/** An item an action can target. Stored in the reactive object store. */
export interface ActionTargetItem extends TypedObject {
  /** Reactive per-item saving flag set while an action runs against it. */
  isSaving?: boolean;
  updated_at?: string;
}

/** Target of an action: a single item, an array (batch), or null. */
export type ActionTarget<T extends ActionTargetItem = ActionTargetItem> = T[] | T | null;

/** The pending confirm/cancel UI surface for an action requiring extra input. */
export interface ActiveActionVnode {
  vnode: unknown;
  confirm(input: unknown): Promise<void> | void;
  cancel(value?: unknown): void;
}

/** Declarative definition of an action. */
export interface ActionOptions<T extends ActionTargetItem = ActionTargetItem> {
  name: string;
  alias?: string;
  label?: string;
  icon?: string | object;
  iconClass?: string | object;
  menu?: boolean;
  batch?: boolean;
  category?: string;
  class?: string;
  debounce?: number;
  useInputFromConfirm?: boolean;
  optimistic?: boolean | ((action: ActionOptions<T>, target: T | null, input: unknown) => void);
  optimisticDelete?: boolean;
  /** Optional confirm/input UI rendered before the action runs. */
  vnode?(target: ActionTarget<T>, input: unknown): VNode | unknown;
  enabled?(target: ActionTarget<T>): boolean;
  batchEnabled?(targets: T[]): boolean;
  onAction?(
    action: string | ActionOptions<T>,
    target: T | null,
    input?: unknown
  ): Promise<unknown> | unknown;
  onBatchAction?(
    action: string | ActionOptions<T>,
    targets: T[],
    input: unknown
  ): Promise<unknown> | unknown;
  onStart?(action: ActionOptions<T> | null, target: ActionTarget<T>, input: unknown): boolean;
  onSuccess?(result: unknown, target: ActionTarget<T>, input: unknown): unknown;
  onBatchSuccess?(result: unknown, targets: T[], input: unknown): unknown;
  onError?(result: unknown, target: ActionTarget<T>, input: unknown): unknown;
  onFinish?(result: unknown, target: ActionTarget<T>, input: unknown): unknown;
}

/** Defaults shared by every action created from one `useActions` controller. */
export interface ActionGlobalOptions<T extends ActionTargetItem = ActionTargetItem> extends Partial<
  ActionOptions<T>
> {
  routes?: ListControlsRoutes<T>;
  controls?: ListController<T>;
}

/** A resolved, reactive action with a bound trigger. */
export interface ResourceAction<
  T extends ActionTargetItem = ActionTargetItem,
> extends ActionOptions<T> {
  id?: string | number;
  isApplying: boolean;
  trigger(target?: ActionTarget<T>, input?: unknown): Promise<unknown>;
  __type?: string;
}

/** The surface returned by `useActions`. */
export interface ActionController<T extends ActionTargetItem = ActionTargetItem> {
  getAction(actionName: string, actionOptions?: Partial<ActionOptions<T>>): ResourceAction<T>;
  getActions(names: string[]): ResourceAction<T>[];
  action(
    action: ResourceAction<T> | string,
    target?: ActionTarget<T>,
    input?: unknown
  ): Promise<unknown>;
  modifyAction(actionName: string, actionOptions: Partial<ActionOptions<T>>): ResourceAction<T>;
  extendAction(
    actionName: string,
    extendedId: string | number,
    actionOptions: Partial<ActionOptions<T>>
  ): ResourceAction<T>;
}

/** A lightweight loaded-once list cache. */
export interface ActionStore {
  listItems: ShallowRef<ActionTargetItem[]>;
  isRefreshing: Ref<boolean>;
  hasLoadedItems: Ref<boolean>;
  loadItems(): Promise<void>;
  refreshItems(): Promise<void>;
}

/* ----------------------------- List Controls ----------------------------- */

export interface ListControlsFilter {
  [key: string]: object | object[] | null | undefined | string | number | boolean;
}

export interface FilterableField {
  name: string;
  label: string;
  type: string;
  options?: string[] | number[] | LabelValueItem[];
  inline?: boolean;
}

export interface FilterGroup {
  name?: string;
  flat?: boolean;
  fields: FilterableField[];
}

export interface ListSortItem {
  column: string;
  order?: "asc" | "desc";
}

export interface ControlsFieldsList {
  [key: string]: boolean | ControlsFieldsList;
}

export interface ListControlsPagination {
  __sort?: object[] | null;
  sort?: ListSortItem[] | null;
  sortBy?: string | null;
  descending?: boolean;
  page?: number;
  rowsNumber?: number;
  rowsPerPage?: number;
  perPage?: number;
  filter?: ListControlsFilter;
  fields?: ControlsFieldsList;
}

export interface PagedItems<T extends ActionTargetItem = ActionTargetItem> {
  data: T[] | undefined;
  meta:
    | {
        total: number;
        last_page?: number;
      }
    | undefined;
}

export interface ApplyActionResponse<T extends ActionTargetItem = ActionTargetItem> {
  item?: T;
  result?: T | AnyObject;
  success?: boolean;
  error?: boolean;
  message?: string;
}

/** Server routes a list controller calls. Returned by `useActionRoutes`. */
export interface ListControlsRoutes<T extends ActionTargetItem = ActionTargetItem> {
  list(pager?: ListControlsPagination, options?: RequestCallOptions): Promise<PagedItems<T>>;
  summary?(filter?: ListControlsFilter, options?: RequestCallOptions): Promise<AnyObject>;
  details?(target: T, fields?: ControlsFieldsList, options?: RequestCallOptions): Promise<T>;
  more?(pager: ListControlsPagination, options?: RequestCallOptions): Promise<T[]>;
  fieldOptions?(options?: RequestCallOptions): Promise<AnyObject>;
  applyAction?(
    action: string | ResourceAction<T> | ActionOptions<T>,
    target: T | null,
    data?: object,
    options?: RequestCallOptions
  ): Promise<ApplyActionResponse<T>>;
  batchAction?(
    action: string | ResourceAction<T> | ActionOptions<T>,
    targets: T[],
    data: object,
    options?: RequestCallOptions
  ): Promise<AnyObject>;
  export?(filter?: ListControlsFilter, name?: string): Promise<void>;
}

export interface ListControlsOptions<T extends ActionTargetItem = ActionTargetItem> {
  label?: string;
  routes: ListControlsRoutes<T>;
  urlPattern?: RegExp | null;
  filterDefaults?: Record<string, object>;
  refreshFilters?: boolean;
  isListEnabled?: boolean;
  isSummaryEnabled?: boolean;
  isDetailsEnabled?: boolean;
  isFieldOptionsEnabled?: boolean;
}

/**
 * A controller coordinating a paginated, filterable, action-driven list.
 *
 * This is a CONSUMER-SUPPLIED contract — no `useListControls` implementation
 * ships in this layer. The action layer consumes only `clearSelectedRows`,
 * `activatePanel`, and `loadListAndSummary`; the full surface is declared for
 * consumers that implement their own controller.
 */
export interface ListController<T extends ActionTargetItem = ActionTargetItem> {
  name: string;
  label: string;
  pagedItems: ShallowRef<PagedItems<T> | null>;
  activeFilter: Ref<ListControlsFilter>;
  globalFilter: Ref<ListControlsFilter>;
  filterActiveCount: ComputedRef<number>;
  showFilters: Ref<boolean>;
  summary: Ref<object | null>;
  selectedRows: Ref<T[]>;
  isLoadingList: Ref<boolean>;
  isLoadingFieldOptions: Ref<boolean>;
  hasLoadedFieldOptions: Ref<boolean>;
  isLoadingSummary: Ref<boolean>;
  pager: ComputedRef<{
    perPage: number;
    page: number;
    filter: ListControlsFilter;
    sort: object[] | undefined;
  }>;
  pagination: Ref<ListControlsPagination>;
  activeItem: Ref<T | null>;
  activePanel: Ref<string | null>;

  initialize(updateOptions?: Partial<ListControlsOptions<T>>): void;
  setOptions(updateOptions: Partial<ListControlsOptions<T>>): void;
  resetPaging(): void;
  setPagination(updated: Partial<ListControlsPagination>): void;
  setSelectedRows(selection: T[]): void;
  clearSelectedRows(): void;
  loadList(filter?: ListControlsFilter): Promise<void>;
  loadSummary(filter?: ListControlsFilter): Promise<void>;
  loadListAndSummary(filter?: ListControlsFilter): Promise<void>;
  loadMore(index: number, perPage?: number): Promise<boolean>;
  loadFieldOptions(): Promise<void>;
  getActiveItemDetails(): Promise<void>;
  refreshAll(): Promise<void[]>;
  exportList(filter?: ListControlsFilter): Promise<void>;
  setActiveItem(item: T | null): void;
  getNextItem(offset: number): Promise<void>;
  activatePanel(item: T | null, panel: string): void;
  setActiveFilter(filter?: ListControlsFilter): void;
  applyFilterFromUrl(url: string, filters?: Ref<FilterGroup[]> | null): void;
  getFieldOptions(field: string): unknown[];
}
