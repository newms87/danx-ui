import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import HotkeyHelpPopover from "../HotkeyHelpPopover.vue";
import { HotkeyDefinition } from "../useMarkdownHotkeys";

function createHotkey(overrides: Partial<HotkeyDefinition> = {}): HotkeyDefinition {
  return {
    key: "ctrl+b",
    action: () => {},
    description: "Bold",
    group: "formatting",
    ...overrides,
  };
}

describe("HotkeyHelpPopover", () => {
  describe("rendering", () => {
    it("renders the overlay", () => {
      const wrapper = mount(HotkeyHelpPopover, {
        props: { hotkeys: [] },
        attachTo: document.body,
      });
      expect(wrapper.find(".dx-popover-overlay").exists()).toBe(true);
      wrapper.unmount();
    });

    it("renders Keyboard Shortcuts heading", () => {
      const wrapper = mount(HotkeyHelpPopover, {
        props: { hotkeys: [] },
        attachTo: document.body,
      });
      expect(wrapper.find(".popover-header h3").text()).toBe("Keyboard Shortcuts");
      wrapper.unmount();
    });

    it("renders close button", () => {
      const wrapper = mount(HotkeyHelpPopover, {
        props: { hotkeys: [] },
        attachTo: document.body,
      });
      expect(wrapper.find(".close-btn").exists()).toBe(true);
      wrapper.unmount();
    });
  });

  describe("grouping", () => {
    it("groups hotkeys by group name", () => {
      const hotkeys = [
        createHotkey({ key: "ctrl+b", group: "formatting", description: "Bold" }),
        createHotkey({ key: "ctrl+1", group: "headings", description: "Heading 1" }),
        createHotkey({ key: "ctrl+i", group: "formatting", description: "Italic" }),
      ];
      const wrapper = mount(HotkeyHelpPopover, {
        props: { hotkeys },
        attachTo: document.body,
      });

      const groups = wrapper.findAll(".hotkey-group");
      expect(groups.length).toBe(2); // headings and formatting
      wrapper.unmount();
    });

    it("displays group labels", () => {
      const hotkeys = [
        createHotkey({ group: "formatting" }),
        createHotkey({ key: "ctrl+1", group: "headings" }),
      ];
      const wrapper = mount(HotkeyHelpPopover, {
        props: { hotkeys },
        attachTo: document.body,
      });

      const labels = wrapper.findAll(".hotkey-group h4").map((el) => el.text());
      expect(labels).toContain("Headings");
      expect(labels).toContain("Formatting");
      wrapper.unmount();
    });

    it("orders groups: headings, formatting, lists, blocks, tables, other", () => {
      const hotkeys = [
        createHotkey({ key: "ctrl+?", group: "other", description: "Help" }),
        createHotkey({ key: "ctrl+b", group: "formatting", description: "Bold" }),
        createHotkey({ key: "ctrl+1", group: "headings", description: "H1" }),
      ];
      const wrapper = mount(HotkeyHelpPopover, {
        props: { hotkeys },
        attachTo: document.body,
      });

      const labels = wrapper.findAll(".hotkey-group h4").map((el) => el.text());
      expect(labels).toEqual(["Headings", "Formatting", "Other"]);
      wrapper.unmount();
    });

    it("filters out empty groups", () => {
      const hotkeys = [createHotkey({ group: "formatting" })];
      const wrapper = mount(HotkeyHelpPopover, {
        props: { hotkeys },
        attachTo: document.body,
      });

      const groups = wrapper.findAll(".hotkey-group");
      expect(groups.length).toBe(1);
      wrapper.unmount();
    });
  });

  describe("hotkey display", () => {
    it("shows hotkey description", () => {
      const hotkeys = [createHotkey({ description: "Toggle Bold" })];
      const wrapper = mount(HotkeyHelpPopover, {
        props: { hotkeys },
        attachTo: document.body,
      });

      expect(wrapper.find(".hotkey-description").text()).toBe("Toggle Bold");
      wrapper.unmount();
    });

    it("formats key with proper capitalization", () => {
      const hotkeys = [createHotkey({ key: "ctrl+shift+b" })];
      const wrapper = mount(HotkeyHelpPopover, {
        props: { hotkeys },
        attachTo: document.body,
      });

      expect(wrapper.find(".hotkey-key").text()).toBe("Ctrl + Shift + B");
      wrapper.unmount();
    });

    it("formats alt key", () => {
      const hotkeys = [createHotkey({ key: "alt+1" })];
      const wrapper = mount(HotkeyHelpPopover, {
        props: { hotkeys },
        attachTo: document.body,
      });

      expect(wrapper.find(".hotkey-key").text()).toBe("Alt + 1");
      wrapper.unmount();
    });

    it("formats meta/cmd/command key as Cmd", () => {
      const hotkeys = [createHotkey({ key: "meta+b" })];
      const wrapper = mount(HotkeyHelpPopover, {
        props: { hotkeys },
        attachTo: document.body,
      });

      expect(wrapper.find(".hotkey-key").text()).toBe("Cmd + B");
      wrapper.unmount();
    });

    it("formats option key as Alt", () => {
      const hotkeys = [createHotkey({ key: "option+1" })];
      const wrapper = mount(HotkeyHelpPopover, {
        props: { hotkeys },
        attachTo: document.body,
      });

      expect(wrapper.find(".hotkey-key").text()).toBe("Alt + 1");
      wrapper.unmount();
    });

    it("formats control key as Ctrl", () => {
      const hotkeys = [createHotkey({ key: "control+b" })];
      const wrapper = mount(HotkeyHelpPopover, {
        props: { hotkeys },
        attachTo: document.body,
      });

      expect(wrapper.find(".hotkey-key").text()).toBe("Ctrl + B");
      wrapper.unmount();
    });

    it("formats command key as Cmd", () => {
      const hotkeys = [createHotkey({ key: "command+b" })];
      const wrapper = mount(HotkeyHelpPopover, {
        props: { hotkeys },
        attachTo: document.body,
      });

      expect(wrapper.find(".hotkey-key").text()).toBe("Cmd + B");
      wrapper.unmount();
    });

    it("formats cmd key as Cmd", () => {
      const hotkeys = [createHotkey({ key: "cmd+b" })];
      const wrapper = mount(HotkeyHelpPopover, {
        props: { hotkeys },
        attachTo: document.body,
      });

      expect(wrapper.find(".hotkey-key").text()).toBe("Cmd + B");
      wrapper.unmount();
    });
  });

  describe("events", () => {
    it("emits close when overlay is clicked", async () => {
      const wrapper = mount(HotkeyHelpPopover, {
        props: { hotkeys: [] },
        attachTo: document.body,
      });

      await wrapper.find(".dx-popover-overlay").trigger("click");
      expect(wrapper.emitted("close")).toHaveLength(1);
      wrapper.unmount();
    });

    it("emits close when close button is clicked", async () => {
      const wrapper = mount(HotkeyHelpPopover, {
        props: { hotkeys: [] },
        attachTo: document.body,
      });

      await wrapper.find(".close-btn").trigger("click");
      expect(wrapper.emitted("close")).toHaveLength(1);
      wrapper.unmount();
    });

    it("emits close when Escape is pressed on overlay", async () => {
      const wrapper = mount(HotkeyHelpPopover, {
        props: { hotkeys: [] },
        attachTo: document.body,
      });

      await wrapper.find(".dx-popover-overlay").trigger("keydown", { key: "Escape" });
      expect(wrapper.emitted("close")).toHaveLength(1);
      wrapper.unmount();
    });
  });
});
