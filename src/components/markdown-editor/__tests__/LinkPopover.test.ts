import { describe, it, expect, vi, afterEach } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import LinkPopover from "../LinkPopover.vue";

describe("LinkPopover", () => {
  let wrapper: VueWrapper;

  afterEach(() => {
    wrapper?.unmount();
  });

  function mountPopover(props: Record<string, unknown> = {}) {
    wrapper = mount(LinkPopover, {
      props: {
        position: { x: 100, y: 200 },
        ...props,
      },
      attachTo: document.body,
    });
    return wrapper;
  }

  describe("rendering", () => {
    it("renders overlay", () => {
      mountPopover();
      expect(wrapper.find(".dx-popover-overlay").exists()).toBe(true);
    });

    it("shows Insert Link title when no existingUrl", () => {
      mountPopover();
      expect(wrapper.find(".popover-header h3").text()).toBe("Insert Link");
    });

    it("shows Edit Link title when existingUrl provided", () => {
      mountPopover({ existingUrl: "https://example.com" });
      expect(wrapper.find(".popover-header h3").text()).toBe("Edit Link");
    });

    it("shows label input when inserting new link", () => {
      mountPopover();
      expect(wrapper.find("#link-label").exists()).toBe(true);
    });

    it("hides label input when editing existing link", () => {
      mountPopover({ existingUrl: "https://example.com" });
      expect(wrapper.find("#link-label").exists()).toBe(false);
    });

    it("shows edit hint when editing", () => {
      mountPopover({ existingUrl: "https://example.com" });
      expect(wrapper.find(".edit-hint").exists()).toBe(true);
    });

    it("shows Insert button when inserting", () => {
      mountPopover();
      expect(wrapper.find(".btn-insert").text()).toBe("Insert");
    });

    it("shows Update button when editing", () => {
      mountPopover({ existingUrl: "https://example.com" });
      expect(wrapper.find(".btn-insert").text()).toBe("Update");
    });

    it("pre-fills URL when editing", () => {
      mountPopover({ existingUrl: "https://example.com" });
      const input = wrapper.find("#link-url").element as HTMLInputElement;
      expect(input.value).toBe("https://example.com");
    });
  });

  describe("label placeholder", () => {
    it("shows default placeholder when no selectedText", () => {
      mountPopover();
      const input = wrapper.find("#link-label").element as HTMLInputElement;
      expect(input.placeholder).toBe("Link text (optional)");
    });

    it("shows selectedText as placeholder", () => {
      mountPopover({ selectedText: "click here" });
      const input = wrapper.find("#link-label").element as HTMLInputElement;
      expect(input.placeholder).toBe("click here");
    });
  });

  describe("popover positioning", () => {
    it("positions below cursor", () => {
      mountPopover({ position: { x: 400, y: 200 } });
      const style = wrapper.find(".dx-link-popover").attributes("style");
      // y + padding(10) = 210
      expect(style).toContain("top: 210px");
    });

    it("positions above cursor when near bottom of viewport", () => {
      // Simulate being near bottom of viewport
      // window.innerHeight defaults to 768 in jsdom
      mountPopover({ position: { x: 400, y: 700 } });
      const style = wrapper.find(".dx-link-popover").attributes("style");
      // Should position above: y - popoverHeight(200) - padding(10) = 490
      expect(style).toContain("top: 490px");
    });

    it("constrains left edge", () => {
      mountPopover({ position: { x: 0, y: 200 } });
      const style = wrapper.find(".dx-link-popover").attributes("style");
      // left should be at least padding(10)
      expect(style).toContain("left: 10px");
    });
  });

  describe("events", () => {
    it("emits submit with url and label", async () => {
      mountPopover();
      await wrapper.find("#link-url").setValue("https://example.com");
      await wrapper.find("#link-label").setValue("Example");
      await wrapper.find(".btn-insert").trigger("click");

      expect(wrapper.emitted("submit")).toHaveLength(1);
      expect(wrapper.emitted("submit")![0]).toEqual(["https://example.com", "Example"]);
    });

    it("emits submit with url only when label empty", async () => {
      mountPopover();
      await wrapper.find("#link-url").setValue("https://example.com");
      await wrapper.find(".btn-insert").trigger("click");

      expect(wrapper.emitted("submit")![0]).toEqual(["https://example.com", undefined]);
    });

    it("trims url and label whitespace", async () => {
      mountPopover();
      await wrapper.find("#link-url").setValue("  https://example.com  ");
      await wrapper.find("#link-label").setValue("  Example  ");
      await wrapper.find(".btn-insert").trigger("click");

      expect(wrapper.emitted("submit")![0]).toEqual(["https://example.com", "Example"]);
    });

    it("emits cancel when cancel button clicked", async () => {
      mountPopover();
      await wrapper.find(".btn-cancel").trigger("click");
      expect(wrapper.emitted("cancel")).toHaveLength(1);
    });

    it("emits cancel when overlay clicked", async () => {
      mountPopover();
      await wrapper.find(".dx-popover-overlay").trigger("click");
      expect(wrapper.emitted("cancel")).toHaveLength(1);
    });

    it("emits cancel when Escape pressed on document", async () => {
      mountPopover();
      const event = new KeyboardEvent("keydown", { key: "Escape" });
      document.dispatchEvent(event);
      expect(wrapper.emitted("cancel")).toHaveLength(1);
    });

    it("emits submit on Enter key in URL input", async () => {
      mountPopover();
      await wrapper.find("#link-url").setValue("https://example.com");
      await wrapper.find("#link-url").trigger("keydown.enter");

      expect(wrapper.emitted("submit")).toHaveLength(1);
    });

    it("emits submit on Enter key in label input", async () => {
      mountPopover();
      await wrapper.find("#link-url").setValue("https://example.com");
      await wrapper.find("#link-label").trigger("keydown.enter");

      expect(wrapper.emitted("submit")).toHaveLength(1);
    });

    it("emits close button click on close-btn", async () => {
      mountPopover();
      await wrapper.find(".close-btn").trigger("click");
      expect(wrapper.emitted("cancel")).toHaveLength(1);
    });
  });

  describe("existingUrl watch", () => {
    it("updates urlValue when existingUrl prop changes", async () => {
      mountPopover({ existingUrl: "https://old.com" });
      await wrapper.setProps({ existingUrl: "https://new.com" });
      await nextTick();

      const input = wrapper.find("#link-url").element as HTMLInputElement;
      expect(input.value).toBe("https://new.com");
    });

    it("clears urlValue when existingUrl set to empty", async () => {
      mountPopover({ existingUrl: "https://old.com" });
      await wrapper.setProps({ existingUrl: "" });
      await nextTick();

      const input = wrapper.find("#link-url").element as HTMLInputElement;
      expect(input.value).toBe("");
    });
  });

  describe("cleanup", () => {
    it("removes document keydown listener on unmount", () => {
      const removeSpy = vi.spyOn(document, "removeEventListener");
      mountPopover();
      wrapper.unmount();

      const keydownCalls = removeSpy.mock.calls.filter((c) => c[0] === "keydown");
      expect(keydownCalls.length).toBeGreaterThan(0);
      removeSpy.mockRestore();
    });
  });
});
