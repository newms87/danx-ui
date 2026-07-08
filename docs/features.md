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
| DanxAlert | Complete | Inline semantic alert banner (types, dismissible). Was omitted from prior inventory. |
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
| DanxAvatar | Carded (Valuable) | 360 (5×9×8) | DXUI-9. Image + initials fallback, autoColor background. Easy. |
| DanxCard | Carded (Valuable) | 360 (5×9×8) | DXUI-10. header/body/footer slots + tokens. Easy. |
| DanxEmptyState | Carded (Valuable) | 360 (5×9×8) | DXUI-11. Icon/illustration + message + action slot. Easy. |
| DanxAccordion + CollapseTransition | Carded (Valuable) | 288 (6×8×6) | DXUI-14. Single/multi expand; CollapseTransition reusable for drawers. |
| DanxTagInput | Carded (Valuable) | 288 (6×8×6) | DXUI-15. Input + Chip composition, duplicate/validate hook. |
| DanxPagination | Carded (Valuable) | 288 (6×8×6) | DXUI-13. Pairs with ListController; page/per-page/goto. |
| DanxPopconfirm | Carded (Valuable) | 288 (6×8×6) | DXUI-16. Popover + confirm buttons for inline destructive actions; async confirm. |
| DanxBreadcrumbs (general) | Carded (Valuable) | 280 (5×8×7) | DXUI-18. Generalize DialogBreadcrumbs; items/separator slot/overflow. |
| Promote shared floating primitives to src/shared | Carded (Maintenance) | 280 (5×8×7) | DXUI-17. usePopoverPositioning/useClickOutside/placement types live in components/popover but imported cross-component by tooltip/toast/context-menu/color-picker — layering/coupling smell. |
| DanxStepper | Valuable | 240 (5×8×6) | Step indicator; pairs with multi-step forms. |
| DanxDrawer / DanxSidebar | Valuable | 210 (6×7×5) | Slide-out + collapsible layout; SlideTransition. |
| DanxTable (simple) | Valuable | 168 (7×6×4) | Static styled table w/ column slots. |
| DanxDatePicker | Dependent/Valuable | 144 (8×6×3) | Big: calendar grid, range, keyboard, timezones. Highest impact but low ease — split into phased Epic later. |
| useDragAndDrop reorder + DragHandle | Valuable | 144 (6×6×4) | Reorder lists w/ FLIP animation. |
| useClipboard | Carded (Maintenance) | 336 (6×8×7) | DXUI-12. Extract copy logic (code-viewer, editable-div) into shared composable w/ fallback. |
| CommandPalette (Ctrl+K) | Dependent | — | Depends on useHotkeys. Card once hotkeys ships. |

---

## Session Log (latest session only — overwrite each run)

**2026-07-08 (session 3)** — Third ideator pass on danx-ui.

- Re-verified `src/components/` (32 dirs), `src/shared/` and `src/shared/composables/`
  against inventory: still matches. None of DXUI-4..13's gaps have been built
  (no checkbox/radio, dropdown, spinner/divider, validation, hotkeys, avatar, card,
  empty-state, clipboard, pagination in `src/`). All 13 prior cards remain at Review.
- New finding grounded in code: `usePopoverPositioning`, `useClickOutside`, and
  `PopoverPlacement`/`PopoverPosition` types live under `src/components/popover/` but are
  imported cross-component via `../popover/...` by tooltip, toast, context-menu, and
  color-picker. Real layering/coupling smell for a tree-shakeable lib → carded as DXUI-17.
  (Positioning is otherwise already DRY — tooltip/toast reuse popover's composable rather
  than duplicating, so no separate consolidation needed beyond the relocation.)
- Dashboard access: `mcp__danx_dashboard__*` tools STILL not wired into the session's
  toolset (only Bash/Read/Edit/Write). Used the HTTP API directly, same as session 2:
  `POST/GET {DANXBOT_DASHBOARD_URL}/api/issues`, `Authorization: Bearer $DANXBOT_DISPATCH_TOKEN`,
  board `danx-ui:danx-ui-main`. Create shape `{board,type,title,description,ac:[{title}]}`
  (ac items use `title`). GET list at `?board=danx-ui:danx-ui-main`. Confirmed working.
- Deduped against all live issues (DXUI-4..13, all Review). Created 5 new cards from the
  highest-ICE uncarded features — Valuable + one Maintenance.

**Cards created this session (Review status):**
1. DXUI-14 `[danx-ui > Layout] Add DanxAccordion with reusable CollapseTransition` — ICE 288 (Valuable)
2. DXUI-15 `[danx-ui > Forms] Add DanxTagInput chip-entry field` — ICE 288 (Valuable)
3. DXUI-16 `[danx-ui > Overlays] Add DanxPopconfirm inline confirmation popover` — ICE 288 (Valuable)
4. DXUI-17 `[danx-ui > Architecture] Promote shared floating primitives out of components/popover into src/shared` — ICE 280 (Maintenance)
5. DXUI-18 `[danx-ui > Navigation] Add general DanxBreadcrumbs path trail` — ICE 280 (Valuable)

**Backlog now fully carded through ICE ≥ 280.** Remaining uncarded desired features:
DanxStepper (240), DanxDrawer/Sidebar (210 — will reuse DXUI-14's CollapseTransition),
DanxTable simple (168), DanxDatePicker (144, needs phased Epic decomposition),
useDragAndDrop reorder (144), CommandPalette (Dependent on useHotkeys/DXUI-8).

**Next session:** 18 cards now sit at Review, none built. Before carding more, check whether
any DXUI-4..18 got picked up/built. If the Review queue is still saturated, prefer refreshing
priorities over adding volume. Next-highest uncarded: DanxStepper (240), then DanxDrawer/Sidebar
(210). Consider decomposing DanxDatePicker into a phased Epic when a builder is available.
