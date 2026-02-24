import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { mapLanguageToFormat, mountCodeViewer, handleFormatChange } from "../codeViewerMount";
import type { MountCodeViewerDeps, MountedInstance } from "../codeViewerMount";
import type { CodeBlockState } from "../useCodeBlocks";

describe("codeViewerMount", () => {
  describe("mapLanguageToFormat", () => {
    it("maps js to javascript", () => {
      expect(mapLanguageToFormat("js")).toBe("javascript");
    });

    it("maps ts to typescript", () => {
      expect(mapLanguageToFormat("ts")).toBe("typescript");
    });

    it("maps py to python", () => {
      expect(mapLanguageToFormat("py")).toBe("python");
    });

    it("maps rb to ruby", () => {
      expect(mapLanguageToFormat("rb")).toBe("ruby");
    });

    it("maps yml to yaml", () => {
      expect(mapLanguageToFormat("yml")).toBe("yaml");
    });

    it("maps md to markdown", () => {
      expect(mapLanguageToFormat("md")).toBe("markdown");
    });

    it("maps sh to bash", () => {
      expect(mapLanguageToFormat("sh")).toBe("bash");
    });

    it("maps shell to bash", () => {
      expect(mapLanguageToFormat("shell")).toBe("bash");
    });

    it("passes through unmapped languages", () => {
      expect(mapLanguageToFormat("rust")).toBe("rust");
      expect(mapLanguageToFormat("go")).toBe("go");
      expect(mapLanguageToFormat("css")).toBe("css");
    });

    it("returns text for empty string", () => {
      expect(mapLanguageToFormat("")).toBe("text");
    });
  });

  describe("mountCodeViewer", () => {
    const mountedApps: Array<{ unmount: () => void }> = [];

    function createWrapper(
      id: string | null,
      content = "test content",
      language = "javascript"
    ): HTMLElement {
      const wrapper = document.createElement("div");
      if (id) {
        wrapper.setAttribute("data-code-block-id", id);
      }

      const mountPoint = document.createElement("div");
      mountPoint.className = "code-viewer-mount-point";
      mountPoint.setAttribute("data-content", content);
      mountPoint.setAttribute("data-language", language);
      wrapper.appendChild(mountPoint);

      document.body.appendChild(wrapper);
      return wrapper;
    }

    function createDeps(overrides?: Partial<MountCodeViewerDeps>): MountCodeViewerDeps {
      return {
        codeBlocks: new Map<string, CodeBlockState>(),
        mountedInstances: new Map<string, MountedInstance>(),
        mountedWatchers: new Map<string, () => void>(),
        updateCodeBlockContent: vi.fn(),
        updateCodeBlockLanguage: vi.fn(),
        ...overrides,
      };
    }

    afterEach(() => {
      for (const app of mountedApps) {
        app.unmount();
      }
      mountedApps.length = 0;
      document.body.innerHTML = "";
    });

    it("skips when wrapper has no data-code-block-id", () => {
      const wrapper = createWrapper(null);
      const deps = createDeps();

      mountCodeViewer(wrapper, deps);

      expect(deps.mountedInstances.size).toBe(0);
    });

    it("skips when already mounted", () => {
      const wrapper = createWrapper("cb1");
      const existingInstance = {
        app: { unmount: vi.fn() } as unknown as MountedInstance["app"],
        mountPoint: document.createElement("div"),
      };
      const deps = createDeps({
        mountedInstances: new Map([["cb1", existingInstance]]),
      });

      mountCodeViewer(wrapper, deps);

      // Should still only have 1 entry (the existing one)
      expect(deps.mountedInstances.size).toBe(1);
    });

    it("skips when no mount point found", () => {
      const wrapper = document.createElement("div");
      wrapper.setAttribute("data-code-block-id", "cb1");
      // No mount point child
      document.body.appendChild(wrapper);
      const deps = createDeps();

      mountCodeViewer(wrapper, deps);

      expect(deps.mountedInstances.size).toBe(0);
    });

    it("mounts a CodeViewer and registers the instance", () => {
      const wrapper = createWrapper("cb1");
      const deps = createDeps();

      mountCodeViewer(wrapper, deps);

      expect(deps.mountedInstances.has("cb1")).toBe(true);
      mountedApps.push(deps.mountedInstances.get("cb1")!.app);
    });

    it("registers watchers for the code block", () => {
      const wrapper = createWrapper("cb1");
      const deps = createDeps();

      mountCodeViewer(wrapper, deps);

      expect(deps.mountedWatchers.has("cb1")).toBe(true);
      mountedApps.push(deps.mountedInstances.get("cb1")!.app);
    });

    it("registers code block state when not already in codeBlocks map", () => {
      const wrapper = createWrapper("cb1", "initial content", "python");
      const deps = createDeps();

      mountCodeViewer(wrapper, deps);

      const state = deps.codeBlocks.get("cb1");
      expect(state).toEqual({ id: "cb1", content: "initial content", language: "python" });
      mountedApps.push(deps.mountedInstances.get("cb1")!.app);
    });

    it("uses existing state from codeBlocks map when present", () => {
      const wrapper = createWrapper("cb1", "data attr content", "yaml");
      const deps = createDeps({
        codeBlocks: new Map([
          ["cb1", { id: "cb1", content: "existing content", language: "json" }],
        ]),
      });

      mountCodeViewer(wrapper, deps);

      // Should NOT overwrite existing state
      const state = deps.codeBlocks.get("cb1");
      expect(state?.content).toBe("existing content");
      expect(state?.language).toBe("json");
      mountedApps.push(deps.mountedInstances.get("cb1")!.app);
    });

    it("calls onCodeBlockMounted callback", async () => {
      const wrapper = createWrapper("cb1");
      const onCodeBlockMounted = vi.fn();
      const deps = createDeps({ onCodeBlockMounted });

      mountCodeViewer(wrapper, deps);

      // onCodeBlockMounted is called via nextTick
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(onCodeBlockMounted).toHaveBeenCalledWith("cb1", wrapper);
      mountedApps.push(deps.mountedInstances.get("cb1")!.app);
    });

    it("mounts with readonly props when readonly is true", () => {
      const wrapper = createWrapper("cb1");
      const deps = createDeps({ readonly: true });

      mountCodeViewer(wrapper, deps);

      expect(deps.mountedInstances.has("cb1")).toBe(true);
      mountedApps.push(deps.mountedInstances.get("cb1")!.app);
    });

    it("clears the mount point innerHTML before mounting", () => {
      const wrapper = createWrapper("cb1");
      const mountPoint = wrapper.querySelector(".code-viewer-mount-point")!;
      mountPoint.innerHTML = "<div>old content</div>";
      const deps = createDeps();

      mountCodeViewer(wrapper, deps);

      expect(deps.mountedInstances.has("cb1")).toBe(true);
      mountedApps.push(deps.mountedInstances.get("cb1")!.app);
    });

    describe("auto-detected format preference", () => {
      const STORAGE_KEY = "dx-structured-data-format";

      beforeEach(() => {
        localStorage.removeItem(STORAGE_KEY);
      });

      function createAutoDetectedWrapper(
        id: string,
        content = '{"a": 1}',
        language = "json"
      ): HTMLElement {
        const wrapper = document.createElement("div");
        wrapper.setAttribute("data-code-block-id", id);

        const mountPoint = document.createElement("div");
        mountPoint.className = "code-viewer-mount-point";
        mountPoint.setAttribute("data-content", content);
        mountPoint.setAttribute("data-language", language);
        mountPoint.setAttribute("data-auto-detected", "true");
        wrapper.appendChild(mountPoint);

        document.body.appendChild(wrapper);
        return wrapper;
      }

      it("applies preferred format to auto-detected blocks", () => {
        localStorage.setItem(STORAGE_KEY, "yaml");
        const wrapper = createAutoDetectedWrapper("cb-ad1");
        const deps = createDeps();

        mountCodeViewer(wrapper, deps);

        const state = deps.codeBlocks.get("cb-ad1");
        expect(state?.language).toBe("yaml");
        mountedApps.push(deps.mountedInstances.get("cb-ad1")!.app);
      });

      it("uses original language when no preference is set", () => {
        const wrapper = createAutoDetectedWrapper("cb-ad2", '{"a": 1}', "json");
        const deps = createDeps();

        mountCodeViewer(wrapper, deps);

        const state = deps.codeBlocks.get("cb-ad2");
        expect(state?.language).toBe("json");
        mountedApps.push(deps.mountedInstances.get("cb-ad2")!.app);
      });

      it("does not apply preference to non-auto-detected blocks", () => {
        localStorage.setItem(STORAGE_KEY, "yaml");
        const wrapper = createWrapper("cb-ad3", '{"a": 1}', "json");
        const deps = createDeps();

        mountCodeViewer(wrapper, deps);

        const state = deps.codeBlocks.get("cb-ad3");
        expect(state?.language).toBe("json");
        mountedApps.push(deps.mountedInstances.get("cb-ad3")!.app);
      });

      it("does not apply preference to auto-detected blocks with non-structured-data language", () => {
        localStorage.setItem(STORAGE_KEY, "yaml");
        const wrapper = createAutoDetectedWrapper("cb-ad4", "const x = 1;", "javascript");
        const deps = createDeps();

        mountCodeViewer(wrapper, deps);

        const state = deps.codeBlocks.get("cb-ad4");
        expect(state?.language).toBe("javascript");
        mountedApps.push(deps.mountedInstances.get("cb-ad4")!.app);
      });

      it("applies JSON preference to auto-detected YAML block", () => {
        localStorage.setItem(STORAGE_KEY, "json");
        const wrapper = createAutoDetectedWrapper("cb-ad5", "name: John\nage: 30", "yaml");
        const deps = createDeps();

        mountCodeViewer(wrapper, deps);

        const state = deps.codeBlocks.get("cb-ad5");
        expect(state?.language).toBe("json");
        mountedApps.push(deps.mountedInstances.get("cb-ad5")!.app);
      });
    });

    describe("handleFormatChange", () => {
      const FORMAT_KEY = "dx-structured-data-format";

      beforeEach(() => {
        localStorage.removeItem(FORMAT_KEY);
      });

      it("updates language and persists preference for auto-detected structured data", () => {
        const updateLanguage = vi.fn();
        handleFormatChange("cb1", "yaml", true, updateLanguage);
        expect(updateLanguage).toHaveBeenCalledWith("cb1", "yaml");
        expect(localStorage.getItem(FORMAT_KEY)).toBe("yaml");
      });

      it("updates language but does not persist for non-auto-detected blocks", () => {
        const updateLanguage = vi.fn();
        handleFormatChange("cb1", "yaml", false, updateLanguage);
        expect(updateLanguage).toHaveBeenCalledWith("cb1", "yaml");
        expect(localStorage.getItem(FORMAT_KEY)).toBeNull();
      });

      it("updates language but does not persist for non-structured-data formats", () => {
        const updateLanguage = vi.fn();
        handleFormatChange("cb1", "javascript", true, updateLanguage);
        expect(updateLanguage).toHaveBeenCalledWith("cb1", "javascript");
        expect(localStorage.getItem(FORMAT_KEY)).toBeNull();
      });
    });
  });
});
