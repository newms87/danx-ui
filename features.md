# danx-ui v1.0 Feature Map

A complete feature inventory for the danx-ui component library, organized by priority tier.

danx-ui is split into two packages:

- **danx-ui** — Zero-dependency Vue 3 + Tailwind CSS v4 component library. Pure UI
  primitives with no opinions about data fetching, routing, or state management.
- **@danx/toolkit** — Optional app framework layer. Action system, list controllers,
  object store, HTTP helpers, dynamic form rendering. Depends on danx-ui.

This separation keeps the component library clean and reusable across any Vue app,
while the toolkit provides the opinionated "batteries included" experience for apps
that want it (like gpt-manager).

## Legend

- **DONE** — Already built and tested in danx-ui
- **BUILD** — Needs to be built (new or migrated from quasar-ui-danx)
- **NEW** — Does not exist in quasar-ui-danx, expected in a modern library

---

## Package 1: danx-ui (Component Library)

### Tier 1: MVP

Everything here is required for a v1.0 component library release.

#### 1.1 Foundation (DONE)

These components are built, tested, documented, and shipped.

| Component | Status | Description |
|-----------|--------|-------------|
| DanxButton | DONE | Multi-size, semantic types, icons, loading state |
| DanxActionButton | DONE | Button bound to a resource action with progress |
| DanxIcon | DONE | SVG renderer for named icons, SVG strings, or Components |
| DanxChip | DONE | Pill label with semantic types, auto-color, removable |
| DanxTabs | DONE | Tab bar with sliding animated indicator |
| DanxButtonGroup | DONE | Toggle group, single/multi-select, auto-color |
| DanxTooltip | DONE | Auto-positioning tooltip with hover/click modes |
| DanxPopover | DONE | Auto-positioning panel with click/hover/focus |
| DanxDialog | DONE | Native dialog element with v-model, confirm/cancel, fullscreen, animations |
| DanxContextMenu | DONE | Floating context menu with keyboard navigation |
| DanxBadge | DONE | Count/status overlay on icons, tabs, menu items |
| CodeViewer | DONE | Multi-language syntax highlighting with editor mode |
| MarkdownEditor | DONE | Full markdown editor with hotkeys and table editing |

Shared utilities (DONE): formatters (number, date, string), syntax highlighting,
markdown renderer/parser, array utilities, auto-color, hex color utilities.

#### 1.2 Form Primitives

Modern libraries ship fewer, more composable primitives instead of dozens of
specialized fields. Nine primitives replace the 28 field types in quasar-ui-danx.

| Component | Status | Replaces | Notes |
|-----------|--------|----------|-------|
| DanxFieldWrapper | BUILD | LabeledInput | Label, error, description, required indicator. Wraps ANY input. |
| DanxInput | BUILD | TextField, NumberField, IntegerField | One component with `type` prop (text, number, password, email, search). Min/max/step for numbers. |
| DanxTextarea | BUILD | (none existed) | Multi-line text. Separate because the DOM element is fundamentally different from input. |
| DanxSelect | BUILD | SelectField, SelectWithChildrenField, SelectOrCreateField, Combobox | Searchable, single/multi via props. `allowCustom` prop enables combobox behavior (free-text input). Slots for custom option rendering and footer actions. |
| DanxCheckbox | BUILD | BooleanField (partial) | Standard checkbox with label. |
| DanxSwitch | BUILD | BooleanField (partial) | Toggle switch. Visually distinct from checkbox. |
| DanxRadioGroup | BUILD | (none existed) | Single-select from visible options. |
| DanxSlider | BUILD | SliderNumberField (partial) | Range slider. Consumer pairs with DanxInput if they want both. |
| DanxDatePicker | BUILD | DateField, DateRangeField, DateTimeField | One component. `mode` prop: date, datetime, range. |
| DanxFileUpload | BUILD | SingleFileField, MultiFileField | One component. `multiple` prop. Drag-drop, progress tracking. |

**What gets dropped and why:**

| Old Field | Reason | Replacement |
|-----------|--------|-------------|
| IntegerField | Just NumberField with step=1 | `DanxInput type="number" :step="1"` |
| SliderNumberField | Composite of two primitives | Consumer composes DanxSlider + DanxInput |
| ConfirmPasswordField | App-specific pattern | Two DanxInput fields in app code |
| NewPasswordField | App-specific pattern | DanxInput type="password" in app code |
| EditOnClickTextField | Interaction pattern, not a field | `useInlineEdit` composable + DanxInput |
| EditableDiv | Same — interaction, not a field | `useInlineEdit` composable |
| SelectionMenuField | Select + CRUD actions | DanxSelect with slot footer for create/edit/delete |
| MultiKeywordField | Very specific pattern | TagInput (Tier 2) or app-level composition |
| LabeledInput | Just a wrapper | Replaced by DanxFieldWrapper |
| LabelValueBlock | Display component, not an input | Moved to data display |
| WysiwygField | External dependency (TinyMCE) | Optional plugin, not core library |
| MaxLengthCounter | Micro-feature | Built into DanxInput via `maxlength` prop |

**Composables for complex interaction patterns:**

| Composable | Status | Replaces | Notes |
|------------|--------|----------|-------|
| useInlineEdit | BUILD | EditableDiv, EditOnClickTextField | Click-to-edit behavior on any element. Returns editing state, save/cancel handlers. |

**Relationships:** DanxFieldWrapper is the universal wrapper — every field slots
into it. DanxSelect is the most complex primitive (search, async options, multi-select,
custom rendering). DanxDatePicker is self-contained with no external date library.
DanxFileUpload depends on the FileUpload utility class (Toolkit or standalone).

#### 1.3 Dialogs — DONE

DanxDialog already supports confirm/cancel buttons, custom labels, loading state,
fullscreen mode, persistent mode, and v-model control. No specialized dialog
components needed — consumers compose dialog content directly.

ConfirmDialog, InfoDialog, InputDialog, and FullScreenDialog patterns are all
achievable with DanxDialog props and slots. The Toolkit's action confirmation
flow uses DanxDialog directly.

#### 1.4 Layout Components

| Component | Status | Notes |
|-----------|--------|-------|
| DanxSidebar | BUILD | Collapsible sidebar (inline push, collapses to icon-width or zero) |
| DanxDrawer | BUILD | Slide-out overlay drawer for detail content |

**Relationships:** DanxSidebar is used by DataTableLayout for filter panels.
DanxDrawer is used for item detail views. Apps compose DanxDrawer + DanxTabs
for multi-panel drawers (no separate PanelsDrawer component needed).

#### 1.5 Navigation & Pagination

| Component | Status | Notes |
|-----------|--------|-------|
| DanxPagination | BUILD | Page controls, per-page selector, go-to-page input |
| DanxNavMenu | BUILD | Hierarchical navigation menu for sidebars. Refactor existing demo nav pattern into a standard component. |

**Relationships:** DanxPagination is used by the Toolkit's DataTable. DanxNavMenu
is used in app sidebars and the danx-ui demo app itself.

#### 1.6 Transitions

| Component | Status | Notes |
|-----------|--------|-------|
| ListTransition | BUILD | Animated list item add/remove |
| SlideTransition | BUILD | Slide in/out for drawers, sidebars |
| CollapseTransition | BUILD | Expand/collapse via height animation |

#### 1.7 File Display

File preview and rendering with a backend-agnostic architecture. danx-ui defines
a standard `DanxFile` interface and renders based on that. Apps provide a global
mapping function to convert their backend file objects to `DanxFile`.

| Feature | Status | Notes |
|---------|--------|-------|
| DanxFile interface | BUILD | Standard file object: url, thumbnailUrl, name, mime, size |
| useFileConfig | BUILD | Global config composable. Apps register a `mapFile(backendFile) => DanxFile` function. |
| FilePreview | BUILD | Smart preview for images, video, PDF, text. Renders based on DanxFile. |
| FileRenderer | BUILD | Render file content by MIME type (inline image, video player, PDF embed, text display). |
| File helpers | BUILD | isImage, isVideo, isPdf, getMimeType — operate on DanxFile or raw MIME strings. |

**Design note:** The mapping function approach means danx-ui never knows about
presigned URLs, CDN paths, or backend file schemas. The app registers one function
at startup and all file components just work.

Example:
```
// App startup
useFileConfig({
  mapFile: (backendFile) => ({
    url: backendFile.optimized_url || backendFile.url,
    thumbnailUrl: backendFile.thumb_url,
    name: backendFile.filename,
    mime: backendFile.mime,
    size: backendFile.size
  })
});
```

#### 1.8 Notifications

| Component | Status | Notes |
|-----------|--------|-------|
| DanxToast | BUILD | Toast notification with semantic types, auto-dismiss |
| useToast | BUILD | Composable to queue and display toasts |

**Design note:** The old FlashMessages was a class with global mutable state.
The new approach is a composable that uses Vue's reactivity system natively.

#### 1.9 Drag and Drop

Port from quasar-ui-danx. List reordering with drag handles, drop zone detection,
and animated repositioning.

| Feature | Status | Notes |
|---------|--------|-------|
| useDragAndDrop | BUILD | Composable for drag-drop reordering in lists |
| DanxDragHandle | BUILD | Visual drag handle component (grip icon) |

**Relationships:** Used by the Toolkit's DataTable for row reordering and by
any list that needs manual sorting.

#### 1.10 Standard UI Components

Components that every modern component library ships. These are not quasar-ui-danx
migrations — they are industry-standard primitives that round out the library.

| Component | Status | Notes |
|-----------|--------|-------|
| DanxDropdownMenu | BUILD | Button-triggered dropdown with items, icons, separators, keyboard nav, nested submenus. The most-used UI pattern after buttons. |
| DanxAccordion | BUILD | Collapsible content sections. Single or multi-expand modes. Used for settings, FAQs, grouped forms, filter panels. |
| DanxDivider | BUILD | Horizontal or vertical separator line. Tiny but used constantly. |
| DanxAlert | BUILD | Persistent inline message bar (info, warning, error, success). Dismissable. Used for form validation summaries, permission warnings, status banners. |
| DanxSpinner | BUILD | Standalone loading spinner. Multiple sizes. Used by dialogs, tables, overlays, inline loading states. Currently internal to DanxButton — extract as standalone primitive. |
| useHotkeys | BUILD | General-purpose keyboard shortcut composable. Register/unregister hotkeys, scope management. Port from quasar-ui-danx. Foundation for CommandPalette, DataTable shortcuts, and app-level keybindings. |
| useClipboard | BUILD | Copy-to-clipboard composable. CodeViewer already does this internally — extract as a shared utility. |

**Relationships:** DanxDropdownMenu builds on DanxPopover (DONE) for positioning
and DanxContextMenu patterns for keyboard navigation. DanxAccordion uses
CollapseTransition for animation. DanxAlert uses semantic color types matching
the existing type system (danger, success, warning, info).

#### 1.11 Miscellaneous

| Feature | Status | Notes |
|---------|--------|-------|
| RenderVnode | BUILD | Utility for programmatic VNode rendering |

---

### Tier 2: Standard (Quality Library)

Expected in a modern component library. Not blocking migration but important
for a credible v1.0 public release.

#### 2.1 Extended Form Fields

| Component | Status | Notes |
|-----------|--------|-------|
| DanxTagInput | NEW | Add/remove tags with autocomplete. Uses DanxChip for display. |
| DanxColorPicker | NEW | Color selection with swatch palette and hex input. |

**Design note:** Combobox (select with free-text) is handled by DanxSelect via
an `allowCustom` prop. No separate component needed.

#### 2.2 Data Display

| Component | Status | Notes |
|-----------|--------|-------|
| DanxTable | NEW | Simple styled table for static data. Not DataTable — no sorting/actions, just rows and columns with consistent styling and tokens. |
| DanxCard | NEW | Content container with header, body, footer slots |
| DanxAvatar | NEW | User/entity image with fallback initials |
| DanxProgressBar | NEW | Determinate/indeterminate progress |
| DanxSkeleton | NEW | Loading placeholder matching content shape |
| DanxEmptyState | NEW | Illustrated placeholder for no-data scenarios |
| MarkdownContent | BUILD | Lightweight render-only markdown display. Uses existing shared renderer, no editing UI. Distinct from MarkdownEditor which is a full editor. |

#### 2.3 Feedback

| Component | Status | Notes |
|-----------|--------|-------|
| DanxLoadingOverlay | NEW | Semi-transparent overlay with spinner |
| DanxPopconfirm | NEW | Confirmation popover attached to a trigger. Lightweight alternative to a full confirm dialog for inline destructive actions. |

#### 2.4 Navigation

| Component | Status | Notes |
|-----------|--------|-------|
| DanxBreadcrumbs | NEW | Path-based navigation trail |
| DanxStepper | NEW | Multi-step workflow indicator |

#### 2.5 Form Validation

| Feature | Status | Notes |
|---------|--------|-------|
| useFormValidation | NEW | Declarative validation rules (required, min, max, pattern, custom). Produces error state consumed by DanxFieldWrapper. |

#### 2.6 Accessibility

| Feature | Status | Notes |
|---------|--------|-------|
| Focus trap | NEW | Trap focus inside DanxDialog. Should be a Tier 1 requirement but listed here if not already baked in. |

---

### Tier 3: Nice to Have (Differentiators)

Post-v1.0 enhancements built based on user demand.

#### 3.1 Rich Content

| Feature | Status | Notes |
|---------|--------|-------|
| CodeViewer | DONE | Already shipped |
| MarkdownEditor | DONE | Already shipped |
| ImageCropper | NEW | Crop/resize images before upload |

#### 3.2 Advanced Data

| Feature | Status | Notes |
|---------|--------|-------|
| VirtualScroll | NEW | Efficient rendering for large lists |
| TreeView | NEW | Hierarchical data with expand/collapse |
| DanxCalendar | NEW | Full calendar view (month/week/day grid) |
| DanxTimeline | NEW | Vertical timeline for activity logs, changelogs, event history |

#### 3.3 Advanced Interactions

| Feature | Status | Notes |
|---------|--------|-------|
| ResizablePanels | NEW | Drag to resize adjacent panels |
| CommandPalette | NEW | Keyboard-driven action search (Ctrl+K). Builds on useHotkeys (Tier 1). |
| Sortable animation | NEW | FLIP animations for smooth repositioning after drag-and-drop reorder. Polish on top of Tier 1 DnD. |

#### 3.4 Developer Experience

| Feature | Status | Notes |
|---------|--------|-------|
| Figma tokens | NEW | Export CSS tokens to Figma variables |

#### 3.5 Accessibility (Extended)

| Feature | Status | Notes |
|---------|--------|-------|
| ARIA live regions | NEW | Announce dynamic content to screen readers |

**Design principle — SSR:** All components should avoid direct `window`/`document`
access during setup from day one. This is not a Tier 3 feature to add later — it
is a constraint respected during all development so SSR/Nuxt compatibility comes
for free.

---

## Package 2: @danx/toolkit (App Framework)

Optional package for apps that want the opinionated data management layer.
This is where the "magic" of quasar-ui-danx lives — the parts that aren't
pure UI but are app infrastructure.

### Why a Separate Package

Libraries like Vuetify and PrimeVue do not ship action systems, object stores,
or dynamic form renderers. Those are app-level concerns. Bundling them into
the component library would:

- Force all consumers to accept opinions about data fetching and state management
- Create coupling between UI components and server API patterns
- Bloat the library for apps that only want buttons and form fields

The Toolkit depends on danx-ui for UI components but can be skipped entirely
by apps that just want the component library.

### Toolkit Features

#### T.1 Action System

Declarative CRUD operations with optimistic updates, batch actions, confirmation
dialogs, and loading states.

| Feature | Status | Notes |
|---------|--------|-------|
| useActions | BUILD | Create and manage resource actions |
| Action execution | BUILD | Trigger with target, handle loading/success/error |
| Batch actions | BUILD | Apply action to multiple selected items |
| Optimistic updates | BUILD | Immediate UI update, rollback on failure |
| Optimistic delete | BUILD | Remove from all registered lists immediately |
| Confirmation flow | BUILD | Trigger DanxDialog confirmation before destructive actions |
| Debounced actions | BUILD | Auto-save with debounce for inline editing |
| Action callbacks | BUILD | onStart, onSuccess, onError, onFinish hooks |

#### T.2 List Controller

State management for paginated, filterable, sortable server resource lists.

| Feature | Status | Notes |
|---------|--------|-------|
| useControls | BUILD | Pagination, filter, sort, selection, active item |
| URL state sync | BUILD | Persist page/sort/filter in URL |
| Field options | BUILD | Dynamic dropdown options from current filter |

#### T.3 Object Store

Global reactive cache ensuring single source of truth across views.

| Feature | Status | Notes |
|---------|--------|-------|
| storeObject / storeObjects | BUILD | Cache by type + id, shared reactive instance |
| removeObject | BUILD | Optimistic delete from store |
| registerList / unregisterList | BUILD | Register arrays for automatic cleanup |
| Nested hydration | BUILD | Recursively store child typed objects |

#### T.4 HTTP & Routes

| Feature | Status | Notes |
|---------|--------|-------|
| request helper | BUILD | HTTP with auth headers, error handling |
| useActionRoutes | BUILD | RESTful route builder (list, details, applyAction) |
| FileUpload class | BUILD | Upload with progress, presigned URL support |

#### T.5 Dynamic Forms

| Feature | Status | Notes |
|---------|--------|-------|
| RenderedForm | BUILD | Render form from field definition array |
| ActionForm | BUILD | Bind RenderedForm to a resource action with auto-save |
| SaveStateIndicator | BUILD | Shows saving spinner or last-saved timestamp |

**Design note:** RenderedForm maps field type strings to danx-ui form primitives.
This is the bridge between server-defined field schemas and UI components.

#### T.6 Data Table Integration

| Feature | Status | Notes |
|---------|--------|-------|
| DataTable | BUILD | Table with sorting, pagination, row selection |
| DataTableLayout | BUILD | Table + toolbar + filter sidebar page layout |
| TableColumn | BUILD | Column rendering with type-specific formatters |
| ColumnSettings | BUILD | Show/hide/reorder columns dialog |
| FilterSidebar | BUILD | Collapsible sidebar with filter fields |
| FilterToolbar | BUILD | Active filter count and clear button |
| ActionMenu | BUILD | Dropdown menu for row actions |
| SummaryRow | BUILD | Aggregated counts/totals for selection |
| EmptyState | BUILD | Placeholder when table has no data |

**Design note:** DataTable could live in danx-ui as a pure presentation component
(just renders columns/rows/slots) with the Toolkit providing the controller
integration via DataTableLayout. This is a decision to make during implementation.

#### T.7 Storage & Utilities

| Feature | Status | Notes |
|---------|--------|-------|
| getItem / setItem | BUILD | localStorage with JSON serialization |
| downloadFile | BUILD | Download from URL or HTTP response |
| autoRefreshObject | BUILD | Poll server for object updates |
| AuditHistoryItem | BUILD | Display change log entries |

---

## Component Dependency Map

Build order follows dependencies. Each layer only depends on layers above it.

```
Layer 0: Foundation (DONE)
  DanxIcon, DanxButton, DanxActionButton, DanxChip, DanxBadge
  DanxTabs, DanxButtonGroup
  DanxTooltip, DanxPopover, DanxDialog, DanxContextMenu
  CodeViewer, MarkdownEditor
  Shared utilities

Layer 1: Core Primitives (danx-ui)
  Form: DanxFieldWrapper, DanxInput, DanxTextarea, DanxSelect
        DanxCheckbox, DanxSwitch, DanxRadioGroup, DanxSlider
        DanxDatePicker, DanxFileUpload
  Standard: DanxSpinner, DanxDivider, DanxAlert
  Composables: useInlineEdit, useToast, useFileConfig, useHotkeys, useClipboard

Layer 2: Composite UI (danx-ui)
  Layout: DanxSidebar, DanxDrawer
  Navigation: DanxPagination, DanxNavMenu
  Menus: DanxDropdownMenu
  Sections: DanxAccordion
  Transitions: ListTransition, SlideTransition, CollapseTransition
  Notifications: DanxToast
  File display: FilePreview, FileRenderer
  Drag and drop: useDragAndDrop, DanxDragHandle
  Utility: RenderVnode

Layer 3: Toolkit Infrastructure (@danx/toolkit)
  Object Store
  HTTP / request helper
  Action System (useActions, useActionRoutes)
  List Controller (useControls)
  FileUpload class
  localStorage helpers

Layer 4: Toolkit UI (@danx/toolkit)
  RenderedForm, ActionForm, SaveStateIndicator
  DataTable, DataTableLayout
  FilterSidebar, FilterToolbar
  ColumnSettings, ActionMenu
  AuditHistoryItem

Layer 5: Standard (danx-ui, Tier 2)
  Form: TagInput, ColorPicker, useFormValidation
  Data display: DanxTable, Card, Avatar, ProgressBar, Skeleton, EmptyState
  Content: MarkdownContent
  Feedback: LoadingOverlay, Popconfirm
  Navigation: Breadcrumbs, Stepper
  Accessibility: Focus trap

Layer 6: Nice-to-Have (danx-ui, Tier 3)
  VirtualScroll, TreeView, Calendar, Timeline
  ResizablePanels, CommandPalette, Sortable animation
  ImageCropper
  Figma tokens, ARIA live regions
```

---

## Migration Path for gpt-manager

1. **danx-ui v1.0 ships** with form primitives, layout, navigation, transitions,
   notifications, file display, drag-and-drop, and standard UI components.

2. **@danx/toolkit v1.0 ships** with action system, list controller, object store,
   HTTP helpers, dynamic forms, data table.

3. **gpt-manager migrates** by:
   - Replacing `quasar-ui-danx` imports with `danx-ui` + `@danx/toolkit`
   - Replacing Quasar framework components (QDialog, QTooltip, QSpinner, etc.)
     with danx-ui equivalents
   - Adapting field usage (e.g. `TextField` becomes `DanxInput`,
     `NumberField` becomes `DanxInput type="number"`)
   - Registering a file mapping function via `useFileConfig`
   - Removing the `quasar` and `@quasar/extras` dependencies entirely

4. **Field migration cheat sheet:**

| Old (quasar-ui-danx) | New (danx-ui) |
|-----------------------|---------------|
| `<TextField v-model="x" label="Name" />` | `<DanxFieldWrapper label="Name"><DanxInput v-model="x" /></DanxFieldWrapper>` |
| `<NumberField v-model="x" :min="1" />` | `<DanxInput v-model="x" type="number" :min="1" />` |
| `<BooleanField v-model="x" />` | `<DanxSwitch v-model="x" />` or `<DanxCheckbox v-model="x" />` |
| `<SelectField v-model="x" :options="opts" />` | `<DanxSelect v-model="x" :options="opts" />` |
| `<DateField v-model="x" />` | `<DanxDatePicker v-model="x" />` |
| `<DateRangeField v-model="x" />` | `<DanxDatePicker v-model="x" mode="range" />` |
| `<MultiFileField v-model="x" />` | `<DanxFileUpload v-model="x" multiple />` |
| `<SingleFileField v-model="x" />` | `<DanxFileUpload v-model="x" />` |
| `<EditableDiv v-model="x" />` | `useInlineEdit` composable + DanxInput |
| `<SelectionMenuField v-model="x" />` | `<DanxSelect v-model="x">` with slot footer |
| `<SliderNumberField v-model="x" />` | `<DanxSlider v-model="x" />` + `<DanxInput type="number" />` |
| `<LabeledInput label="X">` | `<DanxFieldWrapper label="X">` |
| `<ConfirmDialog title="Delete?" />` | `<DanxDialog title="Delete?" :showConfirm="true" />` |
| `<InfoDialog title="Details" />` | `<DanxDialog title="Details" />` |
| `<FullScreenDialog />` | `<DanxDialog fullscreen />` |

---

## Recipes

Documented patterns that show how to compose danx-ui primitives into common UI
patterns. These are not components — they are copy-paste examples in the docs
that demonstrate the library is capable of everything users expect. Each recipe
lives in `docs/recipes/` and has a matching demo page.

### Form Patterns

| Recipe | Composes | Description |
|--------|----------|-------------|
| Confirm Password | DanxInput x2, DanxFieldWrapper | Two password fields with match validation |
| Slider + Number | DanxSlider, DanxInput | Slider paired with numeric input, synced via v-model |
| Inline Edit | useInlineEdit, DanxInput | Click text to edit in-place, save on blur or Enter |
| Select with CRUD | DanxSelect, DanxDropdownMenu | Select dropdown with create/edit/delete actions in footer slot |
| Multi-Keyword Input | DanxInput, DanxChip | Type keywords, press Enter to add as chips, click to remove |
| Key-Value Display | Tailwind utilities | Label + value pair using flex layout. CSS-only, no component needed. |
| Show/Hide Toggle | DanxButton, ref | Button that toggles content visibility with icon swap |

### Layout Patterns

| Recipe | Composes | Description |
|--------|----------|-------------|
| Panels Drawer | DanxDrawer, DanxTabs | Tabbed detail drawer for item inspection (replaces PanelsDrawer) |
| Previous/Next Nav | DanxButton x2 | Navigate between items in a list with arrow buttons |
| Sticky Header Table | DanxTable, CSS | Table with sticky header row using position: sticky |
| Split Pane | CSS Grid | Two-panel layout with fixed sidebar and scrollable content |

### Data Patterns

| Recipe | Composes | Description |
|--------|----------|-------------|
| Infinite Scroll | useIntersectionObserver, ref | Sentinel element triggers load-more when scrolled into view |
| Status Dot | Tailwind utilities | Small colored circle indicating state (online, saving, error). CSS-only. |
| Label Pill | DanxChip | Pill-shaped status indicator. Just DanxChip with size="sm" and a semantic type. |
| Stat Card | DanxCard, Tailwind | Card displaying a metric value with label and trend indicator |
| Sortable List | useDragAndDrop, ListTransition | Drag-to-reorder list with animated repositioning |

### Dialog Patterns

| Recipe | Composes | Description |
|--------|----------|-------------|
| Confirm Dialog | DanxDialog | Dialog with confirm/cancel buttons, loading state on confirm |
| Input Dialog | DanxDialog, DanxFieldWrapper, DanxInput | Dialog with single input field and submit |
| Form Dialog | DanxDialog, DanxFieldWrapper, form fields | Multi-field form presented in a modal |
| Fullscreen Dialog | DanxDialog | Dialog with fullscreen prop for immersive content |

### Interaction Patterns

| Recipe | Composes | Description |
|--------|----------|-------------|
| Copy to Clipboard | useClipboard, DanxButton | Button that copies text and shows "Copied!" feedback |
| Keyboard Shortcut | useHotkeys | Register Ctrl+S to save, Escape to close, etc. |
| Loading Button | DanxButton | Button that shows spinner and disables during async operation |
| Debounced Search | DanxInput, watchDebounced | Text input that fires search after user stops typing |
