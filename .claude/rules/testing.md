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

A task is NOT complete if YOUR code has failing coverage.

### Pre-existing Coverage Failures

| Situation | Action |
|-----------|--------|
| **Uncommitted/WIP code** failing coverage | **Flag it** to the user, then **ignore it**. Another agent likely owns it. NEVER modify vitest config, thresholds, or exclusions to work around it. |
| **Committed code** failing coverage | **Flag it** and ask the user. Only address if the user confirms AND you believe your changes could not have caused it. |

**NEVER "fix" someone else's coverage failures.** Do not touch `vitest.config.ts` exclusions, do not write tests for unrelated modules, do not adjust thresholds. Flag and move on.

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
