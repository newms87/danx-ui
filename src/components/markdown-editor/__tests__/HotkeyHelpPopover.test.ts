import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import HotkeyHelpPopover from "../HotkeyHelpPopover.vue";
import { HotkeyDefinition } from "../useMarkdownHotkeys";

// DanxDialog uses <dialog> element which requires showModal/close mocks
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

function createHotkey(overrides: Partial<HotkeyDefinition> = {}): HotkeyDefinition {
  return {
    key: "ctrl+b",
    action: () => {},
    description: "Bold",
    group: "formatting",
    ...overrides,
  };
}

/**
 * HotkeyHelpPopover renders inside a DanxDialog which uses <Teleport to="body">.
 * Teleported content is not inside the wrapper DOM tree, so we must query
 * document.body for DanxDialog content (dialog element, close button, etc.).
 * Content inside the dialog (hotkey groups, keys) can also be found via document.body.
 */

/** Query teleported dialog content in document.body */
function bodyQuery(selector: string): Element | null {
  return document.body.querySelector(selector);
}

function bodyQueryAll(selector: string): NodeListOf<Element> {
  return document.body.querySelectorAll(selector);
}

describe("HotkeyHelpPopover", () => {
  const wrappers: VueWrapper[] = [];

  function mountPopover(hotkeys: HotkeyDefinition[] = []) {
    const wrapper = mount(HotkeyHelpPopover, {
      props: { hotkeys },
    });
    wrappers.push(wrapper);
    return wrapper;
  }

  afterEach(() => {
    for (const w of wrappers) w.unmount();
    wrappers.length = 0;
    // Clean up teleported content
    document.body.querySelectorAll("dialog").forEach((el) => el.remove());
  });

  describe("rendering", () => {
    it("renders the dialog", () => {
      mountPopover();
      expect(bodyQuery("dialog.danx-dialog")).not.toBeNull();
    });

    it("renders Keyboard Shortcuts heading", () => {
      mountPopover();
      expect(bodyQuery(".danx-dialog__title")?.textContent).toBe("Keyboard Shortcuts");
    });

    it("renders close button", () => {
      mountPopover();
      expect(bodyQuery(".danx-dialog__close-x")).not.toBeNull();
    });
  });

  describe("grouping", () => {
    it("groups hotkeys by group name", () => {
      const hotkeys = [
        createHotkey({ key: "ctrl+b", group: "formatting", description: "Bold" }),
        createHotkey({ key: "ctrl+1", group: "headings", description: "Heading 1" }),
        createHotkey({ key: "ctrl+i", group: "formatting", description: "Italic" }),
      ];
      mountPopover(hotkeys);

      const groups = bodyQueryAll(".hotkey-group");
      expect(groups.length).toBe(2); // headings and formatting
    });

    it("displays group labels", () => {
      const hotkeys = [
        createHotkey({ group: "formatting" }),
        createHotkey({ key: "ctrl+1", group: "headings" }),
      ];
      mountPopover(hotkeys);

      const labels = Array.from(bodyQueryAll(".hotkey-group h4")).map((el) => el.textContent);
      expect(labels).toContain("Headings");
      expect(labels).toContain("Formatting");
    });

    it("orders groups: headings, formatting, lists, blocks, tables, other", () => {
      const hotkeys = [
        createHotkey({ key: "ctrl+?", group: "other", description: "Help" }),
        createHotkey({ key: "ctrl+b", group: "formatting", description: "Bold" }),
        createHotkey({ key: "ctrl+1", group: "headings", description: "H1" }),
      ];
      mountPopover(hotkeys);

      const labels = Array.from(bodyQueryAll(".hotkey-group h4")).map((el) => el.textContent);
      expect(labels).toEqual(["Headings", "Formatting", "Other"]);
    });

    it("filters out empty groups", () => {
      const hotkeys = [createHotkey({ group: "formatting" })];
      mountPopover(hotkeys);

      const groups = bodyQueryAll(".hotkey-group");
      expect(groups.length).toBe(1);
    });
  });

  describe("hotkey display", () => {
    it("shows hotkey description", () => {
      const hotkeys = [createHotkey({ description: "Toggle Bold" })];
      mountPopover(hotkeys);

      expect(bodyQuery(".hotkey-description")?.textContent).toBe("Toggle Bold");
    });

    it("formats key with proper capitalization", () => {
      const hotkeys = [createHotkey({ key: "ctrl+shift+b" })];
      mountPopover(hotkeys);

      expect(bodyQuery(".hotkey-key")?.textContent).toBe("Ctrl + Shift + B");
    });

    it("formats alt key", () => {
      const hotkeys = [createHotkey({ key: "alt+1" })];
      mountPopover(hotkeys);

      expect(bodyQuery(".hotkey-key")?.textContent).toBe("Alt + 1");
    });

    it("formats meta/cmd/command key as Cmd", () => {
      const hotkeys = [createHotkey({ key: "meta+b" })];
      mountPopover(hotkeys);

      expect(bodyQuery(".hotkey-key")?.textContent).toBe("Cmd + B");
    });

    it("formats option key as Alt", () => {
      const hotkeys = [createHotkey({ key: "option+1" })];
      mountPopover(hotkeys);

      expect(bodyQuery(".hotkey-key")?.textContent).toBe("Alt + 1");
    });

    it("formats control key as Ctrl", () => {
      const hotkeys = [createHotkey({ key: "control+b" })];
      mountPopover(hotkeys);

      expect(bodyQuery(".hotkey-key")?.textContent).toBe("Ctrl + B");
    });

    it("formats command key as Cmd", () => {
      const hotkeys = [createHotkey({ key: "command+b" })];
      mountPopover(hotkeys);

      expect(bodyQuery(".hotkey-key")?.textContent).toBe("Cmd + B");
    });

    it("formats cmd key as Cmd", () => {
      const hotkeys = [createHotkey({ key: "cmd+b" })];
      mountPopover(hotkeys);

      expect(bodyQuery(".hotkey-key")?.textContent).toBe("Cmd + B");
    });
  });

  describe("events", () => {
    it("emits close when DanxDialog emits close", () => {
      const wrapper = mountPopover();
      const dialog = wrapper.findComponent({ name: "DanxDialog" });
      dialog.vm.$emit("close");
      expect(wrapper.emitted("close")).toHaveLength(1);
    });

    it("emits close when close button is clicked", async () => {
      const wrapper = mountPopover();
      const closeBtn = bodyQuery(".danx-dialog__close-x") as HTMLElement;
      expect(closeBtn).not.toBeNull();
      closeBtn.click();
      expect(wrapper.emitted("close")).toHaveLength(1);
    });

    it("forwards close event from DanxDialog (triggered by Escape/cancel)", () => {
      // DanxDialog handles Escape → cancel → handleClose → emit("close").
      // HotkeyHelpPopover forwards @close to its own close emit.
      // We test the forwarding by emitting close on the DanxDialog component.
      const wrapper = mountPopover();
      const dialog = wrapper.findComponent({ name: "DanxDialog" });
      dialog.vm.$emit("close");
      expect(wrapper.emitted("close")).toHaveLength(1);
    });
  });
});
