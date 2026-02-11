import { describe, it, expect, vi, afterEach } from "vitest";
import { defineComponent, nextTick, reactive, ref } from "vue";
import { mount } from "@vue/test-utils";
import { useCodeBlockManager } from "../useCodeBlockManager";
import { CodeBlockState } from "../useCodeBlocks";

/**
 * Create a wrapper component that mounts useCodeBlockManager within Vue lifecycle.
 */
function createTestWrapper(options?: {
  onCodeBlockExit?: (id: string) => void;
  onCodeBlockDelete?: (id: string) => void;
  onCodeBlockMounted?: (id: string, wrapper: HTMLElement) => void;
  readonly?: boolean;
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
        readonly: options?.readonly,
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

/**
 * Get the props passed to the CodeViewer component mounted inside a code block.
 * Accesses Vue internals to retrieve the VNode props from the mounted app.
 */
function getCodeViewerProps(container: HTMLElement, id: string): Record<string, unknown> | null {
  const wrapper = container.querySelector(`[data-code-block-id="${id}"]`);
  if (!wrapper) return null;

  const mountPoint = wrapper.querySelector(".code-viewer-mount-point") as HTMLElement | null;
  if (!mountPoint) return null;

  // Access the Vue app instance mounted on the element
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const app = (mountPoint as any).__vue_app__;
  if (!app) return null;

  // The root instance's subTree is the VNode rendered by setup's return function
  const vnode = app._instance?.subTree;
  if (!vnode?.props) return null;

  return vnode.props as Record<string, unknown>;
}

/**
 * Create a wrapper component with a reactive codeBlocks map for testing watchers.
 * The reactive map enables Vue's watch() to track changes to map entries.
 */
function createReactiveTestWrapper(options?: {
  onCodeBlockExit?: (id: string) => void;
  onCodeBlockDelete?: (id: string) => void;
  onCodeBlockMounted?: (id: string, wrapper: HTMLElement) => void;
}) {
  const contentRef = ref<HTMLElement | null>(null);
  const codeBlocks = reactive(new Map<string, CodeBlockState>());
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

  describe("mountCodeViewer edge cases", () => {
    it("falls back to empty string when mount point has no data attributes and no state", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      // Create wrapper with mount point that has no data-content or data-language
      const wrapper = document.createElement("div");
      wrapper.setAttribute("data-code-block-id", "cb-no-attrs");
      wrapper.setAttribute("contenteditable", "false");
      const mountPoint = document.createElement("div");
      mountPoint.className = "code-viewer-mount-point";
      // Intentionally NOT setting data-content or data-language
      wrapper.appendChild(mountPoint);
      container.appendChild(wrapper);

      testData.getManager().mountCodeViewers();
      await nextTick();

      // Should still mount successfully with empty defaults
      expect(testData.getManager().getMountedCount()).toBe(1);
      const state = testData.codeBlocks.get("cb-no-attrs");
      expect(state).toBeDefined();
      expect(state!.content).toBe("");
      expect(state!.language).toBe("");
    });
  });

  describe("onNodeRemoved with no id attribute", () => {
    it("does not unmount when removed element has no data-code-block-id", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      // Add a code block and mount it
      const codeBlock = createCodeBlockElement("test-stay");
      container.appendChild(codeBlock);
      testData.getManager().mountCodeViewers();
      await nextTick();
      expect(testData.getManager().getMountedCount()).toBe(1);

      // Add then remove a non-code-block element - should not affect count
      const nonCodeBlock = document.createElement("div");
      nonCodeBlock.setAttribute("data-code-block-id", "");
      container.appendChild(nonCodeBlock);
      await nextTick();
      container.removeChild(nonCodeBlock);
      await nextTick();
      await nextTick();

      // The real code block should still be mounted
      expect(testData.getManager().getMountedCount()).toBe(1);
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

  describe("CodeViewer event callbacks", () => {
    it("onUpdateModelValue calls updateCodeBlockContent with string value", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const codeBlock = createCodeBlockElement("cb-str", "initial", "javascript");
      container.appendChild(codeBlock);

      testData.getManager().mountCodeViewers();
      await nextTick();

      const props = getCodeViewerProps(container, "cb-str");
      expect(props).not.toBeNull();

      // Invoke the onUpdate:modelValue handler with a string
      const handler = props!["onUpdate:modelValue"] as (value: object | string | null) => void;
      handler("updated content");

      expect(testData.updateCodeBlockContent).toHaveBeenCalledWith("cb-str", "updated content");
    });

    it("onUpdateModelValue JSON-stringifies object values", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const codeBlock = createCodeBlockElement("cb-obj", "{}", "json");
      container.appendChild(codeBlock);

      testData.getManager().mountCodeViewers();
      await nextTick();

      const props = getCodeViewerProps(container, "cb-obj");
      expect(props).not.toBeNull();

      const handler = props!["onUpdate:modelValue"] as (value: object | string | null) => void;
      const objValue = { key: "value", nested: { a: 1 } };
      handler(objValue);

      expect(testData.updateCodeBlockContent).toHaveBeenCalledWith(
        "cb-obj",
        JSON.stringify(objValue)
      );
    });

    it("onUpdateModelValue handles null by JSON-stringifying", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const codeBlock = createCodeBlockElement("cb-null", "code", "json");
      container.appendChild(codeBlock);

      testData.getManager().mountCodeViewers();
      await nextTick();

      const props = getCodeViewerProps(container, "cb-null");
      expect(props).not.toBeNull();

      const handler = props!["onUpdate:modelValue"] as (value: object | string | null) => void;
      handler(null);

      // null is not a string, so it goes through JSON.stringify
      expect(testData.updateCodeBlockContent).toHaveBeenCalledWith("cb-null", "null");
    });

    it("onUpdateFormat calls updateCodeBlockLanguage", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const codeBlock = createCodeBlockElement("cb-fmt", "code", "javascript");
      container.appendChild(codeBlock);

      testData.getManager().mountCodeViewers();
      await nextTick();

      const props = getCodeViewerProps(container, "cb-fmt");
      expect(props).not.toBeNull();

      const handler = props!["onUpdate:format"] as (format: string) => void;
      handler("typescript");

      expect(testData.updateCodeBlockLanguage).toHaveBeenCalledWith("cb-fmt", "typescript");
    });

    it("onExit calls onCodeBlockExit when provided", async () => {
      const onExit = vi.fn();
      testData = createTestWrapper({ onCodeBlockExit: onExit });
      await nextTick();

      const container = testData.contentRef.value!;
      const codeBlock = createCodeBlockElement("cb-exit", "code", "javascript");
      container.appendChild(codeBlock);

      testData.getManager().mountCodeViewers();
      await nextTick();

      const props = getCodeViewerProps(container, "cb-exit");
      expect(props).not.toBeNull();

      const handler = props!.onExit as () => void;
      handler();

      expect(onExit).toHaveBeenCalledWith("cb-exit");
    });

    it("onExit does nothing when onCodeBlockExit is not provided", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const codeBlock = createCodeBlockElement("cb-exit-none", "code", "javascript");
      container.appendChild(codeBlock);

      testData.getManager().mountCodeViewers();
      await nextTick();

      const props = getCodeViewerProps(container, "cb-exit-none");
      expect(props).not.toBeNull();

      // Should not throw when onCodeBlockExit is undefined
      const handler = props!.onExit as () => void;
      expect(() => handler()).not.toThrow();
    });

    it("onDelete calls onCodeBlockDelete when provided", async () => {
      const onDelete = vi.fn();
      testData = createTestWrapper({ onCodeBlockDelete: onDelete });
      await nextTick();

      const container = testData.contentRef.value!;
      const codeBlock = createCodeBlockElement("cb-del", "code", "javascript");
      container.appendChild(codeBlock);

      testData.getManager().mountCodeViewers();
      await nextTick();

      const props = getCodeViewerProps(container, "cb-del");
      expect(props).not.toBeNull();

      const handler = props!.onDelete as () => void;
      handler();

      expect(onDelete).toHaveBeenCalledWith("cb-del");
    });

    it("onDelete does nothing when onCodeBlockDelete is not provided", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const codeBlock = createCodeBlockElement("cb-del-none", "code", "javascript");
      container.appendChild(codeBlock);

      testData.getManager().mountCodeViewers();
      await nextTick();

      const props = getCodeViewerProps(container, "cb-del-none");
      expect(props).not.toBeNull();

      // Should not throw when onCodeBlockDelete is undefined
      const handler = props!.onDelete as () => void;
      expect(() => handler()).not.toThrow();
    });
  });

  describe("mapLanguageToFormat", () => {
    it("maps 'js' alias to 'javascript'", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const codeBlock = createCodeBlockElement("cb-js", "code", "js");
      container.appendChild(codeBlock);

      testData.getManager().mountCodeViewers();
      await nextTick();

      const props = getCodeViewerProps(container, "cb-js");
      expect(props).not.toBeNull();
      expect(props!.format).toBe("javascript");
    });

    it("maps 'ts' alias to 'typescript'", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const codeBlock = createCodeBlockElement("cb-ts", "code", "ts");
      container.appendChild(codeBlock);

      testData.getManager().mountCodeViewers();
      await nextTick();

      const props = getCodeViewerProps(container, "cb-ts");
      expect(props).not.toBeNull();
      expect(props!.format).toBe("typescript");
    });

    it("maps 'py' alias to 'python'", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const codeBlock = createCodeBlockElement("cb-py", "code", "py");
      container.appendChild(codeBlock);

      testData.getManager().mountCodeViewers();
      await nextTick();

      const props = getCodeViewerProps(container, "cb-py");
      expect(props).not.toBeNull();
      expect(props!.format).toBe("python");
    });

    it("maps 'yml' alias to 'yaml'", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const codeBlock = createCodeBlockElement("cb-yml", "code", "yml");
      container.appendChild(codeBlock);

      testData.getManager().mountCodeViewers();
      await nextTick();

      const props = getCodeViewerProps(container, "cb-yml");
      expect(props).not.toBeNull();
      expect(props!.format).toBe("yaml");
    });

    it("maps 'rb' alias to 'ruby'", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const codeBlock = createCodeBlockElement("cb-rb", "code", "rb");
      container.appendChild(codeBlock);

      testData.getManager().mountCodeViewers();
      await nextTick();

      const props = getCodeViewerProps(container, "cb-rb");
      expect(props).not.toBeNull();
      expect(props!.format).toBe("ruby");
    });

    it("maps 'md' alias to 'markdown'", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const codeBlock = createCodeBlockElement("cb-md", "code", "md");
      container.appendChild(codeBlock);

      testData.getManager().mountCodeViewers();
      await nextTick();

      const props = getCodeViewerProps(container, "cb-md");
      expect(props).not.toBeNull();
      expect(props!.format).toBe("markdown");
    });

    it("maps 'sh' alias to 'bash'", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const codeBlock = createCodeBlockElement("cb-sh", "code", "sh");
      container.appendChild(codeBlock);

      testData.getManager().mountCodeViewers();
      await nextTick();

      const props = getCodeViewerProps(container, "cb-sh");
      expect(props).not.toBeNull();
      expect(props!.format).toBe("bash");
    });

    it("maps 'shell' alias to 'bash'", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const codeBlock = createCodeBlockElement("cb-shell", "code", "shell");
      container.appendChild(codeBlock);

      testData.getManager().mountCodeViewers();
      await nextTick();

      const props = getCodeViewerProps(container, "cb-shell");
      expect(props).not.toBeNull();
      expect(props!.format).toBe("bash");
    });

    it("passes through unknown languages unchanged", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const codeBlock = createCodeBlockElement("cb-rust", "code", "rust");
      container.appendChild(codeBlock);

      testData.getManager().mountCodeViewers();
      await nextTick();

      const props = getCodeViewerProps(container, "cb-rust");
      expect(props).not.toBeNull();
      expect(props!.format).toBe("rust");
    });

    it("maps empty string language to 'text'", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const codeBlock = createCodeBlockElement("cb-empty", "code", "");
      container.appendChild(codeBlock);

      testData.getManager().mountCodeViewers();
      await nextTick();

      const props = getCodeViewerProps(container, "cb-empty");
      expect(props).not.toBeNull();
      expect(props!.format).toBe("text");
    });
  });

  describe("readonly flag propagation", () => {
    it("mounts CodeViewer with editable props when readonly is false", async () => {
      testData = createTestWrapper({ readonly: false });
      await nextTick();

      const container = testData.contentRef.value!;
      const codeBlock = createCodeBlockElement("cb-rw", "code", "javascript");
      container.appendChild(codeBlock);

      testData.getManager().mountCodeViewers();
      await nextTick();

      const props = getCodeViewerProps(container, "cb-rw");
      expect(props).not.toBeNull();
      expect(props!.canEdit).toBe(true);
      expect(props!.editable).toBe(true);
      expect(props!.allowAnyLanguage).toBe(true);
      expect(props!.hideFooter).toBe(false);
    });

    it("mounts CodeViewer with non-editable props when readonly is true", async () => {
      testData = createTestWrapper({ readonly: true });
      await nextTick();

      const container = testData.contentRef.value!;
      const codeBlock = createCodeBlockElement("cb-ro", "code", "javascript");
      container.appendChild(codeBlock);

      testData.getManager().mountCodeViewers();
      await nextTick();

      const props = getCodeViewerProps(container, "cb-ro");
      expect(props).not.toBeNull();
      expect(props!.canEdit).toBe(false);
      expect(props!.editable).toBe(false);
      expect(props!.allowAnyLanguage).toBe(false);
      expect(props!.hideFooter).toBe(true);
    });

    it("defaults to editable when readonly is undefined", async () => {
      testData = createTestWrapper();
      await nextTick();

      const container = testData.contentRef.value!;
      const codeBlock = createCodeBlockElement("cb-default", "code", "javascript");
      container.appendChild(codeBlock);

      testData.getManager().mountCodeViewers();
      await nextTick();

      const props = getCodeViewerProps(container, "cb-default");
      expect(props).not.toBeNull();
      expect(props!.canEdit).toBe(true);
      expect(props!.editable).toBe(true);
      expect(props!.allowAnyLanguage).toBe(true);
      expect(props!.hideFooter).toBe(false);
    });
  });

  describe("watcher callbacks", () => {
    let reactiveTestData: ReturnType<typeof createReactiveTestWrapper>;

    afterEach(() => {
      if (reactiveTestData) {
        reactiveTestData.wrapper.unmount();
      }
    });

    it("updates CodeViewer content when codeBlocks map entry content changes", async () => {
      reactiveTestData = createReactiveTestWrapper();
      await nextTick();

      const container = reactiveTestData.contentRef.value!;
      const codeBlock = createCodeBlockElement("cb-watch-content", "initial", "javascript");
      container.appendChild(codeBlock);

      reactiveTestData.getManager().mountCodeViewers();
      await nextTick();

      // Verify initial content
      let props = getCodeViewerProps(container, "cb-watch-content");
      expect(props).not.toBeNull();
      expect(props!.modelValue).toBe("initial");

      // Update the reactive map's entry content
      const state = reactiveTestData.codeBlocks.get("cb-watch-content")!;
      state.content = "updated via watcher";
      await nextTick();

      // Check that the CodeViewer received the new content
      props = getCodeViewerProps(container, "cb-watch-content");
      expect(props!.modelValue).toBe("updated via watcher");
    });

    it("updates CodeViewer language when codeBlocks map entry language changes", async () => {
      reactiveTestData = createReactiveTestWrapper();
      await nextTick();

      const container = reactiveTestData.contentRef.value!;
      const codeBlock = createCodeBlockElement("cb-watch-lang", "code", "javascript");
      container.appendChild(codeBlock);

      reactiveTestData.getManager().mountCodeViewers();
      await nextTick();

      // Verify initial format (javascript passes through unchanged)
      let props = getCodeViewerProps(container, "cb-watch-lang");
      expect(props).not.toBeNull();
      expect(props!.format).toBe("javascript");

      // Update the reactive map's entry language
      const state = reactiveTestData.codeBlocks.get("cb-watch-lang")!;
      state.language = "python";
      await nextTick();

      // Check that the CodeViewer received the new format
      props = getCodeViewerProps(container, "cb-watch-lang");
      expect(props!.format).toBe("python");
    });

    it("does not update content when watcher receives undefined", async () => {
      reactiveTestData = createReactiveTestWrapper();
      await nextTick();

      const container = reactiveTestData.contentRef.value!;
      const codeBlock = createCodeBlockElement("cb-watch-undef", "original", "javascript");
      container.appendChild(codeBlock);

      reactiveTestData.getManager().mountCodeViewers();
      await nextTick();

      // Verify initial state
      let props = getCodeViewerProps(container, "cb-watch-undef");
      expect(props!.modelValue).toBe("original");

      // Delete the entry from the map - watcher will receive undefined
      reactiveTestData.codeBlocks.delete("cb-watch-undef");
      await nextTick();

      // The content should remain unchanged since the watcher guards against undefined
      props = getCodeViewerProps(container, "cb-watch-undef");
      expect(props!.modelValue).toBe("original");
    });
  });
});
