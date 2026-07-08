# danx-ui — Ideator Feature Notes

Living feature knowledge base maintained by the ideator agent. The root `features.md`
is the original v1.0 roadmap/design doc; THIS file tracks current shipped reality,
gaps, ICE-scored desired features, and session state.

danx-ui is a Vue 3 + Tailwind v4 component library (`danx-ui`, v0.8.17). Note: the
"reactive data layer" (object store, actions, request helper, action routes, list
controller) originally planned as a separate `@danx/toolkit` package has instead been
built directly INTO danx-ui under `src/shared/`.

**Peer deps (package.json):** `vue ^3.5`, `@vueuse/core ^14.0` (NEW — not "zero-dependency"
anymore for the two composables that use it), `luxon ^3.0` (optional). vueuse is imported
in only 2 real spots today: `scroll/useScrollInfinite.ts` (useInfiniteScroll) and
`shared/actions.ts` (useDebounceFn). This materially reconsiders three composable cards —
vueuse already ships `useClipboard` (DXUI-12), `onKeyStroke`/`useMagicKeys` (DXUI-8), and
`useSortable`/`useDraggable` (DXUI-24). Prefer wrapping vueuse over hand-rolling for those.

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
| DanxNumberInput | Missing | DXUI-26. DanxInput type=number exposes only native browser spinners; no visible +/- stepper, clamp-on-blur, hold-to-repeat, or decimal-safe stepping. |
| README docs index | Incomplete | DXUI-25. `docs/` has 34 md files; README "Documentation" links only 3. ~30 component docs undiscoverable from the published package. |
| CHANGELOG | Missing | DXUI-27. Published npm lib v0.8.17 with 20 entry points and publish:* scripts, but no CHANGELOG/release notes for consumers. |
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
| Fix README docs index (link all 34 docs) | Carded (Maintenance) | 324 (4×9×9) | DXUI-25. README links 3/34 docs; add grouped alphabetized index + contributing reminder. |
| DanxNumberInput (stepper + clamp) | Carded (Valuable) | 240 (5×8×6) | DXUI-26. +/- steppers, clamp, decimal-safe step, hold-repeat, keyboard; reuses input/field infra. |
| CHANGELOG + release discipline | Carded (Maintenance) | 192 (4×8×6) | DXUI-27. Keep-a-Changelog file, backfill recent versions, wire into publish flow. |
| Reconcile composable roadmap with @vueuse/core | Note (not carded) | — | vueuse is now a peer dep; DXUI-8/12/24 should wrap vueuse (useClipboard/onKeyStroke/useSortable) not hand-roll. Update those cards' approach when built rather than adding a new card. |
| CommandPalette (Ctrl+K) | Dependent | — | Depends on useHotkeys. Card once hotkeys ships. |

---

## Session Log (latest session only — overwrite each run)

**2026-07-08 (session 6)** — Sixth ideator pass on danx-ui (scope: repo).

- Verified reality via dashboard API (`GET /api/issues?board=danx-ui:danx-ui-main`): 21 cards
  DXUI-4..24, ALL still Review, ALL ac 0/N — NONE built. Git log confirms no new component since
  DXUI-3 context-menu; `src/components` dir list is unchanged (31 dirs). Backlog remains fully
  carded down to ICE 144. Saturation persists exactly as session 5 predicted.
- Rather than pad duplicates, mined UNexplored areas and found 3 genuinely new, grounded,
  non-duplicate items and carded them:
  - **DXUI-25** Fix: README docs index links only 3 of 34 docs (Bug, Maintenance) — ICE 324.
  - **DXUI-26** DanxNumberInput stepper+clamp (Feature, Valuable) — ICE 240. Grounded: DanxInput
    type=number exposes only native spinners; no custom stepper anywhere in src.
  - **DXUI-27** CHANGELOG + release discipline (Feature, Maintenance) — ICE 192. No CHANGELOG for a
    published lib at v0.8.17 with 20 entry points.
- **New inventory insight:** `@vueuse/core ^14.0` is now a PEER DEP (lib is no longer literally
  "zero-dependency"). Used in only 2 real spots (useInfiniteScroll, useDebounceFn). This reconsiders
  DXUI-8 (useHotkeys → onKeyStroke/useMagicKeys), DXUI-12 (useClipboard → vueuse useClipboard),
  DXUI-24 (useDragAndDrop → useSortable): wrap vueuse, don't hand-roll. Noted, not carded.
- Clean-code re-scan: still zero TODO/FIXME/HACK in src; no module-scope window/document (SSR-safe
  enough, 2 typeof-window guards present); demo/ has one page per component but is not deployed as a
  docs site (no CI/.github). Coverage gate unchanged.
- **API CHANGE (schema v30):** `POST /api/issues` now REQUIRES `gate_decisions: [{gate, enabled,
  note}]` for the board-optional plan gates (plan-dependency, plan-architecture, plan-tdd); non-empty
  `note` mandatory or 400. Response echoes new id at `issue.issue.id`. Board must be qualified
  `danx-ui:danx-ui-main`. `mcp__danx_dashboard__*` tools STILL absent from toolset — used curl+Bear
  er $DANXBOT_DISPATCH_TOKEN against $DANXBOT_DASHBOARD_URL.

**Next session:** 24 cards at Review (DXUI-4..27), none built — queue still EXHAUSTED of grounded
new ideas at reasonable ICE. Do NOT add cards unless something gets built OR a genuine new defect
surfaces. Best move next time is verification-only: re-scan git log/src for which DXUI-* shipped,
retire/refresh accordingly, and consider revising DXUI-8/12/24 to lean on @vueuse/core. Only
remaining uncarded desired feature: CommandPalette (Dependent — blocked on useHotkeys/DXUI-8).

