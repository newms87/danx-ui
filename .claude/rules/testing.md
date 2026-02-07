# Testing Rules

## 100% Test Coverage Required

All components and composables must have comprehensive tests. No exceptions.

## Test File Organization

```
src/components/{component}/
└── __tests__/
    ├── Component.test.ts      # Component tests
    └── useComponent.test.ts   # Composable tests
```

## Test Commands

```bash
yarn test              # Watch mode
yarn test:run          # Single run
yarn test:coverage     # With coverage report
yarn test:ui           # Visual UI
```

## Coverage Thresholds

The project enforces 100% coverage:

- Lines: 100%
- Functions: 100%
- Branches: 100%
- Statements: 100%

## What to Test

### Components

| Test Type | What to Verify |
|-----------|----------------|
| **Prop rendering** | Component renders correctly with different prop combinations |
| **Event emissions** | Events emit with correct payloads |
| **Slot rendering** | Slots render provided content |
| **State changes** | v-model updates work correctly |
| **Edge cases** | Boundary conditions, empty states |
| **Error handling** | Error states render correctly |

### Composables

| Test Type | What to Verify |
|-----------|----------------|
| **Initial state** | Correct initial values |
| **State mutations** | Methods change state correctly |
| **Computed values** | Computed properties update |
| **Side effects** | DOM manipulation, event listeners |
| **Cleanup** | Resources released on unmount |

## CRITICAL: Always Verify Coverage

**Run `yarn test:coverage` as the final verification step after ANY code change. No exceptions.**

A task is NOT complete if coverage thresholds fail — even if the failure predates your changes. If you inherit failing coverage, flag it immediately and fix it before moving on.

| Step | Command | When |
|------|---------|------|
| Tests pass | `yarn test:run` | After every change |
| Coverage passes | `yarn test:coverage` | Before considering any task complete |

**Never skip this.** Running `yarn test:run` alone is insufficient — it does not check coverage thresholds.

## What NOT to Test

| Skip Testing | Why |
|--------------|-----|
| Vue framework behavior | `v-if` works, props pass through - trust Vue |
| CSS styling | Visual regression is a separate concern |
| Third-party library internals | Trust the library |
| TypeScript types | Compiler handles this |
| Index/barrel files | Just re-exports |

## Test Patterns

### Component Test Structure

```typescript
import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import { Dialog } from "../Dialog.vue";

describe("Dialog", () => {
  it("renders when isOpen is true", () => {
    const wrapper = mount(Dialog, {
      props: { isOpen: true },
    });
    expect(wrapper.find(".dialog").exists()).toBe(true);
  });

  it("emits update:isOpen when close button clicked", async () => {
    const wrapper = mount(Dialog, {
      props: { isOpen: true },
    });
    await wrapper.find(".close-button").trigger("click");
    expect(wrapper.emitted("update:isOpen")).toEqual([[false]]);
  });
});
```

### Composable Test Structure

```typescript
import { describe, it, expect } from "vitest";
import { useDialog } from "../useDialog";

describe("useDialog", () => {
  it("starts with isOpen false", () => {
    const { isOpen } = useDialog();
    expect(isOpen.value).toBe(false);
  });

  it("open() sets isOpen to true", () => {
    const { isOpen, open } = useDialog();
    open();
    expect(isOpen.value).toBe(true);
  });
});
```

## TDD for Bug Fixes

When fixing bugs, always use TDD:

1. **Write failing test** - Create test that fails due to the bug
2. **Run test** - Verify it fails for the right reason
3. **Fix the bug** - Minimal change to make test pass
4. **Verify** - Run test, confirm it passes

## Good vs Bad Tests

### Good Tests

```typescript
// Tests actual behavior
it("closes dialog when Escape key pressed", async () => {
  const wrapper = mount(Dialog, { props: { isOpen: true } });
  await wrapper.trigger("keydown", { key: "Escape" });
  expect(wrapper.emitted("update:isOpen")).toEqual([[false]]);
});

// Tests edge case
it("handles undefined width by using default", () => {
  const wrapper = mount(Dialog, { props: { isOpen: true } });
  expect(wrapper.find(".dialog").attributes("style")).toContain("80vw");
});
```

### Bad Tests

```typescript
// Tests Vue framework, not your code
it("renders with v-if", () => {
  const wrapper = mount(Dialog, { props: { isOpen: false } });
  expect(wrapper.find(".dialog").exists()).toBe(false);
});

// Tests implementation detail
it("uses ref for isOpen state", () => {
  const { isOpen } = useDialog();
  expect(isOpen).toBeInstanceOf(Object); // Who cares?
});

// Tests third-party library
it("mount returns wrapper", () => {
  const wrapper = mount(Dialog);
  expect(wrapper).toBeDefined(); // Tests @vue/test-utils, not your code
});
```
