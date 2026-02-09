import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { mount, VueWrapper } from "@vue/test-utils";
import { useCodeBlockManager } from "../useCodeBlockManager";
import { CodeBlockState } from "../useCodeBlocks";

/**
 * Create a wrapper component that mounts useCodeBlockManager within Vue lifecycle.
 */
function createTestWrapper(options?: {
  onCodeBlockExit?: (id: string) => void;
  onCodeBlockDelete?: (id: string) => void;
  onCodeBlockMounted?: (id: string, wrapper: HTMLElement) => void;
}) {
  const contentRef = ref<HTMLElement | null>(null);
  const codeBlocks = new Map<string, CodeBlockState>();
  const updateCodeBlockContent = vi.fn();
  const updateCodeBlockLanguage = vi.fn();

  let manager: ReturnType<typeof useCodeBlockManager>;

  const TestComponent = defineComponent({
    setup() {
      manager = useCodeBlockManager({
        contentRef,
        codeBlocks,
        updateCodeBlockContent,
        updateCodeBlockLanguage,
        onCodeBlockExit: options?.onCodeBlockExit,
        onCodeBlockDelete: options?.onCodeBlockDelete,
        onCodeBlockMounted: options?.onCodeBlockMounted,
      });
      return { contentRef };
    },
    template: '<div ref="contentRef"></div>',
  });

  const wrapper = mount(TestComponent, { attachTo: document.body });

  return {
    wrapper,
    contentRef,
    codeBlocks,
    updateCodeBlockContent,
    updateCodeBlockLanguage,
    getManager: () => manager,
  };
}

/**
 * Create a code block wrapper element in the DOM structure expected by the manager.
 */
function createCodeBlockElement(
  id: string,
  content = "console.log('hello')",
  language = "javascript"
): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.setAttribute("data-code-block-id", id);
  wrapper.setAttribute("contenteditable", "false");

  const mountPoint = document.createElement("div");
  mountPoint.className = "code-viewer-mount-point";
  mountPoint.setAttribute("data-content", content);
  mountPoint.setAttribute("data-language", language);
  wrapper.appendChild(mountPoint);

  return wrapper;
}

describe("useCodeBlockManager", () => {
  let testData: ReturnType<typeof createTestWrapper>;

  afterEach(() => {
    if (testData) {
      testData.wrapper.unmount();
    }
  });

  describe("mountCodeViewers", () => {
    it("returns 0 mounted count initially", async () => {
      testData = createTestWrapper();
      await nextTick();
      expect(testData.getManager().getMountedCount()).toBe(0);
    });

    it("does nothing when contentRef is null", async () => {
      testData = createTestWrapper();
      testData.contentRef.value = null;
      await nextTick();
      testData.getManager().mountCodeViewers();
      expect(testData.getManager().getMountedCount()).toBe(0);
    });

    it("mounts CodeViewer for a code block wrapper", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const codeBlock = createCodeBlockElement("test-1");
      container.appendChild(codeBlock);

      testData.getManager().mountCodeViewers();
      await nextTick();

      expect(testData.getManager().getMountedCount()).toBe(1);
    });

    it("creates state in codeBlocks map from data attributes", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const codeBlock = createCodeBlockElement("test-1", "var x = 1", "typescript");
      container.appendChild(codeBlock);

      testData.getManager().mountCodeViewers();
      await nextTick();

      expect(testData.codeBlocks.has("test-1")).toBe(true);
      const state = testData.codeBlocks.get("test-1")!;
      expect(state.content).toBe("var x = 1");
      expect(state.language).toBe("typescript");
    });

    it("does not mount duplicate instances", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const codeBlock = createCodeBlockElement("test-1");
      container.appendChild(codeBlock);

      testData.getManager().mountCodeViewers();
      testData.getManager().mountCodeViewers();
      await nextTick();

      expect(testData.getManager().getMountedCount()).toBe(1);
    });

    it("uses existing state from codeBlocks map", async () => {
      testData = createTestWrapper();
      await nextTick();

      testData.codeBlocks.set("test-1", {
        id: "test-1",
        content: "existing content",
        language: "python",
      });

      const container = testData.contentRef.value!;
      const codeBlock = createCodeBlockElement("test-1", "ignored", "ignored");
      container.appendChild(codeBlock);

      testData.getManager().mountCodeViewers();
      await nextTick();

      expect(testData.getManager().getMountedCount()).toBe(1);
      // State should still be the original from the map
      expect(testData.codeBlocks.get("test-1")!.content).toBe("existing content");
    });

    it("skips wrappers without data-code-block-id", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const el = document.createElement("div");
      el.innerHTML = '<div class="code-viewer-mount-point"></div>';
      container.appendChild(el);

      testData.getManager().mountCodeViewers();
      await nextTick();

      expect(testData.getManager().getMountedCount()).toBe(0);
    });

    it("skips wrappers without mount point", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const wrapper = document.createElement("div");
      wrapper.setAttribute("data-code-block-id", "no-mount");
      container.appendChild(wrapper);

      testData.getManager().mountCodeViewers();
      await nextTick();

      expect(testData.getManager().getMountedCount()).toBe(0);
    });

    it("calls onCodeBlockMounted callback", async () => {
      const onMounted = vi.fn();
      testData = createTestWrapper({ onCodeBlockMounted: onMounted });
      await nextTick();

      const container = testData.contentRef.value!;
      const codeBlock = createCodeBlockElement("test-1");
      container.appendChild(codeBlock);

      testData.getManager().mountCodeViewers();
      await nextTick();
      await nextTick(); // Second tick for the nextTick in onCodeBlockMounted

      expect(onMounted).toHaveBeenCalledWith("test-1", codeBlock);
    });
  });

  describe("unmountCodeViewer", () => {
    it("unmounts a specific code viewer", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      container.appendChild(createCodeBlockElement("test-1"));
      container.appendChild(createCodeBlockElement("test-2"));

      testData.getManager().mountCodeViewers();
      await nextTick();
      expect(testData.getManager().getMountedCount()).toBe(2);

      testData.getManager().unmountCodeViewer("test-1");
      expect(testData.getManager().getMountedCount()).toBe(1);
    });

    it("does nothing for non-existent id", async () => {
      testData = createTestWrapper();
      await nextTick();

      testData.getManager().unmountCodeViewer("nonexistent");
      expect(testData.getManager().getMountedCount()).toBe(0);
    });
  });

  describe("unmountAllCodeViewers", () => {
    it("unmounts all instances", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      container.appendChild(createCodeBlockElement("test-1"));
      container.appendChild(createCodeBlockElement("test-2"));
      container.appendChild(createCodeBlockElement("test-3"));

      testData.getManager().mountCodeViewers();
      await nextTick();
      expect(testData.getManager().getMountedCount()).toBe(3);

      testData.getManager().unmountAllCodeViewers();
      expect(testData.getManager().getMountedCount()).toBe(0);
    });
  });

  describe("MutationObserver integration", () => {
    it("auto-mounts code blocks added to the DOM", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const codeBlock = createCodeBlockElement("dynamic-1");
      container.appendChild(codeBlock);

      // Wait for MutationObserver + nextTick
      await nextTick();
      await nextTick();
      await nextTick();

      expect(testData.getManager().getMountedCount()).toBe(1);
    });

    it("auto-unmounts code blocks removed from the DOM", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const codeBlock = createCodeBlockElement("remove-me");
      container.appendChild(codeBlock);

      testData.getManager().mountCodeViewers();
      await nextTick();
      expect(testData.getManager().getMountedCount()).toBe(1);

      container.removeChild(codeBlock);

      // Wait for MutationObserver
      await nextTick();
      await nextTick();

      expect(testData.getManager().getMountedCount()).toBe(0);
    });

    it("handles nested code block wrappers in added nodes", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const parent = document.createElement("div");
      const codeBlock = createCodeBlockElement("nested-1");
      parent.appendChild(codeBlock);
      container.appendChild(parent);

      await nextTick();
      await nextTick();
      await nextTick();

      expect(testData.getManager().getMountedCount()).toBe(1);
    });

    it("handles nested code block wrappers in removed nodes", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const parent = document.createElement("div");
      const codeBlock = createCodeBlockElement("nested-remove");
      parent.appendChild(codeBlock);
      container.appendChild(parent);

      testData.getManager().mountCodeViewers();
      await nextTick();
      expect(testData.getManager().getMountedCount()).toBe(1);

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
      container.appendChild(createCodeBlockElement("cleanup-1"));
      testData.getManager().mountCodeViewers();
      await nextTick();
      expect(testData.getManager().getMountedCount()).toBe(1);

      testData.contentRef.value = null;
      await nextTick();

      expect(testData.getManager().getMountedCount()).toBe(0);
    });

    it("auto-mounts existing code blocks when contentRef is set", async () => {
      testData = createTestWrapper();
      // Set contentRef to null first
      testData.contentRef.value = null;
      await nextTick();

      // Create a new container with code blocks
      const newContainer = document.createElement("div");
      document.body.appendChild(newContainer);
      const codeBlock = createCodeBlockElement("new-1");
      newContainer.appendChild(codeBlock);

      testData.contentRef.value = newContainer;
      await nextTick();
      await nextTick();

      expect(testData.getManager().getMountedCount()).toBe(1);

      newContainer.remove();
    });
  });

  describe("cleanup on unmount", () => {
    it("unmounts all code viewers when component unmounts", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      container.appendChild(createCodeBlockElement("unmount-1"));
      container.appendChild(createCodeBlockElement("unmount-2"));

      testData.getManager().mountCodeViewers();
      await nextTick();
      expect(testData.getManager().getMountedCount()).toBe(2);

      testData.wrapper.unmount();
      // After unmount, the manager should have cleaned up
      // (We can't check getMountedCount after unmount since the composable is gone)
    });
  });
});
