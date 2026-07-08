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
| DanxTable (simple) | Carded (Valuable) | 168 (7×6×4) | DXUI-23. Static styled table w/ column/cell slots; pairs with ListController + DXUI-13 Pagination. |
| DanxDatePicker | Carded (Valuable) | 144 (8×6×3) | DXUI-22. Calendar grid, datetime, range, keyboard. Phased delivery in one Feature. Infra grounded: luxon peer dep + dateTimeParsers.ts. |
| useDragAndDrop reorder + DragHandle | Carded (Valuable) | 144 (6×6×4) | DXUI-24. Reorder array v-model w/ FLIP + keyboard a11y; DanxDragHandle affordance. |
| useClipboard | Carded (Maintenance) | 336 (6×8×7) | DXUI-12. Extract copy logic (code-viewer, editable-div) into shared composable w/ fallback. |
| CommandPalette (Ctrl+K) | Dependent | — | Depends on useHotkeys. Card once hotkeys ships. |

---

## Session Log (latest session only — overwrite each run)

**2026-07-08 (session 5)** — Fifth ideator pass on danx-ui.

- Verified state: board `danx-ui:danx-ui-main` (prefix DXUI) has 18 open issues DXUI-4..21,
  ALL still at Review, NONE built. Git log confirms no new components since DXUI-3 context-menu
  (the ideator sessions only touched docs/features.md). Queue remains heavily saturated.
- Applied last session's plan: carded the top three UNCARDED backlog items (all genuinely new,
  deduped against DXUI-4..21 and against src/ — none exist in code). Chose depth over volume
  (3 cards, not 5) given saturation.
- DatePicker grounding confirmed: luxon is a declared optional peer dep and
  `src/shared/formatters/dateTimeParsers.ts` already exports parseDateTime/parseSqlDateTime/
  parseSlashDate/parseGenericDateTime + datetime.ts/dateTimeTimezone.ts. Framed as a single
  phased Feature (grid → datetime → range → bounds) rather than an Epic, since the HTTP create
  path only makes flat Features and the parent task restricted to Feature|Bug.
- Table grounding: no `<table>`/DataGrid component anywhere in src/components (31 dirs). Pairs
  with existing ListController + proposed DXUI-13 Pagination — completes the list-rendering story.
- Reinforced DXUI-8 (useHotkeys): found ANOTHER duplicated keyboard handler
  `src/components/select/useSelectKeyboard.ts` — the dedup case keeps growing.
- Still clean: no TODO/FIXME/HACK in src; still no CHANGELOG (minor, not carded);
  coverage gate 100% lines/functions/statements, 85% branches (SFC template limitation).
- API UPDATE vs session 4 note: dashboard schema is now v30 and POST /api/issues DOES echo the
  new id in the response body at `issue.issue.id` — no longer need a follow-up GET. Board must be
  the QUALIFIED id `danx-ui:danx-ui-main` (bare slug now rejected as ambiguous, 400). Auth still
  `Authorization: Bearer $DANXBOT_DISPATCH_TOKEN`; create shape `{board,type,title,description,ac:[{title}]}`.
  `mcp__danx_dashboard__*` tools STILL absent from the toolset (Bash/Read/Edit/Write only).

**Cards created this session (Review status):**
1. DXUI-22 `[danx-ui > Forms] Add DanxDatePicker calendar date/datetime/range input` — ICE 144 (Valuable, highest impact uncarded)
2. DXUI-23 `[danx-ui > Data] Add DanxTable declarative column/slot data table` — ICE 168 (Valuable, highest ICE uncarded)
3. DXUI-24 `[danx-ui > Composables] Add useDragAndDrop list-reorder composable + DanxDragHandle` — ICE 144 (Valuable)

**Backlog now fully carded down to ICE 144.** Only remaining uncarded desired feature:
CommandPalette (Dependent — blocked on useHotkeys/DXUI-8 shipping).

**Next session:** 21 cards at Review (DXUI-4..24), none built — the queue is EXHAUSTED of new
grounded ideas at reasonable ICE and fully saturated. Do NOT create more cards unless something
gets picked up/built, OR you find a genuine NEW defect. The right move next time is verification-only:
re-scan git log / src for which DXUI-* got built, retire/refresh cards accordingly, and re-rank.
If truly nothing moved, add zero cards and report the saturation rather than padding.
