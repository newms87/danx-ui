import { describe, it, expect, vi, afterEach } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { mount } from "@vue/test-utils";
import { useTokenManager } from "../useTokenManager";
import { TokenRenderer, TokenState } from "../types";

/**
 * Simple test component for token rendering.
 */
const TestTokenComponent = defineComponent({
  props: { value: String },
  template: '<span class="test-token">{{ value }}</span>',
});

/**
 * Create a mock TokenRenderer for testing.
 */
function createMockRenderer(id = "test-renderer"): TokenRenderer {
  return {
    id,
    pattern: /\{\{(\d+)\}\}/g,
    toHtml: (match, groups) =>
      `<span data-token-id="tok-${groups[0]}" data-token-renderer="${id}" data-token-groups='${JSON.stringify(groups)}' contenteditable="false"><span class="token-mount-point"></span></span>`,
    component: TestTokenComponent,
    getProps: (groups) => ({ value: groups[0] }),
    toMarkdown: (el) => `{{${el.getAttribute("data-token-groups")}}}`,
  };
}

/**
 * Create a token wrapper element in the DOM structure expected by the manager.
 */
function createTokenElement(
  id: string,
  rendererId: string,
  groups: string[] = ["123"]
): HTMLElement {
  const wrapper = document.createElement("span");
  wrapper.setAttribute("data-token-id", id);
  wrapper.setAttribute("data-token-renderer", rendererId);
  wrapper.setAttribute("data-token-groups", JSON.stringify(groups));
  wrapper.setAttribute("contenteditable", "false");

  const mountPoint = document.createElement("span");
  mountPoint.className = "token-mount-point";
  wrapper.appendChild(mountPoint);

  return wrapper;
}

/**
 * Create a wrapper component that mounts useTokenManager within Vue lifecycle.
 */
function createTestWrapper(renderers: TokenRenderer[] = [createMockRenderer()]) {
  const contentRef = ref<HTMLElement | null>(null);
  const tokens = new Map<string, TokenState>();

  let manager: ReturnType<typeof useTokenManager>;

  const TestComponent = defineComponent({
    setup() {
      manager = useTokenManager({
        contentRef,
        tokenRenderers: renderers,
        tokens,
      });
      return { contentRef };
    },
    template: '<div ref="contentRef"></div>',
  });

  const wrapper = mount(TestComponent, { attachTo: document.body });

  return {
    wrapper,
    contentRef,
    tokens,
    getManager: () => manager,
  };
}

describe("useTokenManager", () => {
  let testData: ReturnType<typeof createTestWrapper>;

  afterEach(() => {
    if (testData) {
      testData.wrapper.unmount();
    }
  });

  describe("mountAllTokens", () => {
    it("returns 0 mounted count initially", async () => {
      testData = createTestWrapper();
      await nextTick();
      expect(testData.getManager().getMountedCount()).toBe(0);
    });

    it("does nothing when contentRef is null", async () => {
      testData = createTestWrapper();
      testData.contentRef.value = null;
      await nextTick();
      testData.getManager().mountAllTokens();
      expect(testData.getManager().getMountedCount()).toBe(0);
    });

    it("mounts a token component for a token wrapper", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const token = createTokenElement("tok-1", "test-renderer");
      container.appendChild(token);

      testData.getManager().mountAllTokens();
      await nextTick();

      expect(testData.getManager().getMountedCount()).toBe(1);
    });

    it("creates state in tokens map", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const token = createTokenElement("tok-1", "test-renderer", ["456"]);
      container.appendChild(token);

      testData.getManager().mountAllTokens();
      await nextTick();

      expect(testData.tokens.has("tok-1")).toBe(true);
      const state = testData.tokens.get("tok-1")!;
      expect(state.rendererId).toBe("test-renderer");
      expect(state.groups).toEqual(["456"]);
    });

    it("does not mount duplicate instances", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      container.appendChild(createTokenElement("tok-1", "test-renderer"));

      testData.getManager().mountAllTokens();
      testData.getManager().mountAllTokens();
      await nextTick();

      expect(testData.getManager().getMountedCount()).toBe(1);
    });

    it("skips tokens without data-token-id", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const el = document.createElement("span");
      el.setAttribute("data-token-renderer", "test-renderer");
      el.innerHTML = '<span class="token-mount-point"></span>';
      container.appendChild(el);

      testData.getManager().mountAllTokens();
      await nextTick();

      expect(testData.getManager().getMountedCount()).toBe(0);
    });

    it("skips tokens without data-token-renderer attribute (line 72)", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      // Create element with token ID but no renderer attribute
      const el = document.createElement("span");
      el.setAttribute("data-token-id", "tok-no-renderer");
      el.innerHTML = '<span class="token-mount-point"></span>';
      container.appendChild(el);

      testData.getManager().mountAllTokens();
      await nextTick();

      expect(testData.getManager().getMountedCount()).toBe(0);
    });

    it("skips tokens with unknown renderer", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const token = createTokenElement("tok-1", "unknown-renderer");
      container.appendChild(token);

      testData.getManager().mountAllTokens();
      await nextTick();

      expect(testData.getManager().getMountedCount()).toBe(0);
    });

    it("skips tokens without mount point", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const wrapper = document.createElement("span");
      wrapper.setAttribute("data-token-id", "no-mount");
      wrapper.setAttribute("data-token-renderer", "test-renderer");
      container.appendChild(wrapper);

      testData.getManager().mountAllTokens();
      await nextTick();

      expect(testData.getManager().getMountedCount()).toBe(0);
    });

    it("uses existing state from tokens map", async () => {
      testData = createTestWrapper();
      await nextTick();

      testData.tokens.set("tok-1", {
        id: "tok-1",
        rendererId: "test-renderer",
        groups: ["789"],
      });

      const container = testData.contentRef.value!;
      const token = createTokenElement("tok-1", "test-renderer", ["ignored"]);
      container.appendChild(token);

      testData.getManager().mountAllTokens();
      await nextTick();

      expect(testData.getManager().getMountedCount()).toBe(1);
      // State should keep original groups from map
      expect(testData.tokens.get("tok-1")!.groups).toEqual(["789"]);
    });
  });

  describe("unmountToken", () => {
    it("unmounts a specific token", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      container.appendChild(createTokenElement("tok-1", "test-renderer"));
      container.appendChild(createTokenElement("tok-2", "test-renderer"));

      testData.getManager().mountAllTokens();
      await nextTick();
      expect(testData.getManager().getMountedCount()).toBe(2);

      testData.getManager().unmountToken("tok-1");
      expect(testData.getManager().getMountedCount()).toBe(1);
    });

    it("does nothing for non-existent id", async () => {
      testData = createTestWrapper();
      await nextTick();

      testData.getManager().unmountToken("nonexistent");
      expect(testData.getManager().getMountedCount()).toBe(0);
    });
  });

  describe("unmountAllTokens", () => {
    it("unmounts all instances", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      container.appendChild(createTokenElement("tok-1", "test-renderer"));
      container.appendChild(createTokenElement("tok-2", "test-renderer"));

      testData.getManager().mountAllTokens();
      await nextTick();
      expect(testData.getManager().getMountedCount()).toBe(2);

      testData.getManager().unmountAllTokens();
      expect(testData.getManager().getMountedCount()).toBe(0);
    });
  });

  describe("MutationObserver integration", () => {
    it("auto-mounts tokens added to the DOM", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const token = createTokenElement("dynamic-1", "test-renderer");
      container.appendChild(token);

      await nextTick();
      await nextTick();
      await nextTick();

      expect(testData.getManager().getMountedCount()).toBe(1);
    });

    it("auto-unmounts tokens removed from the DOM", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const token = createTokenElement("remove-me", "test-renderer");
      container.appendChild(token);

      testData.getManager().mountAllTokens();
      await nextTick();
      expect(testData.getManager().getMountedCount()).toBe(1);

      container.removeChild(token);
      await nextTick();
      await nextTick();

      expect(testData.getManager().getMountedCount()).toBe(0);
      // Token state should also be removed
      expect(testData.tokens.has("remove-me")).toBe(false);
    });

    it("handles nested token wrappers in added nodes", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const parent = document.createElement("div");
      const token = createTokenElement("nested-1", "test-renderer");
      parent.appendChild(token);
      container.appendChild(parent);

      await nextTick();
      await nextTick();
      await nextTick();

      expect(testData.getManager().getMountedCount()).toBe(1);
    });

    it("onNodeRemoved does not unmount when removed element has no data-token-id", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const token = createTokenElement("tok-keep", "test-renderer");
      container.appendChild(token);
      testData.getManager().mountAllTokens();
      await nextTick();
      expect(testData.getManager().getMountedCount()).toBe(1);

      // Add then remove an element without data-token-id
      const nonToken = document.createElement("span");
      nonToken.setAttribute("data-token-id", "");
      container.appendChild(nonToken);
      await nextTick();
      container.removeChild(nonToken);
      await nextTick();
      await nextTick();

      // The real token should still be mounted
      expect(testData.getManager().getMountedCount()).toBe(1);
    });

    it("handles nested token wrappers in removed nodes", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const parent = document.createElement("div");
      const token = createTokenElement("nested-remove", "test-renderer");
      parent.appendChild(token);
      container.appendChild(parent);

      testData.getManager().mountAllTokens();
      await nextTick();

      container.removeChild(parent);
      await nextTick();
      await nextTick();

      expect(testData.getManager().getMountedCount()).toBe(0);
    });
  });

  describe("contentRef watch", () => {
    it("cleans up when contentRef is set to null", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      container.appendChild(createTokenElement("cleanup-1", "test-renderer"));
      testData.getManager().mountAllTokens();
      await nextTick();
      expect(testData.getManager().getMountedCount()).toBe(1);

      testData.contentRef.value = null;
      await nextTick();

      expect(testData.getManager().getMountedCount()).toBe(0);
    });

    it("auto-mounts existing tokens when contentRef is set", async () => {
      testData = createTestWrapper();
      testData.contentRef.value = null;
      await nextTick();

      const newContainer = document.createElement("div");
      document.body.appendChild(newContainer);
      newContainer.appendChild(createTokenElement("new-1", "test-renderer"));

      testData.contentRef.value = newContainer;
      await nextTick();
      await nextTick();

      expect(testData.getManager().getMountedCount()).toBe(1);

      newContainer.remove();
    });
  });
});
