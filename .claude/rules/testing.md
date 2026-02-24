# Testing (Project-Specific)

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

A task is NOT complete until `yarn test:coverage` passes with 0 threshold failures.

### You Own ALL Coverage

You are 100% responsible for all code in this repo. If coverage fails — even in files you didn't touch — you must fix it NOW. Write the missing tests, cover the uncovered branches, whatever it takes.

**The ONLY exception:** Untracked files (not yet committed) that belong to another agent actively working on them. Check `git status` — if the failing file is untracked/unstaged, another agent likely owns it. Leave it alone to avoid conflicts. But if the file is committed, it's your responsibility regardless of who wrote it.

| Step | Command | When |
|------|---------|------|
| Tests pass | `yarn test:run` | After every change |
| Coverage passes | `yarn test:coverage` | Before considering any task complete |

**Never skip this.** Running `yarn test:run` alone is insufficient — it does not check coverage thresholds.

## CRITICAL: Zero Vue Warnings Policy

**This repo enforces ZERO Vue warnings in tests.** Every `[Vue warn]` in stderr is a bug. Check for warnings after writing tests.

### Common Warning Sources and Fixes

| Warning | Cause | Fix |
|---------|-------|-----|
| `onUnmounted is called when there is no active component instance` | Composable with `onUnmounted` called outside component setup | Wrap in `mount(defineComponent({ setup() { result = useComposable(...); return {}; }, template: "<div />" }))` |
| `Component that was made a reactive object` | `defineComponent()` result passed as prop to `mount()` | Wrap with `markRaw()`: `const Comp = markRaw(defineComponent(...))` |
| `Missing required prop` | Mounting component without required props | Always provide all required props, even for default-value tests (pass empty/falsy values) |
| `Component is missing template or render function` | Empty object `{}` used as component stub | Use `defineComponent({ template: "<span />" })` instead |

### Composable Test Pattern (with lifecycle hooks)

When a composable uses `onUnmounted`, `onMounted`, or other lifecycle hooks, you MUST create it inside a mounted component's setup. Use this helper pattern:

```typescript
const mountedWrappers: ReturnType<typeof mount>[] = [];

function createComposable(options = {}) {
  let result!: ReturnType<typeof useMyComposable>;
  const wrapper = mount(
    defineComponent({
      setup() {
        result = useMyComposable(options);
        return {};
      },
      template: "<div />",
    })
  );
  mountedWrappers.push(wrapper);
  return result;
}

afterEach(() => {
  for (const w of mountedWrappers) w.unmount();
  mountedWrappers.length = 0;
});
```

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
