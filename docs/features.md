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
| `yaml` hard runtime dependency | Incomplete | DXUI-30 (Bug). `package.json` has `"dependencies": {"yaml":"^2.4.5"}` — a MANDATORY runtime dep shipped to every consumer, contradicting the README "Zero Runtime Dependencies" headline and CLAUDE.md "NEVER add runtime dependencies". Used at runtime in `code-viewer/useCodeFormat.ts` + `shared/dataFormat.ts`. Should be optional peer (like luxon) + graceful degradation. |
| Incomplete `exports` map | Incomplete | DXUI-29. README advertises granular `danx-ui/components/<x>` imports (headline tree-shaking), but `package.json` `exports` defines subpaths for only 8 of 31 components. The other 23 (input, select, chip, tabs, tooltip, popover, toast, alert, file*, etc.) have NO subpath/styles export — those documented imports fail for published consumers. Hand-maintained → drifted. Needs generation + drift check. |
| No CI pipeline | Missing | DXUI-28. No `.github/`, no CI anywhere. Published lib with a 100% coverage gate + lint + typecheck enforced ONLY locally via /flow-verify. Nothing blocks a PR/publish shipping broken tests/types. Complementary to DXUI-27 (CHANGELOG). |
| ARIA on interactive widgets | Incomplete | DXUI-19. DanxTabs (no role=tab/tablist/aria-selected), DanxButtonGroup (no role/aria-pressed), DanxTooltip (no role=tooltip/aria-describedby) lack ARIA. 9 dirs have zero `aria-`; tabs/buttonGroup/tooltip are the interactive ones that matter. Select already models role=listbox — pattern exists, applied inconsistently. |
| Toast live-region (screen-reader announce) | Incomplete | DXUI-34 (Bug). `DanxToastContainer` regions + `DanxToast` items have ZERO `aria-live`/`role=status`/`role=alert`/`aria-atomic` (`grep aria-live src/` = empty). SR users get no announcement when a toast fires. DISTINCT from DXUI-19 (Tabs/ButtonGroup/Tooltip). DanxAlert already has the variant→polite/assertive mapping to copy. Verified clean elsewhere: progress-bar (role=progressbar+valuenow/min/max), range-slider (role=slider per handle + orientation), input/useFormField (aria-invalid/required/describedby fully wired), alert/skeleton/field-wrapper all correct. |
| prefers-reduced-motion support | Incomplete | DXUI-32. ZERO `prefers-reduced-motion` refs in all of src/ while 47 CSS files use transition/animation. 4 components ship infinite-loop animations (skeleton pulse/wave, progress-bar indeterminate, button spinner, editable-div spinner) — the exact vestibular-trigger (WCAG 2.3.3) case. Distinct axis from DXUI-19 (ARIA). README markets accessibility. |
| Configurable locale/currency in formatters | Incomplete | DXUI-31. `numbers.ts` hardcodes `Intl.NumberFormat("en-US")` + `currency:"USD"` in fCurrency/fCurrencyNoCents/fNumber. `options` can't override the locale STRING, so fNumber's "locale-aware" docstring is false. No locale config exists (dates have setServerTimezone precedent). International consumers get wrong output. |
| Hosted demo/playground site | Missing | DXUI-33. `demo/` is a full 33-page Vite SPA (useLivePreview live editing) served on `yarn dev` but NEVER built/deployed — `build` emits lib only, no demo build script, no `.github/`, no README live link. Published npm consumers can't try before install. Distinct from DXUI-25 (md docs) / DXUI-28 (CI gate). |
| RTL / logical CSS properties | Incomplete (Exploratory, uncarded) | 74 physical `left/right/margin-left/...` CSS props vs 1 logical (inline-start/end) across components. Real RTL gap but large cross-cutting Epic (~74 spots) with uncertain demand → Exploratory, low ICE, not carded. Note for future if RTL demand appears. |
| focus-visible consistency | Minor (uncarded) | 12 `:focus-visible` vs 8 plain `:focus` in component CSS — mostly correct, minor inconsistency. Not worth a card. |

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
| CI pipeline (test/lint/typecheck gate) | Carded (Maintenance) | 360 (5×9×8) | DXUI-28. GitHub Actions on PR/push runs yarn lint/typecheck/test:coverage as required checks. Complements DXUI-27. |
| Complete + auto-generate exports map | Carded (Maintenance) | 288 (6×8×6) | DXUI-29. Only 8/31 components have subpath exports; generate from src/components + drift check. Grounded in package.json. |
| Fix yaml hard runtime dependency | Carded (Bug/Maintenance) | 180 (6×6×5) | DXUI-30. Move yaml to optional peer (like luxon) + guard 2 import sites; fixes false "zero-dependency" claim. |
| Configurable locale/currency for number formatters | Carded (Valuable/i18n) | 336 (6×8×7) | DXUI-31. Add setDefaultLocale/Currency (mirror setServerTimezone); fCurrency/fCurrencyNoCents/fNumber read defaults + per-call locale override; fix "$-" placeholder + fNumber docstring. Grounded in numbers.ts. |
| prefers-reduced-motion across animated components | Carded (Valuable/a11y) | 288 (6×8×6) | DXUI-32. Global @media(reduce) rule + overrides for 4 infinite-loop animations. Distinct from DXUI-19 (ARIA). Grounded: 0 refs / 47 animated CSS files. |
| Publish hosted demo/playground site | Carded (Valuable) | 150 (5×6×5) | DXUI-33. Demo SPA (33 pages) never deployed; add demo build mode + Pages workflow + README link. Complements DXUI-25/28, no overlap. |
| Toast aria-live live region | Carded (Bug/a11y) | 432 (6×9×8) | DXUI-34. Persistent live region per toast-region; variant→polite/assertive + aria-atomic + region aria-label. Highest-ICE card on the board. Grounded: 0 aria-live in src/ vs full ARIA elsewhere. |
| Reconcile composable roadmap with @vueuse/core | Note (not carded) | — | vueuse is now a peer dep; DXUI-8/12/24 should wrap vueuse (useClipboard/onKeyStroke/useSortable) not hand-roll. Update those cards' approach when built rather than adding a new card. |
| RTL / logical CSS properties | Exploratory (not carded) | — | 74 physical vs 1 logical CSS prop. Large Epic, uncertain demand. Card only if RTL demand surfaces. |
| CommandPalette (Ctrl+K) | Dependent | — | Depends on useHotkeys. Card once hotkeys ships. |

---

## Session Log (latest session only — overwrite each run)

**2026-07-08 (session 9)** — Ninth ideator pass on danx-ui (scope: repo). Verification-first.

- Verified reality: dashboard API `GET /api/issues?board=danx-ui:danx-ui-main` → 30 cards DXUI-4..33,
  ALL Review, ALL ac 0/N — NONE built. `git log` since session 8 = only 8 ideator note-update commits
  (last feature commit is still DXUI-3). `src/components` unchanged (31 dirs). Backlog stays fully carded.
- Followed session 8's directive (do NOT pad an exhausted queue) but did genuine fresh diligence to
  find any NEW grounded defect. Probed: TODOs/FIXME (0), `any` (2, benign), console (all legit
  warn/error/guarded-debug), module-level window/document (NONE — no SSR import-time crash; only an
  icon alias at module scope), and ARIA completeness across value-bearing/interactive widgets.
- Found exactly ONE genuine, grounded, non-duplicate defect → carded it:
  - **DXUI-34** (Bug) Toast has no aria-live live region. `DanxToastContainer` regions + `DanxToast`
    items carry ZERO `aria-live`/`role=status`/`role=alert`/`aria-atomic` (`grep aria-live src/`=empty),
    so SR users get no announcement. DISTINCT from DXUI-19 (Tabs/ButtonGroup/Tooltip). DanxAlert already
    has the variant→polite/assertive computed to copy. ICE 432 (6×9×8) — highest on the board.
- Verified the REST of the a11y surface is already CORRECT (no cards needed): progress-bar
  (role=progressbar + valuenow/min/max), range-slider (role=slider per handle + orientation + values),
  DanxInput/useFormField (aria-invalid/required/describedby fully + thoughtfully wired), alert/skeleton/
  field-wrapper all set proper roles. Codebase is exceptionally mature/clean.
- **API NOTE:** `mcp__danx_dashboard__*` MCP tools STILL absent from toolset (only Bash/Read/Edit/Write).
  Used python urllib → `POST $DANXBOT_DASHBOARD_URL/api/issues`, board `danx-ui:danx-ui-main`, Bearer
  $DANXBOT_DISPATCH_TOKEN; created id at `issue.issue.id`. IMPORTANT: `type:"Bug"` REQUIRES
  `gate_decisions:[{gate,enabled,note}]` for plan-dependency/plan-architecture/plan-tdd (non-empty note);
  Feature auto-seeds them as optional (no gate_decisions needed). `ac` items are `{title}`.

**Next session:** 31 cards at Review (DXUI-4..34), none built. Queue is exhausted across components,
composables, forms, packaging/release-hygiene, a11y (ARIA DXUI-19 + motion DXUI-32 + toast DXUI-34),
i18n formatters, and demo hosting. Do NOT add cards unless something ships OR a genuine new defect
surfaces — the a11y surface is now fully covered. Best move next time: verification-only; re-scan git
log/src for which DXUI-* shipped and retire/refresh. Only uncarded ideas remain: CommandPalette
(Dependent on useHotkeys/DXUI-8) and RTL (Exploratory — 74 physical vs 1 logical CSS prop, card only
if demand surfaces). When DXUI-8/12/24 are built, lean on @vueuse/core rather than hand-rolling.

