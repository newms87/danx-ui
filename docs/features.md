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
| Dark mode token system | Complete | Three-tier tokens; `semantic-dark.css` activated by `.dark` on `<html>`/`<body>` (class strategy, intentional — no `prefers-color-scheme` by design). NOTE: tokens exist but NO JS composable to toggle/persist/auto-detect → see DXUI-36. |
| MarkdownContent | Complete | Render-only markdown display (`code-viewer/MarkdownContent.vue`, exported from `src/index.ts`). Previously omitted from this inventory — was already shipped, not a gap. |
| Focus trap (Dialog) | Complete | `DanxDialog` uses native `<dialog>.showModal()` (DanxDialog.vue:204,262), which browsers focus-trap natively. Roadmap Tier 2.6 item already satisfied — not a gap. |

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
| Unguarded localStorage write in useSplitPanel | Incomplete | DXUI-40 (Bug). `useSplitPanel.saveToStorage()` (useSplitPanel.ts:100) calls `localStorage.setItem` with NO try/catch, unlike its own guarded `loadFromStorage()` (66-92) and every sibling persistence composable (useViewerPreferences `safeWrite`, useRecentColors, useFileExplorer:101-104, useStructuredDataPreference:39-41 — all wrap read AND write). Called from togglePanel(146), watch(activePanelIds)(224), resize pointer-up(215) → an uncaught throw (Safari private mode, QuotaExceededError, storage disabled, SSR) breaks the interaction. One-line try/catch fix matching the established safeWrite pattern. Distinct from DXUI-35 (eager vueuse/luxon barrel import). |
| Build ships bundled deps in dist/node_modules | Incomplete | DXUI-39 (Bug). `vite.config` `rollupOptions.external` lists only vue/vue-router/luxon/@vueuse/core; `danx-icon` (`?raw` SVGs in icons.ts/DanxInput/DanxEditableDiv) + `yaml` are NOT external, so `preserveModules:true` emits them as separate modules under `dist/node_modules/` (1.4M, ~250 files) + 912 sourcemaps (dist ~9.7M). `files:["dist"]` publishes it all. `danx-icon` is ALSO a hard runtime `dependencies` entry (package.json:129) — a SECOND zero-dep violation after yaml (`?raw` SVGs should inline → danx-icon = devDep). DISTINCT from DXUI-30 (yaml dependency declaration), DXUI-35 (vueuse/luxon eager import — those ARE external), DXUI-29 (exports map). Fix: externalize/inline + narrow published files + npm pack smoke test. |
| Optional peers eagerly imported by main entry | Incomplete | DXUI-35 (Bug). `@vueuse/core` + `luxon` are marked OPTIONAL peers but are statically re-exported by the main barrel: `index.ts:431 → shared/actions.ts:19` (useDebounceFn from @vueuse/core) and `index.ts:390 → shared → formatters/index.ts:11 → datetime.ts` (imports + re-exports Luxon's `DateTime`). So `import 'danx-ui'` crashes without them in any non-tree-shaking env (dev servers, SSR, Vitest/Jest, Node ESM). "optional" is false for the main entry. DISTINCT from DXUI-30 (yaml in `dependencies`) and DXUI-29 (subpath exports). Fix: keep peer-dependent re-exports out of the eager main barrel (opt-in subpath/lazy) OR promote peers to required; add clean-install smoke test. |
| Incomplete `exports` map | Incomplete | DXUI-29. README advertises granular `danx-ui/components/<x>` imports (headline tree-shaking), but `package.json` `exports` defines subpaths for only 8 of 31 components. The other 23 (input, select, chip, tabs, tooltip, popover, toast, alert, file*, etc.) have NO subpath/styles export — those documented imports fail for published consumers. Hand-maintained → drifted. Needs generation + drift check. |
| useColorScheme (dark-mode toggle) | Missing | DXUI-36. Dark tokens ship (`semantic-dark.css`, `.dark` class) but ZERO JS to activate/persist/auto-detect. Consumers hand-roll `prefers-color-scheme` + localStorage + `.dark` toggle. `@vueuse/core` (peer dep) ships `useDark`/`usePreferredDark` → thin wrapper. Grounded: grep of src/ finds no dark-mode composable. |
| Automated a11y regression testing | Missing | DXUI-37. README markets a11y; 3 point-fix cards (DXUI-19/32/34) but nothing prevents regressions. No `axe-core`/`vitest-axe`/`jest-axe` in devDeps; ~200-file suite has zero a11y assertions. Distinct from DXUI-28 (runs existing tests). |
| Incomplete npm package metadata | Incomplete | DXUI-38. package.json has repository/keywords/description/author/license but MISSING `homepage`, `bugs`, `engines`. Verified. Trivial fix; coordinate `homepage` with DXUI-33, release hygiene with DXUI-27. |
| No CI pipeline | Missing | DXUI-28. No `.github/`, no CI anywhere. Published lib with a 100% coverage gate + lint + typecheck enforced ONLY locally via /flow-verify. Nothing blocks a PR/publish shipping broken tests/types. Complementary to DXUI-27 (CHANGELOG). |
| ARIA on interactive widgets | Incomplete | DXUI-19. DanxTabs (no role=tab/tablist/aria-selected), DanxButtonGroup (no role/aria-pressed), DanxTooltip (no role=tooltip/aria-describedby) lack ARIA. 9 dirs have zero `aria-`; tabs/buttonGroup/tooltip are the interactive ones that matter. Select already models role=listbox — pattern exists, applied inconsistently. |
| Toast live-region (screen-reader announce) | Incomplete | DXUI-34 (Bug). `DanxToastContainer` regions + `DanxToast` items have ZERO `aria-live`/`role=status`/`role=alert`/`aria-atomic` (`grep aria-live src/` = empty). SR users get no announcement when a toast fires. DISTINCT from DXUI-19 (Tabs/ButtonGroup/Tooltip). DanxAlert already has the variant→polite/assertive mapping to copy. Verified clean elsewhere: progress-bar (role=progressbar+valuenow/min/max), range-slider (role=slider per handle + orientation), input/useFormField (aria-invalid/required/describedby fully wired), alert/skeleton/field-wrapper all correct. |
| prefers-reduced-motion support | Incomplete | DXUI-32. ZERO `prefers-reduced-motion` refs in all of src/ while 47 CSS files use transition/animation. 4 components ship infinite-loop animations (skeleton pulse/wave, progress-bar indeterminate, button spinner, editable-div spinner) — the exact vestibular-trigger (WCAG 2.3.3) case. Distinct axis from DXUI-19 (ARIA). README markets accessibility. |
| Configurable locale/currency in formatters | Incomplete | DXUI-31. `numbers.ts` hardcodes `Intl.NumberFormat("en-US")` + `currency:"USD"` in fCurrency/fCurrencyNoCents/fNumber. `options` can't override the locale STRING, so fNumber's "locale-aware" docstring is false. No locale config exists (dates have setServerTimezone precedent). International consumers get wrong output. |
| Hosted demo/playground site | Missing | DXUI-33. `demo/` is a full 33-page Vite SPA (useLivePreview live editing) served on `yarn dev` but NEVER built/deployed — `build` emits lib only, no demo build script, no `.github/`, no README live link. Published npm consumers can't try before install. Distinct from DXUI-25 (md docs) / DXUI-28 (CI gate). |
| RTL / logical CSS properties | Incomplete (Exploratory, uncarded) | 74 physical `left/right/margin-left/...` CSS props vs 1 logical (inline-start/end) across components. Real RTL gap but large cross-cutting Epic (~74 spots) with uncertain demand → Exploratory, low ICE, not carded. Note for future if RTL demand appears. |
| focus-visible consistency | Minor (uncarded) | 12 `:focus-visible` vs 8 plain `:focus` in component CSS — mostly correct, minor inconsistency. Not worth a card. |
| DanxLoadingOverlay | Incomplete | DXUI-41 (session 14, new find). Roadmap Tier 2.3 Feedback item never inventoried/carded. Verified absent via grep. Semi-transparent scrim + spinner over existing content — gap alongside Skeleton/ProgressBar/Spinner trio. |
| DanxTimeline | Incomplete | DXUI-42 (session 14, new find). Roadmap Tier 3.2 Advanced Data item never inventoried/carded. Verified absent via grep. Vertical activity/changelog timeline; also covers unbuilt Toolkit `AuditHistoryItem`. |
| Shared safe localStorage getItem/setItem utility | Incomplete | DXUI-43 (session 14, new find). Roadmap Toolkit T.7 item never built/tracked. 5 composables (useViewerPreferences, useRecentColors, useFileExplorer, useStructuredDataPreference, useSplitPanel) each hand-roll the same guarded read/write pattern — DXUI-40 fixed ONE unguarded instance but didn't extract the shared helper that would prevent repeats. |
| ImageCropper | Missing (Exploratory, uncarded) | Roadmap Tier 3.1. Verified absent. ICE ~100 (5×5×4) — canvas/drag-handle complexity untested in codebase, moderate value. Below current card threshold; note for future. |
| DanxCalendar (full month/week/day grid) | Missing (Exploratory, uncarded) | Roadmap Tier 3.2. Verified absent. ICE ~48 (4×4×3) — primary calendar need already covered by DanxDatePicker (DXUI-22); a full multi-view calendar grid is high effort, low incremental value. Not carded. |
| Figma tokens export | Missing (Exploratory, uncarded) | Roadmap Tier 3.4. Verified absent. ICE ~60 (3×4×5) — dev-tooling for designers only, narrow audience. Not carded. |
| DanxRating | Missing | DXUI-44 (session 16, new find). No star/numeric rating input or display component; verified absent via grep. Review/feedback/quality-score UIs have no primitive to reach for. |
| Circular/radial DanxProgressBar variant | Incomplete | DXUI-45 (session 16, new find). `DanxProgressBar` is linear-only (`types.ts` has no circular/radial shape); verified absent via grep. Distinct from DXUI-6 DanxSpinner (indeterminate, not a determinate-value ring). |
| DanxKbd (keyboard-shortcut display) | Missing | DXUI-46 (session 16, new find). Key-cap styling is hard-coded/duplicated only inside `markdown-editor/HotkeyHelpPopover.vue` + `hotkey-help-popover.css`; no shared, reusable primitive for docs/tooltips/future CommandPalette. Verified via grep — only markdown-editor and zoomable CSS reference "kbd". |
| Generic DanxTreeView (data-driven tree) | Missing | DXUI-47 (session 17, new find). Only `DanxFileExplorer` exists, hardcoded to `FileNode` file/folder semantics. No tree component for arbitrary hierarchical data (org charts, category trees, comment threads, permission trees). Verified via `grep -rli treeview src` = empty. |
| Password strength meter | Missing | DXUI-48 (session 17, new find). `DanxInput` has a show/hide toggle for `type="password"` but zero strength scoring/feedback anywhere in src. Verified via `grep -rli password.*strength src` = empty. |
| useBreakpoints / useMediaQuery composable | Missing | DXUI-49 (session 17, new find). No viewport/media-query reactivity composable exists (`grep -rli usemediaquery\|usebreakpoint\|matchmedia src` = empty) despite `@vueuse/core` (peer dep) shipping `useBreakpoints`/`useMediaQuery` directly — same "wrap vueuse, don't hand-roll" pattern already applied to DXUI-8/12/24. Foundation for responsive behavior in Drawer (DXUI-21)/Tabs/SplitPanel. |
| Duplicated hand-rolled ResizeObserver + missing element-resize repositioning | Incomplete | Session 28, new find. `useSelect.ts` (line ~103) and `useDanxScroll.ts` (line ~199) each independently instantiate + manage a raw `ResizeObserver`. Meanwhile `usePopoverPositioning.ts` only listens to `window` `resize`/`scroll` events (lines 101/109) — it does NOT observe the anchor/panel element itself, so popover/tooltip/context-menu content growing (e.g. async content loading inside a popover) without a window resize leaves the panel mispositioned. `@vueuse/core` (peer dep) ships `useResizeObserver`/`useElementSize` — same "wrap vueuse, don't hand-roll" pattern as DXUI-8/12/24/49. |
| No clipboard-paste-to-upload in DanxFileUpload | Missing | Session 28, new find. `DanxFileUpload.vue`/`useFileUpload.ts`/`useDragDrop.ts` (grep verified) only accept files via drag-drop or the native file input — no `paste` event handler anywhere in `danx-file-upload/`. Users cannot Ctrl+V a copied screenshot/file directly into the drop zone, a common expectation (Slack/GitHub-style paste-to-attach). |
| Hand-rolled setTimeout debounce (code-viewer, markdown-editor) vs vueuse useDebounceFn | Incomplete | Session 28, new find. `code-viewer/codeViewerDebounce.ts` (`debouncedEmit`/`debouncedValidate`/`debouncedHighlight`, 3 manually-tracked `setTimeout`/`clearTimeout` pairs) and `markdown-editor/useMarkdownSync.ts` (`debouncedSyncFromHtml`) hand-roll debounce/timeout bookkeeping, while `shared/actions.ts` already uses vueuse's `useDebounceFn` for the same purpose. Same "wrap vueuse, don't hand-roll" pattern as DXUI-8/12/24/49 — dedupe reduces bug surface (each hand-rolled copy must independently get cancel-on-unmount right). |
| No action button in DanxToast (e.g. "Undo") | Missing | Session 28, new find. `toast/types.ts` `ToastOptions` has `message`/`variant`/`position`/`duration`/`dismissible`/`target`/`targetPlacement` but no `action` field; `DanxToast.vue` renders only a close button (grep confirms no other `<button>`/action slot). Common toast UX pattern (e.g. "File deleted — Undo") is unsupported; consumers can't offer an inline recovery action from a toast today. |
| `request.call` silently discards a consumer-supplied `AbortSignal` | Incomplete (Bug) | Session 29, new find. `RequestCallOptions extends RequestInit` (request-types.ts:22) so the public type advertises `signal` as settable, but `request.ts:70` unconditionally does `options.signal = abortController.signal;` whenever `shouldAbortPrevious` is true (the default, i.e. `waitOnPrevious` not set — the common case). Any `signal` a consumer passed in (e.g. to cancel a request on component unmount, or to compose with their own timeout AbortController) is clobbered with no merge/compose, and no test in `request.test.ts` (320 lines) exercises consumer-supplied `signal` at all. Verified via grep: zero internal call sites currently pass `signal`, so the bug has shipped unnoticed. |
| `request.poll` has no cancellation / max-attempts / max-duration escape hatch | Incomplete | Session 29, new find. `request.ts:183-192`'s `poll()` loops `do { await request.call(...); await sleep(interval) } while (!until(response))` with only the caller-supplied `fnUntil` predicate as an exit condition — no `AbortSignal`, `maxAttempts`, or `maxDuration` option (`request-types.ts:42-47` confirms the signature has none). If a component unmounts or a workflow is cancelled while polling, the only way to stop is a hacky external ref mutated inside `fnUntil` to force it `true`, and a predicate that never resolves loops forever. Grep confirms zero current internal consumers of `poll`, so the gap is currently latent/untested-in-practice public API surface. |
| `objectStore`'s process-global identity `Map` has no eviction/disposal API | Incomplete (Bug) | Session 30, new find. `objectStore.ts`'s module-level `store = new Map<string, TypedObject>()` (line 38) is written to via `storeObject`/`storeObjects` but grep-confirmed (`grep -rn "store.delete\|store.clear" src/`) there is NO code path that ever removes an entry — not even `removeObjectFromLists` (line 314), which only splices the object out of array *properties* and registered list refs, never calls `store.delete(objectKey)`. Every object ever stored (including soft-deleted `__deleted_at` ones) lives in memory for the lifetime of the page. In a long-running SPA session (e.g. a chat app accumulating messages/threads/actions over hours), this is unbounded memory growth with no way for a consumer to opt out. |
| `useActions` permanently leaks a fresh `__Action:<uid>` record into the object store on every controller instantiation | Incomplete (Bug) | Session 30, new find. `actions.ts`'s `useActions()` generates `const namespace = uid()` (line 60) once per call, then every `getAction`/`extendAction`/`modifyAction` persists its action seed into the SAME global `objectStore` map (via `persist()` → `storeObject`) under `__Action:${namespace}` (line 78) — grep-confirmed no `dispose`/`cleanup`/`unmount` reference anywhere in `actions.ts` or `action-types.ts`. Because `namespace` is a fresh `uid()` every call, entries can never even collide/be reused — each mount of any component/composable calling `useActions()` (list controllers, action-bound buttons/tables) permanently grows the store by one more untouchable identity-map entry. Compounds the general `objectStore` leak above with a concrete, everyday trigger. |
| `useActionStore.refreshItems` has no try/catch — a failed request permanently wedges `isRefreshing` | Incomplete (Bug) | Session 30, new find. `actionStore.ts:28-34`'s `refreshItems()` sets `isRefreshing.value = true`, awaits `routes.list(...)` with no try/catch/finally, then sets `isRefreshing.value = false` only on the line after the await. If `routes.list` rejects (network failure, aborted request, server error), `isRefreshing` is stuck `true` forever — the `if (isRefreshing.value) return;` guard at the top of `refreshItems` then silently no-ops on every future call, and `loadItems()`'s `hasLoadedItems` never gets set either, so the load-once cache is permanently and silently broken with no error surfaced to the caller or `FlashMessages`. Trivial, well-isolated fix (wrap in try/finally). |
| `useAutoColor` reads dark-mode via non-reactive `document.documentElement.classList.contains("dark")` inside a Vue `computed` | Minor/Dependent (documented limitation) | Session 30, new find. `autoColor.ts:150-153` docstring already self-documents: "If dark mode is toggled while the component is mounted, the style will only update when `value` changes" — Vue's `computed` doesn't track DOM class mutations, so a Chip/ButtonGroup's auto-color won't refresh when dark mode flips unless its hashed `value` prop also changes. Currently low-severity because there is no runtime dark-mode *toggle* composable yet (`useColorScheme`, DXUI-36, still Missing) — this becomes user-visible the moment DXUI-36 ships a live toggle. Not carded standalone; note to fold into DXUI-36's AC (e.g. have the toggle dispatch a class-change signal `useAutoColor` can watch, or expose a shared reactive `isDark` ref instead of ad-hoc `classList.contains` checks in each composable). |

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
| Fix optional peers eagerly loaded by main entry | Carded (Bug/packaging) | 252 (6×7×6) | DXUI-35. @vueuse/core + luxon marked optional but statically re-exported by main barrel (index.ts:431/390 → shared/actions + shared/formatters/datetime). `import 'danx-ui'` throws without them in dev/SSR/test. Distinct from DXUI-30 (yaml in `dependencies`) & DXUI-29 (subpath exports). |
| useColorScheme dark-mode toggle composable | Carded (Valuable) | 336 (6×8×7) | DXUI-36. Wrap vueuse useDark/usePreferredDark for `.dark` selector; isDark, light/dark/auto mode, toggle(), localStorage persist, SSR guard. Dark tokens exist but no JS to drive them. |
| Automated a11y regression testing (axe-core) | Carded (Maintenance) | 252 (6×7×6) | DXUI-37. Add axe devDep + shared expectNoA11yViolations helper across interactive components; violations fail vitest. Guards DXUI-19/32/34 from regressing. |
| Complete npm package metadata | Carded (Maintenance) | 300 (3×10×10) | DXUI-38. Add homepage/bugs/engines to package.json. Trivial, grounded quick win. |
| Guard localStorage write in useSplitPanel.saveToStorage | Carded (Bug/robustness) | 360 (4×9×10) | DXUI-40. Wrap unguarded `localStorage.setItem` (useSplitPanel.ts:100) in try/catch matching the codebase's own safeWrite pattern (4 sibling composables). Only unguarded persistence write in src/. |
| Fix dist/node_modules bundled-deps publishing | Carded (Bug/packaging) | 175 (5×7×5) | DXUI-39. danx-icon+yaml not externalized → preserveModules dumps them in dist/node_modules (1.4M) + 912 maps, all shipped via files:["dist"]. danx-icon is a 2nd hard runtime dep (should be devDep — `?raw` SVGs inline). Distinct from DXUI-30/35/29. Externalize/inline + trim files + pack smoke test. |
| Visual regression / screenshot testing | Exploratory (not carded) | — | UI lib with 31 visual components has zero screenshot/visual tooling. Genuine but heavier + lower confidence; overlaps demo-site (DXUI-33). Card only if pixel-regressions become a pain. |
| Reconcile composable roadmap with @vueuse/core | Note (not carded) | — | vueuse is now a peer dep; DXUI-8/12/24 should wrap vueuse (useClipboard/onKeyStroke/useSortable) not hand-roll. Update those cards' approach when built rather than adding a new card. |
| RTL / logical CSS properties | Exploratory (not carded) | — | 74 physical vs 1 logical CSS prop. Large Epic, uncertain demand. Card only if RTL demand surfaces. |
| CommandPalette (Ctrl+K) | Dependent | — | Depends on useHotkeys. Card once hotkeys ships. |
| DanxLoadingOverlay | Carded (Valuable) | 384 (6×8×8) | DXUI-41. Scrim + spinner over existing content mid-async-op. New find, session 14 — previously uninventoried roadmap Tier 2.3 gap. |
| DanxTimeline | Carded (Valuable) | 280 (5×8×7) | DXUI-42. Vertical activity/changelog timeline; DanxIcon/Chip/autoColor building blocks already exist. New find, session 14 — previously uninventoried roadmap Tier 3.2 gap. |
| Shared safe localStorage getItem/setItem utility | Carded (Maintenance) | 192 (4×8×6) | DXUI-43. Extract the safeWrite pattern duplicated 5x (incl. the DXUI-40 bug site) into one shared helper. New find, session 14 — previously uninventoried roadmap Toolkit T.7 gap. |
| ImageCropper | Exploratory (not carded) | 100 (5×5×4) | Roadmap Tier 3.1. Real gap, moderate value, untested canvas/crop-handle approach. Below current threshold. |
| DanxCalendar (full grid view) | Exploratory (not carded) | 48 (4×4×3) | Roadmap Tier 3.2. DatePicker (DXUI-22) already covers primary date-picking need; full calendar grid is high effort/low incremental value. |
| Figma tokens export | Exploratory (not carded) | 60 (3×4×5) | Roadmap Tier 3.4. Dev-tooling, narrow (designer-only) audience. |
| DanxRating (star/numeric rating) | Carded (Valuable) | 224 (4×7×8) | DXUI-44. Session 16 fresh find via grep — no rating component existed anywhere. Star/numeric, half-step, hover-preview, arrow-key nav, defineModel. |
| Circular/radial DanxProgressBar variant | Carded (Valuable) | 280 (5×8×7) | DXUI-45. Session 16 fresh find. SVG stroke-dasharray ring reusing existing value/percentage + ARIA wiring; distinct from DXUI-6 spinner (indeterminate). |
| DanxKbd (keyboard-shortcut badge) | Carded (Maintenance) | 252 (4×7×9) | DXUI-46. Session 16 fresh find. Generalizes the key-cap styling currently hard-coded only inside markdown-editor's HotkeyHelpPopover; presentation-only, no dependency on DXUI-8 useHotkeys so it isn't blocked. |
| Generic DanxTreeView (data-driven tree) | Carded (Valuable) | 252 (6×7×6) | DXUI-47. Session 17 fresh find. Generalizes useFileExplorer's proven expand/collapse/keyboard-nav pattern to arbitrary TreeNode<T> data; FileExplorer stays file-specific, optional refactor onto it later out of scope. |
| Password strength meter for DanxInput | Carded (Valuable) | 216 (6×6×6) | DXUI-48. Session 17 fresh find. Opt-in showStrength prop + headless passwordStrength() pure function in src/shared/; rule-based scoring (no zxcvbn dep) to preserve zero-runtime-dependency goal. |
| useBreakpoints/useMediaQuery composable | Carded (Maintenance/Valuable) | 280 (7×8×5) | DXUI-49. Session 17 fresh find. Thin wrapper over @vueuse/core's useBreakpoints/useMediaQuery pre-configured with danx-ui's Tailwind breakpoint tokens; SSR-guarded. Foundation for responsive Drawer/Tabs/SplitPanel behavior. |
| useResizeObserver/useElementSize composable (dedupe + fix popover repositioning) | Drafted this session (Maintenance) | 320 (5×8×8) | Session 28 fresh find, NOT YET CARDED (no MCP tool access this dispatch — handed to orchestrator as draft). Wraps vueuse's useResizeObserver/useElementSize; replaces hand-rolled ResizeObserver in useSelect.ts + useDanxScroll.ts; adds element-resize awareness to usePopoverPositioning.ts (currently window resize/scroll only, misses in-place content growth). I:5 (internal + indirectly fixes a real popover mispositioning edge case) C:8 (proven wrap-vueuse pattern, 4 prior cards) E:8 (thin wrapper, 2-3 files). |
| DanxFileUpload clipboard paste-to-upload | Drafted this session (Valuable) | 252 (7×6×6) | Session 28 fresh find, NOT YET CARDED. Add `paste` event handling to DanxFileUploadDropZone/useFileUpload reusing existing fileValidation.ts pipeline. I:7 (common expected UX, affects all upload consumers) C:6 (standard ClipboardEvent API, some focus/edge-case nuance) E:6 (half-day, 2-3 files + tests). |
| Replace hand-rolled setTimeout debounce with vueuse useDebounceFn (code-viewer, markdown-editor) | Drafted this session (Maintenance) | 192 (4×8×6) | Session 28 fresh find, NOT YET CARDED. Replace codeViewerDebounce.ts's 3 manual timeout pairs + useMarkdownSync.ts's debouncedSyncFromHtml with vueuse's useDebounceFn (already used in shared/actions.ts). I:4 (internal cleanup, no user-visible change) C:8 (proven pattern already in codebase) E:6 (touches 2 files, several call sites, must preserve debounceMs===0 immediate-mode behavior). |
| DanxToast action button (e.g. "Undo") | Drafted this session (Valuable) | 294 (7×7×6) | Session 28 fresh find, NOT YET CARDED. Add optional `action: {label, onClick}` to ToastOptions/ToastEntry; render an inline action button in DanxToast.vue alongside the close button; clicking should not require canceling auto-dismiss (or should, per design decision documented in AC). I:7 (common toast UX pattern, affects any consumer needing inline recovery actions) C:7 (clear approach, composes existing button/toast primitives) E:6 (half-day: types + render + wiring + docs + tests). |
| Fix `request.call` overwriting consumer-supplied `AbortSignal` | Drafted this session (Bug) | 320 (8×8×5) | Session 29 fresh find, NOT YET CARDED. Merge/compose an incoming `options.signal` with the internal abort-previous controller (e.g. via an `AbortSignal.any([...])` polyfill-safe helper, or only install the internal signal when the caller didn't supply one) instead of unconditionally clobbering it at request.ts:70. I:8 (silent data-loss-of-intent bug in a core, widely-used primitive — any consumer relying on the public `signal` option is silently broken) C:8 (root cause fully understood, fix is localized) E:5 (needs care: must preserve existing abort-previous/useMostRecentResponse semantics + add signal-composition tests, touches concurrency-sensitive code). |
| Add cancellation/max-attempts to `request.poll` | Drafted this session (Maintenance) | 210 (6×7×5) | Session 29 fresh find, NOT YET CARDED. Extend poll's signature with an optional `{ signal?, maxAttempts?, maxDuration? }` so callers have a real way to stop polling (component unmount, workflow cancel) beyond mutating state inside `fnUntil`; reject/resolve appropriately on limit reached. I:6 (currently zero internal consumers so blast radius is contained, but it's a public API footgun — infinite-loop risk for any real consumer) C:7 (well-understood polling-cancellation pattern) E:5 (touches request.ts + request-types.ts + new tests, moderate care needed to keep default behavior unchanged). |
| Add `objectStore` eviction/disposal API (`disposeObject`/`clearStore`) | Drafted this session (Bug) | 245 (7×7×5) | Session 30 fresh find, NOT YET CARDED. Export a `disposeObject(type, id)` (removes one identity + purges it from registered lists/array refs) and a `clearStore()` (full reset, e.g. for logout/tenant switch) from `objectStore.ts`. I:7 (unbounded memory growth in any long-running consumer app — a chat app accumulating messages/threads/actions over a session — with zero opt-out today) C:7 (root cause fully understood via grep; must preserve the existing per-field causality model and not break in-flight merges) E:5 (core file, several existing call sites to consider, needs careful tests around the causality invariants). |
| Give `useActions` a disposal path for its per-namespace object-store entries | Drafted this session (Bug) | 252 (6×7×6) | Session 30 fresh find, NOT YET CARDED. Export a `disposeActions(controller)` (or auto-integrate with the `disposeObject`/`clearStore` API above) so a component/composable that calls `useActions()` can clean up its `__Action:<uid>` entries on unmount, instead of growing the global store by one untouchable entry per mount forever. I:6 (every mount of a list controller or action-bound component leaks — concrete, everyday trigger for the general objectStore leak) C:7 (grounded via grep, clear approach: expose the namespace + a cleanup export) E:6 (isolated to actions.ts + action-types.ts, add export + docs + tests, pairs naturally with the objectStore disposal API). |
| Fix `useActionStore.refreshItems` stuck `isRefreshing` on request failure | Drafted this session (Bug) | 486 (6×9×9) | Session 30 fresh find, NOT YET CARDED. Wrap `refreshItems()`'s `routes.list(...)` call in try/catch/finally so `isRefreshing.value = false` always runs (and surface the error, e.g. via `FlashMessages.error` or a returned/thrown error) instead of silently wedging the load-once cache forever on any network failure. I:6 (silently and permanently breaks a commonly-used load-once list cache on any transient network error, no error surfaced) C:9 (trivial, fully understood root cause — missing try/finally) E:9 (single function, ~5 line change, isolated to actionStore.ts). Highest-ICE draft this session — smallest, most certain fix. |
| `useAutoColor` non-reactive dark-mode check (fold into DXUI-36) | Note (not carded standalone) | — | Session 30 fresh find. Docstring-acknowledged limitation in `autoColor.ts` — `computed()` reads `document.documentElement.classList.contains("dark")` which Vue can't track, so auto-colored Chips/ButtonGroups won't refresh on a live dark-mode toggle. Currently low severity (no toggle composable exists yet); becomes visible the moment DXUI-36 (`useColorScheme`) ships. Recommend folding a fix into DXUI-36's AC (shared reactive `isDark` signal) rather than a standalone card. |

---


## Session Log (latest session only — overwrite each run)

**2026-07-11 (session 30, drafts-only dispatch — explicitly told this dispatch has NO
`issue_list`/`issue_create` MCP access; Bash/Read/Edit/Write only)** — Dispatched into the isolated
`danx-ui__danx-ui-main__ideator__ideator__cardless` worktree (no `.git`, no `src/` there; only
`.claude/` config + this file's read-only mirror exist there). Read/wrote the canonical checkout at
`/home/newms/web/danx-ui` instead, per the worktree's own mirror notes.

Re-verified reality (13th+ consecutive confirming session):
- `git log --oneline -3 -- src/ package.json`: still tip `6524fa1` (v0.8.17, 2026-06-25) — no
  `src/` change in 2.5+ weeks. `ls src/components` still 31 dirs, matches Section 1 inventory.
- No dashboard/API access this session either (no MCP tools, no curl target given) — could not
  re-check the 46-card Review-backlog-dispatch status; assume unchanged from session 28's last
  confirmed 46/46 Review, 0% dispatched until re-verified.

**New ground covered this session:** per session 29's own recommendation, scrutinized
`src/shared/objectStore.ts`, `actionStore.ts`, `actions.ts` (`useActions`), `actionRoutes.ts`,
`config.ts`, `nestedJson.ts`, `download.ts`, `autoColor.ts`, and `hexColor.ts` in depth — areas not
previously read this closely across 29 prior sessions. Found 4 new, grounded findings (added to
Section 1 gaps table + Section 2 scratchpad):
1. `objectStore.ts`'s module-level `store` Map (line 38) has NO eviction/disposal path anywhere —
   grep-confirmed zero `store.delete`/`store.clear` in src/; `removeObjectFromLists` only splices
   array *properties*, never removes the identity-map entry itself. Unbounded memory growth for
   any long-running consumer session. ICE 245 (7×7×5), Bug.
2. `useActions()` (actions.ts:60) mints a fresh `uid()` namespace every call and persists every
   action seed into that SAME global objectStore under `__Action:<uid>` with zero
   dispose/cleanup/unmount hook anywhere in actions.ts or action-types.ts (grep-confirmed) — a
   concrete, everyday trigger for finding #1: every mount of a list controller or action-bound
   component leaks one more permanent, never-reusable entry. ICE 252 (6×7×6), Bug.
3. `useActionStore.refreshItems` (actionStore.ts:28-34) has no try/catch/finally around its
   `await routes.list(...)` — any request failure permanently wedges `isRefreshing.value = true`,
   silently and permanently breaking the load-once list cache with no error surfaced anywhere.
   Trivial, isolated, highest-confidence fix. ICE 486 (6×9×9), Bug — highest ICE this session.
4. `useAutoColor` (autoColor.ts:150-181) reads dark-mode via a non-reactive
   `document.documentElement.classList.contains("dark")` inside a Vue `computed` — already
   self-documented as a known limitation in its own docstring. Low severity today (no dark-mode
   toggle composable exists yet, DXUI-36 still Missing) but will surface the moment DXUI-36 ships.
   Recommended as a fold-in to DXUI-36's AC rather than a standalone card — not carded.

Ruled out as non-gaps after inspection: `download.ts` (complete download.js-derived port, browser
fallbacks intact); `hexColor.ts`/`nestedJson.ts` (small, complete, single-purpose utilities);
`config.ts`/`config-types.ts` (complete singleton pattern, matches its own documented "single
source of truth, no second config path" design — a `resetDanxOptions()` would only matter for
test-isolation/SSR edge cases, not worth a card); `actionRoutes.ts` (complete, consistent
store-through-request wiring, no gaps found).

**Drafts handed to orchestrator this session** (cannot call `issue_create` itself): the 3 Bug
items above (objectStore disposal API ICE 245, useActions disposal ICE 252, useActionStore
try/finally ICE 486) plus 1 note-only fold-in (useAutoColor dark-mode staleness, recommend
attaching to DXUI-36 rather than a new card). All 3 primary drafts are genuinely new, well-grounded
in the previously-unscrutinized `shared/` reactive-data-layer files, and distinct from all 6 prior
undispatched drafts (session 28's 4 + session 29's 2 — still not yet cards per this file).

**Primary finding (still holds, now 13th+ consecutive confirmation):** idea supply is not the
bottleneck for the EXISTING 46-card backlog (as of session 28's last confirmed check) — it sat
100% in Review with 0% dispatched for 2.5+ weeks. This session's 3 new drafts are additive
scratchpad material, not a signal to deprioritize the existing backlog. Recommend the human
operator prioritize triaging the existing 46+ cards into ToDo/In Progress, and separately
prioritize the objectStore/useActions memory-leak pair (findings #1/#2) given they compound (every
consumer app running danx-ui accrues this growth from day one, worsening the longer a session runs).

**Next session:** (1) Check `mcp__danx_dashboard__*` tool availability first; if present, run
`issue_list({status_derived:'Review'|'ToDo'|'In Progress'})` to dedup, then create the 9 outstanding
drafts as real cards (session 28's 4 + session 29's 2 + this session's 3 — none are cards yet, only
proposals in this log). (2) Re-verify the 46-card backlog dispatch status via the dashboard API if
reachable. (3) If `src/` is still unchanged, remaining unaudited-in-depth `shared/` surface is now
small (config-types.ts, action-types.ts, form-types.ts, request-types.ts, store-types.ts, types.ts —
mostly type-only files); consider next revisiting `components/` directories with the LOWEST prior
scrutiny (check which dirs haven't had a dedicated deep-dive session vs. ones repeatedly grepped)
rather than re-treading `shared/`, which is now close to exhausted.
