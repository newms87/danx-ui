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
| ARIA on interactive widgets | Incomplete | DXUI-19. DanxTabs (no role=tab/tablist/aria-selected), DanxButtonGroup (no role/aria-pressed), DanxTooltip (no role=tooltip/aria-describedby) lack ARIA. 9 dirs have zero `aria-`; tabs/buttonGroup/tooltip are the interactive ones that matter. Select already models role=listbox — pattern exists, applied inconsistently. |

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
| DanxStepper | Carded (Valuable) | 240 (5×8×6) | DXUI-20. Step indicator; pairs with multi-step forms. |
| DanxDrawer / DanxSidebar | Carded (Valuable) | 210 (6×7×5) | DXUI-21. Slide-out overlay; extract reusable SlideTransition; reuse dialog focus/scroll-lock. |
| ARIA semantics for Tabs/ButtonGroup/Tooltip | Carded (Valuable) | 336 (7×8×6) | DXUI-19. Interactive widgets missing role/aria-selected/aria-pressed/role=tooltip+aria-describedby. Grounded in code; Select already models role=listbox so pattern exists but is inconsistent. |
| DanxTable (simple) | Valuable | 168 (7×6×4) | Static styled table w/ column slots. |
| DanxDatePicker | Dependent/Valuable | 144 (8×6×3) | Big: calendar grid, range, keyboard, timezones. Highest impact but low ease — split into phased Epic later. |
| useDragAndDrop reorder + DragHandle | Valuable | 144 (6×6×4) | Reorder lists w/ FLIP animation. |
| useClipboard | Carded (Maintenance) | 336 (6×8×7) | DXUI-12. Extract copy logic (code-viewer, editable-div) into shared composable w/ fallback. |
| CommandPalette (Ctrl+K) | Dependent | — | Depends on useHotkeys. Card once hotkeys ships. |

---

## Session Log (latest session only — overwrite each run)

**2026-07-08 (session 4)** — Fourth ideator pass on danx-ui.

- Verified state: DXUI-4..18 (15 cards) ALL still at Review, none built. Re-scanned
  `src/components/` (31 dirs) + `src/shared/`; no prior-carded gap has been implemented.
  Queue is saturated → exercised restraint, created 3 (not 5) cards.
- NEW grounded finding — accessibility gap. Grepped ARIA usage: 9 component dirs have zero
  `aria-` (badge/button/buttonGroup/code-viewer/icon/popover/scroll/tabs/tooltip). Of these,
  the interactive widgets are non-conformant: `DanxTabs` buttons have no role=tab / role=tablist /
  aria-selected; `DanxButtonGroup` toggle has no role/aria-pressed; `DanxTooltip` panel has no
  role=tooltip / aria-describedby trigger linkage. `DanxSelect` DOES model role=listbox +
  aria-multiselectable, so the pattern exists but is applied inconsistently. Higher ICE (336)
  than the remaining component backlog → carded DXUI-19, led the batch with it.
- Also confirmed: no TODO/FIXME/HACK markers anywhere in src (clean); no CHANGELOG despite npm
  publish scripts (minor, not carded); coverage gate 100% lines/functions/statements, 85% branches.
- Dashboard access: `mcp__danx_dashboard__*` tools STILL not in the session toolset
  (only Bash/Read/Edit/Write). Used HTTP API directly. IMPORTANT auth gotcha discovered this
  session: writes (POST /api/issues) go through `requireUser` which accepts
  `Authorization: Bearer $DANXBOT_DISPATCH_TOKEN` — SAME token/band as GET. Earlier 401s were
  a self-inflicted bug (double "Authorization:" prefix in the header VALUE), NOT a real auth wall.
  Correct header value is literally `Bearer <token>`. Create shape `{board,type,title,description,
  ac:[{title}]}`; POST returns 201 but the body does NOT echo the id — re-GET the list to capture ids.
- Deduped against DXUI-4..18 (all Review) before creating.

**Cards created this session (Review status):**
1. DXUI-19 `[danx-ui > Accessibility] Add missing ARIA roles/state to DanxTabs, DanxButtonGroup, DanxTooltip` — ICE 336 (Valuable, NEW finding)
2. DXUI-20 `[danx-ui > Navigation] Add DanxStepper multi-step workflow indicator` — ICE 240 (Valuable)
3. DXUI-21 `[danx-ui > Layout] Add DanxDrawer slide-out overlay panel` — ICE 210 (Valuable)

**Backlog carded through ICE ≥ 210.** Remaining uncarded desired features:
DanxTable simple (168), DanxDatePicker (144, needs phased Epic decomposition),
useDragAndDrop reorder (144), CommandPalette (Dependent on useHotkeys/DXUI-8).

**Next session:** 21 cards now at Review, none built. The queue is heavily saturated — do NOT
add volume unless cards start getting picked up/built. Prefer re-verifying which DXUI-* got built
and refreshing priorities. If still saturated, the highest-value move is decomposing DanxDatePicker
into a phased Epic (highest impact, low ease) rather than carding more thin components. Consider a
follow-on a11y sweep of the remaining zero-aria dirs (dialog focus-trap already handled by native
`<dialog>`; check code-viewer/scroll interactive affordances).
