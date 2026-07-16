# Contributing to danx-ui

Thank you for your interest in contributing to danx-ui!

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/newms87/danx-ui.git
   cd danx-ui
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Start the development server:
   ```bash
   yarn dev
   ```

## Code Style

This project uses ESLint and Prettier for code formatting. Linting runs automatically via Claude Code hooks, but you can also run manually:

```bash
yarn lint      # ESLint with auto-fix
yarn format    # Prettier formatting
```

## Testing

All code changes require tests. Run tests with:

```bash
yarn test           # Watch mode
yarn test:run       # Single run
yarn test:coverage  # Coverage report
```

Coverage thresholds are enforced at 100% for lines, functions, branches, and statements.

### Accessibility assertions

Interactive components (anything a user can focus, open, or trigger — tabs,
buttons, dialogs, selects, popovers, menus, form fields, etc.) must assert
they have no [axe-core](https://github.com/dequelabs/axe-core) violations, so
regressions in roles/labels/contrast fail the suite instead of shipping
silently. Use the shared helper:

```ts
import { expectNoA11yViolations } from "../../../shared/testing/expectNoA11yViolations";

describe("Accessibility", () => {
  it("has no axe violations", async () => {
    const wrapper = mount(MyComponent, {
      props: { label: "Example" },
      attachTo: document.body, // axe requires the mounted element to be in the DOM
    });

    await expectNoA11yViolations(wrapper.element);
    wrapper.unmount();
  });
});
```

Notes:

- `attachTo: document.body` is required — axe-core refuses to scan a detached
  element. For components that teleport (dialogs, popovers, tooltips, toasts,
  context menus), pass `document.body` itself to `expectNoA11yViolations`
  instead of `wrapper.element`.
- If a test uses `vi.useFakeTimers()`, call `vi.useRealTimers()` before
  `expectNoA11yViolations` — axe-core schedules its own internal timers and
  hangs under fake ones.
- `color-contrast` and `region` are disabled in the shared helper: happy-dom
  has no rendering backend for contrast math, and `region` flags any content
  outside a page landmark, which every isolated component mount trips.

## Development Rules

Please read [CLAUDE.md](../CLAUDE.md) for detailed development rules. Key points:

| Rule | Description |
|------|-------------|
| **Composition API only** | Always use `<script setup>`, never Options API |
| **defineModel()** | Use for all v-model bindings |
| **Named exports only** | No default exports |
| **No styling props** | Use CSS tokens for customization |
| **100% test coverage** | All components and composables must be tested |
| **Zero runtime deps** | Vue is the only peer dependency |

## Component Guidelines

### File Organization

Each component gets its own directory:

```
src/components/{name}/
├── ComponentName.vue      # Main component
├── useComponentName.ts    # Composable
├── component-name.css     # Styles
├── types.ts               # TypeScript types
├── index.ts               # Exports
└── __tests__/             # Tests
    ├── ComponentName.test.ts
    └── useComponentName.test.ts
```

### Documentation

Every component file must include a comprehensive comment block covering:
- Purpose and usage
- All props with types and defaults
- All events emitted
- All slots available
- All CSS tokens for styling

### CSS Tokens

Follow the three-tier token system:
1. **Primitives** - Raw values (`--color-slate-700`)
2. **Semantics** - Meaning (`--color-surface`)
3. **Component** - Per-component (`--dx-dialog-bg`)

## Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Ensure all tests pass: `yarn test:run`
5. Ensure linting passes: `yarn lint`
6. Ensure build works: `yarn build`
7. Submit a pull request

## Questions?

Open an issue for questions or discussion.
