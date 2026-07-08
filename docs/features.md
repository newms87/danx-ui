# danx-ui — Ideator Feature Notes

Living feature knowledge base maintained by the ideator agent. The root `features.md`
is the original v1.0 roadmap/design doc; THIS file tracks current shipped reality,
gaps, ICE-scored desired features, and session state.

danx-ui is a zero-dependency Vue 3 + Tailwind v4 component library (`@thehammer/danx-ui`,
v0.8.17). Note: the "reactive data layer" (object store, actions, request helper,
action routes, list controller) originally planned as a separate `@danx/toolkit`
package has instead been built directly INTO danx-ui under `src/shared/`.

---

## Section 1: Feature Inventory

### Components (shipped — Complete unless noted)

| Component | Status | Notes |
|-----------|--------|-------|
| DanxButton / DanxActionButton | Complete | Sizes, variants, icons, loading spinner (CSS span). ActionButton binds a resource action. |
| DanxIcon | Complete | SVG renderer for named icons / SVG strings / components. |
| DanxChip | Complete | Pill label, semantic types, auto-color, removable. |
| DanxBadge | Complete | Count/status overlay. |
| DanxTabs | Complete | Sliding animated indicator. |
| DanxButtonGroup | Complete | Single/multi toggle group, auto-color. |
| DanxTooltip | Complete | Auto-positioning, hover/click. |
| DanxPopover | Complete | Auto-positioning panel, click/hover/focus. |
| DanxDialog + DialogBreadcrumbs | Complete | Native `<dialog>`, confirm/cancel, fullscreen, stack (useDialogStack). |
| DanxContextMenu | Complete | Floating menu, keyboard nav, button-anchored mode + active-item indicator (DXUI-3). |
| DanxToast + Container | Complete | Semantic types, auto-dismiss, useToast/useToastTimer. |
| CodeViewer | Complete | Multi-language syntax highlight + editor mode, collapse. |
| MarkdownEditor | Complete | Full editor, hotkeys, table editing, useMarkdownEditor. |
| DanxSplitPanel + Handle | Complete | Resizable panels (covers roadmap "ResizablePanels"), persisted state. |
| DanxProgressBar | Complete | Determinate/indeterminate, size/text options. |
| DanxSkeleton | Complete | Loading placeholder, shapes + animation. |
| DanxScroll / DanxVirtualScroll | Complete | Custom scrollbars, infinite scroll, virtualization, window helpers. |
| DanxFieldWrapper | Complete | Label/error/description/required wrapper. Consumes error state (display only). |
| DanxInput | Complete | type text/number/password/email/search, useFormField infra. |
| DanxTextarea | Complete | Multi-line, resize modes. |
| DanxSelect | Complete | Searchable, single/multi, custom option rendering, useSelect. |
| DanxColorPicker | Complete | Swatches, hex/rgb/hsl/hsv, recent colors. |
| DanxToggle | Complete | Switch only (NOT checkbox/radio). Sizes, variants. |
| DanxRangeSlider | Complete | Single/dual handle, useRangeSlider. |
| DanxEditableDiv | Complete | Click-to-edit inline (covers roadmap useInlineEdit + EditableDiv). |
| DanxZoomable + Controls | Complete | Pan/zoom, useZoomable. |
| DanxFile / DanxFileViewer | Complete | File preview by MIME, virtual carousel, download helpers, resolveFileUrl config. |
| DanxFileUpload | Complete | Drag-drop, progress, presigned URL, pluggable upload handler. |
| DanxFileExplorer | Complete | Tree file browser (covers roadmap TreeView for file trees). |

### Shared / Data Layer (shipped — Complete)

Formatters (number/date/string/duration), syntax highlighting, markdown render+parse,
array utils, autoColor, hexColor, escapeHtml, uid, sleep, download, structured-data
preference. Reactive layer: config singleton (setDanxOptions), request helper,
FlashMessages, objectStore (storeObject(s), registerList, autoRefreshObject),
actions (useActions/useActionStore/useActionRoutes + ListController), useFormField,
useFieldInteraction, useVariant, useTouchSwipe. Test suite: ~200 test files, 100%
coverage gate enforced via /flow-verify.

### Gaps — Missing / Incomplete features (not built)

| Feature | Status | Why it matters / what's missing |
|---------|--------|--------------------------------|
| DanxCheckbox / DanxRadioGroup | Incomplete | Toggle is switch-only. No native checkbox or single-select radio group — a core form-primitive gap. |
| DanxDropdownMenu | Missing | Button-triggered action menu (items/icons/separators/submenus). Popover + context-menu exist as building blocks but no packaged dropdown. |
| useFormValidation | Incomplete | FieldWrapper/useFormField DISPLAY error state but there is no rules engine (required/min/max/pattern/custom, async) to PRODUCE it. Apps roll their own. |
| useHotkeys (general) | Incomplete | Keyboard handling duplicated across ~10 spots (markdown-editor, select, dialog, context-menu). No reusable scoped-hotkey composable. |
| DanxSpinner (standalone) | Incomplete | Spinner exists only as a CSS span inside DanxButton. No extractable primitive for overlays/tables/inline loading. |
| DanxDivider | Missing | Trivial horizontal/vertical separator. Used constantly. |
| DanxAccordion / CollapseTransition | Missing | Collapsible sections + height-animation transition. |
| DanxPagination | Missing | Page controls / per-page / go-to-page. ListController exists but no UI. |
| DanxTable (simple) | Missing | Styled static data table (rows/columns/slots), not a full DataTable. |
| DanxAvatar | Missing | Image w/ fallback initials; autoColor already available for backgrounds. |
| DanxCard | Missing | header/body/footer container. |
| DanxEmptyState | Missing | Illustrated no-data placeholder. |
| DanxTagInput | Missing | Type keywords → chips. Chip + Input already exist. |
| DanxDrawer / DanxSidebar | Missing | Slide-out overlay / collapsible sidebar layout. |
| DanxBreadcrumbs (general) | Missing | Only DialogBreadcrumbs exists; no general path trail. |
| DanxStepper | Missing | Multi-step workflow indicator. |
| DanxPopconfirm | Missing | Inline confirm popover for destructive actions. |
| DanxDatePicker | Missing | date/datetime/range. Large gap; luxon already a peer dep. |
| useDragAndDrop (reorder) | Missing | List reordering composable + drag handle. |
| useClipboard | Missing | Copy-to-clipboard composable; copy logic lives ad-hoc in editable-div/code-viewer. |

---

## Section 2: Desired Features (ICE scratchpad)

ICE = Impact × Confidence × Ease. Type drives whether to card; ICE drives order.

| Feature | Type | ICE (I×C×E) | Notes |
|---------|------|-------------|-------|
| DanxCheckbox + DanxRadioGroup | Carded (Valuable) | 336 (7×8×6) | Native inputs, reuse useFormField/useVariant/FieldWrapper. Fills core form gap. |
| DanxDropdownMenu | Carded (Valuable) | 336 (7×8×6) | Compose DanxPopover + context-menu keyboard nav + item model. |
| Extract standalone DanxSpinner + add DanxDivider | Carded (Maintenance) | 360 (5×9×8) | Pull spinner out of button.css into a primitive; add trivial divider. |
| useFormValidation | Carded (Valuable) | 210 (7×6×5) | Rules composable feeding FieldWrapper error state; async support. |
| useHotkeys (general scoped composable) | Carded (Maintenance) | 336 (6×8×7) | De-dupe ~10 keydown handlers; foundation for CommandPalette. |
| DanxAvatar | Valuable | 360 (5×9×8) | Image + initials fallback, autoColor background. Easy. |
| DanxCard | Valuable | 360 (5×9×8) | header/body/footer slots + tokens. Easy. |
| DanxEmptyState | Valuable | 360 (5×9×8) | Icon/illustration + message + action slot. Easy. |
| DanxAccordion + CollapseTransition | Valuable | 288 (6×8×6) | Single/multi expand; transition reusable for drawers. |
| DanxTagInput | Valuable | 288 (6×8×6) | Input + Chip composition, autocomplete. |
| DanxPagination | Valuable | 288 (6×8×6) | Pairs with ListController; page/per-page/goto. |
| DanxPopconfirm | Valuable | 288 (6×8×6) | Popover + confirm buttons for inline destructive actions. |
| DanxBreadcrumbs (general) | Valuable | 280 (5×8×7) | Generalize DialogBreadcrumbs to routes. |
| DanxStepper | Valuable | 240 (5×8×6) | Step indicator; pairs with multi-step forms. |
| DanxDrawer / DanxSidebar | Valuable | 210 (6×7×5) | Slide-out + collapsible layout; SlideTransition. |
| DanxTable (simple) | Valuable | 168 (7×6×4) | Static styled table w/ column slots. |
| DanxDatePicker | Dependent/Valuable | 144 (8×6×3) | Big: calendar grid, range, keyboard, timezones. Highest impact but low ease — split into phased Epic later. |
| useDragAndDrop reorder + DragHandle | Valuable | 144 (6×6×4) | Reorder lists w/ FLIP animation. |
| useClipboard | Maintenance | 336 (6×8×7) | Extract copy logic into shared composable. Fold into useHotkeys card scope or standalone. |
| CommandPalette (Ctrl+K) | Dependent | — | Depends on useHotkeys. Card once hotkeys ships. |

---

## Session Log (latest session only — overwrite each run)

**2026-07-08** — First ideator pass on danx-ui.

- Reconciled roadmap (root `features.md`) against actual `src/`. Library is far more
  complete than the roadmap implies: 31 components shipped, reactive data layer built
  into danx-ui (not a separate toolkit), ~200 test files, 33 doc pages, per-component demos.
- Roadmap items now DONE that were "BUILD": Input, Textarea, Select, ColorPicker,
  Toggle(switch), FileUpload, RangeSlider, EditableDiv(inline edit), FileExplorer(tree),
  SplitPanel(resizable panels), VirtualScroll, Toast, object store / actions / request.
- Confirmed genuine gaps: checkbox/radio (toggle is switch-only), dropdown menu,
  form-validation rules engine, standalone spinner, divider, accordion, pagination,
  date picker, avatar/card/empty-state, tag-input, drawer/sidebar, general breadcrumbs,
  stepper, popconfirm, drag-and-drop reorder, useHotkeys/useClipboard extraction.
- Dashboard board `danx-ui:danx-ui-main` had ZERO existing issues — no dedup conflicts.
- Created 5 Feature cards at Review (see below).

**Cards created this session (Review status):**
1. DXUI-4 `[danx-ui > Forms] Add DanxCheckbox and DanxRadioGroup form primitives` — ICE 336
2. DXUI-5 `[danx-ui > Menus] Add DanxDropdownMenu button-triggered action menu` — ICE 336
3. DXUI-6 `[danx-ui > Primitives] Extract standalone DanxSpinner and add DanxDivider` — ICE 360
4. DXUI-7 `[danx-ui > Forms] Add useFormValidation rules composable` — ICE 210
5. DXUI-8 `[danx-ui > Composables] Extract general-purpose useHotkeys composable` — ICE 336

**Next session:** promote easy Valuable primitives (Avatar/Card/EmptyState, ICE 360)
and Accordion/TagInput/Pagination. Consider a phased DanxDatePicker Epic (highest
impact, needs decomposition). Re-check whether any cards were picked up.
