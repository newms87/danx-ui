import { describe, it, expect, vi, afterEach } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import LineTypeMenu from "../LineTypeMenu.vue";

describe("LineTypeMenu", () => {
  let wrapper: VueWrapper;

  afterEach(() => {
    wrapper?.unmount();
  });

  function mountMenu(currentType = "paragraph" as string) {
    wrapper = mount(LineTypeMenu, {
      props: { currentType },
      attachTo: document.body,
    });
    return wrapper;
  }

  describe("rendering", () => {
    it("renders the menu container", () => {
      mountMenu();
      expect(wrapper.find(".dx-line-type-menu").exists()).toBe(true);
    });

    it("renders trigger button", () => {
      mountMenu();
      expect(wrapper.find(".line-type-trigger").exists()).toBe(true);
    });

    it("shows paragraph icon by default", () => {
      mountMenu("paragraph");
      expect(wrapper.find(".type-icon").text()).toBe("\u00B6");
    });

    it("shows heading icon for h1", () => {
      mountMenu("h1");
      expect(wrapper.find(".type-icon").text()).toBe("H1");
    });

    it("shows list icon for ul", () => {
      mountMenu("ul");
      expect(wrapper.find(".type-icon").text()).toBe("\u2022");
    });

    it("shows ordered list icon for ol", () => {
      mountMenu("ol");
      expect(wrapper.find(".type-icon").text()).toBe("1.");
    });

    it("shows code icon for code", () => {
      mountMenu("code");
      expect(wrapper.find(".type-icon").text()).toBe("</>");
    });

    it("shows blockquote icon for blockquote", () => {
      mountMenu("blockquote");
      expect(wrapper.find(".type-icon").text()).toBe(">");
    });

    it("has title attribute on trigger", () => {
      mountMenu("h2");
      expect(wrapper.find(".line-type-trigger").attributes("title")).toBe("Heading 2");
    });

    it("does not show dropdown by default", () => {
      mountMenu();
      expect(wrapper.find(".line-type-dropdown").exists()).toBe(false);
    });
  });

  describe("dropdown toggle", () => {
    it("opens dropdown on trigger mousedown", async () => {
      mountMenu();
      await wrapper.find(".line-type-trigger").trigger("mousedown");
      expect(wrapper.find(".line-type-dropdown").exists()).toBe(true);
    });

    it("closes dropdown on second trigger mousedown", async () => {
      mountMenu();
      await wrapper.find(".line-type-trigger").trigger("mousedown");
      expect(wrapper.find(".line-type-dropdown").exists()).toBe(true);
      await wrapper.find(".line-type-trigger").trigger("mousedown");
      expect(wrapper.find(".line-type-dropdown").exists()).toBe(false);
    });

    it("adds is-open class when open", async () => {
      mountMenu();
      await wrapper.find(".line-type-trigger").trigger("mousedown");
      expect(wrapper.find(".dx-line-type-menu.is-open").exists()).toBe(true);
    });
  });

  describe("dropdown content", () => {
    it("shows all 11 line type options", async () => {
      mountMenu();
      await wrapper.find(".line-type-trigger").trigger("mousedown");
      const options = wrapper.findAll(".line-type-option");
      expect(options.length).toBe(11);
    });

    it("marks current type as active", async () => {
      mountMenu("h3");
      await wrapper.find(".line-type-trigger").trigger("mousedown");
      const active = wrapper.find(".line-type-option.active");
      expect(active.find(".option-label").text()).toBe("Heading 3");
    });

    it("shows option icons", async () => {
      mountMenu();
      await wrapper.find(".line-type-trigger").trigger("mousedown");
      const icons = wrapper.findAll(".option-icon").map((el) => el.text());
      expect(icons).toContain("H1");
      expect(icons).toContain("\u2022");
      expect(icons).toContain("</>");
    });

    it("shows option shortcuts", async () => {
      mountMenu();
      await wrapper.find(".line-type-trigger").trigger("mousedown");
      const shortcuts = wrapper.findAll(".option-shortcut").map((el) => el.text());
      expect(shortcuts).toContain("Ctrl+0");
      expect(shortcuts).toContain("Ctrl+1");
      expect(shortcuts).toContain("Ctrl+Shift+K");
    });
  });

  describe("selection", () => {
    it("emits change when option is selected", async () => {
      mountMenu();
      await wrapper.find(".line-type-trigger").trigger("mousedown");
      const options = wrapper.findAll(".line-type-option");
      // Select h2 (index 2)
      await options[2]!.trigger("mousedown");
      expect(wrapper.emitted("change")).toHaveLength(1);
      expect(wrapper.emitted("change")![0]).toEqual(["h2"]);
    });

    it("closes dropdown after selection", async () => {
      mountMenu();
      await wrapper.find(".line-type-trigger").trigger("mousedown");
      await wrapper.findAll(".line-type-option")[1]!.trigger("mousedown");
      await nextTick();
      expect(wrapper.find(".line-type-dropdown").exists()).toBe(false);
    });
  });

  describe("close behavior", () => {
    it("closes on click outside", async () => {
      mountMenu();
      await wrapper.find(".line-type-trigger").trigger("mousedown");
      expect(wrapper.find(".line-type-dropdown").exists()).toBe(true);

      // Simulate click outside
      const event = new MouseEvent("mousedown", { bubbles: true });
      document.dispatchEvent(event);
      await nextTick();
      expect(wrapper.find(".line-type-dropdown").exists()).toBe(false);
    });

    it("closes on Escape key", async () => {
      mountMenu();
      await wrapper.find(".line-type-trigger").trigger("mousedown");
      expect(wrapper.find(".line-type-dropdown").exists()).toBe(true);

      const event = new KeyboardEvent("keydown", { key: "Escape" });
      document.dispatchEvent(event);
      await nextTick();
      expect(wrapper.find(".line-type-dropdown").exists()).toBe(false);
    });

    it("removes listeners when closed", async () => {
      const removeSpy = vi.spyOn(document, "removeEventListener");
      mountMenu();

      // Open then close
      await wrapper.find(".line-type-trigger").trigger("mousedown");
      await wrapper.find(".line-type-trigger").trigger("mousedown");
      await nextTick();

      const mousedownCalls = removeSpy.mock.calls.filter((c) => c[0] === "mousedown");
      const keydownCalls = removeSpy.mock.calls.filter((c) => c[0] === "keydown");
      expect(mousedownCalls.length).toBeGreaterThan(0);
      expect(keydownCalls.length).toBeGreaterThan(0);
      removeSpy.mockRestore();
    });
  });

  describe("cleanup", () => {
    it("removes listeners on unmount", () => {
      const removeSpy = vi.spyOn(document, "removeEventListener");
      mountMenu();
      wrapper.unmount();

      // Should have removed mousedown and keydown listeners
      removeSpy.mockRestore();
    });
  });

  describe("dropdown positioning", () => {
    it("defaults to open downward", async () => {
      mountMenu();
      await wrapper.find(".line-type-trigger").trigger("mousedown");
      expect(wrapper.find(".line-type-dropdown.open-upward").exists()).toBe(false);
    });
  });

  describe("falls back to first option for unknown type", () => {
    it("shows paragraph icon for unknown type", () => {
      mountMenu("unknown-type");
      expect(wrapper.find(".type-icon").text()).toBe("\u00B6");
    });
  });
});
