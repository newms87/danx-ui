import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { nextTick, markRaw, defineComponent } from "vue";
import DanxSplitPanel from "../DanxSplitPanel.vue";
import type { SplitPanelConfig } from "../types";

// jsdom doesn't implement pointer capture
HTMLElement.prototype.setPointerCapture = vi.fn();
HTMLElement.prototype.releasePointerCapture = vi.fn();

const TWO_PANELS: SplitPanelConfig[] = [
  { id: "sidebar", label: "Sidebar", defaultWidth: 30 },
  { id: "content", label: "Content", defaultWidth: 70 },
];

const THREE_PANELS: SplitPanelConfig[] = [
  { id: "nav", label: "Nav", defaultWidth: 1 },
  { id: "main", label: "Main", defaultWidth: 2 },
  { id: "aside", label: "Aside", defaultWidth: 1 },
];

const mountedWrappers: VueWrapper[] = [];

function mountSplitPanel(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  const wrapper = mount(DanxSplitPanel, {
    props: {
      panels: TWO_PANELS,
      ...props,
    },
    slots,
  });
  mountedWrappers.push(wrapper);
  return wrapper;
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  for (const w of mountedWrappers) w.unmount();
  mountedWrappers.length = 0;
});

describe("DanxSplitPanel", () => {
  describe("Rendering", () => {
    it("renders correct number of panel elements", () => {
      const wrapper = mountSplitPanel();
      const panels = wrapper.findAll(".danx-split-panel__panel");

      expect(panels).toHaveLength(2);
    });

    it("renders N-1 handles between panels", () => {
      const wrapper = mountSplitPanel({ panels: THREE_PANELS });
      const handles = wrapper.findAll(".danx-split-panel-handle");

      expect(handles).toHaveLength(2);
    });

    it("renders no handles with single active panel", () => {
      const wrapper = mountSplitPanel({
        modelValue: ["sidebar"],
      });
      const handles = wrapper.findAll(".danx-split-panel-handle");

      expect(handles).toHaveLength(0);
    });

    it("renders named slot content for each panel", () => {
      const wrapper = mountSplitPanel(
        {},
        {
          sidebar: "<p>Sidebar Content</p>",
          content: "<p>Main Content</p>",
        }
      );

      expect(wrapper.text()).toContain("Sidebar Content");
      expect(wrapper.text()).toContain("Main Content");
    });

    it("applies flex-basis matching computed widths", () => {
      const wrapper = mountSplitPanel();
      const panels = wrapper.findAll(".danx-split-panel__panel");

      expect(panels[0]!.attributes("style")).toContain("flex-basis: 30%");
      expect(panels[1]!.attributes("style")).toContain("flex-basis: 70%");
    });

    it("applies horizontal class when horizontal prop is true", () => {
      const wrapper = mountSplitPanel({ horizontal: true });
      const container = wrapper.find(".danx-split-panel");

      expect(container.classes()).toContain("danx-split-panel--horizontal");
    });

    it("does not apply horizontal class by default", () => {
      const wrapper = mountSplitPanel();
      const container = wrapper.find(".danx-split-panel");

      expect(container.classes()).not.toContain("danx-split-panel--horizontal");
    });
  });

  describe("v-model Binding", () => {
    it("defaults to all panels active when no modelValue provided", () => {
      const wrapper = mountSplitPanel();
      const panels = wrapper.findAll(".danx-split-panel__panel");

      expect(panels).toHaveLength(2);
    });

    it("only renders active panels from modelValue", () => {
      const wrapper = mountSplitPanel({
        modelValue: ["content"],
      });
      const panels = wrapper.findAll(".danx-split-panel__panel");

      expect(panels).toHaveLength(1);
    });

    it("emits update:modelValue when panels are toggled", async () => {
      const wrapper = mountSplitPanel({
        modelValue: ["sidebar", "content"],
      });

      // Access the togglePanel through the toggles slot
      // The component exposes toggle via the toggles slot
      // We need to get it from the composable's togglePanel
      // Since the component uses useSplitPanel internally,
      // we can test via the toggles slot
      const ParentComp = markRaw(
        defineComponent({
          components: { DanxSplitPanel },
          data() {
            return {
              panels: TWO_PANELS,
              active: ["sidebar", "content"],
            };
          },
          template: `
          <DanxSplitPanel v-model="active" :panels="panels">
            <template #toggles="{ toggle }">
              <button class="test-toggle" @click="toggle('sidebar')">Toggle Sidebar</button>
            </template>
            <template #sidebar>Sidebar</template>
            <template #content>Content</template>
          </DanxSplitPanel>
        `,
        })
      );

      // Unmount previous wrapper since we're mounting a new one
      wrapper.unmount();

      const parentWrapper = mount(ParentComp);
      mountedWrappers.push(parentWrapper);

      await parentWrapper.find(".test-toggle").trigger("click");
      await nextTick();

      expect(parentWrapper.vm.active).toEqual(["content"]);
    });
  });

  describe("Toggles Slot", () => {
    it("provides panels array to toggles slot", () => {
      const ParentComp = markRaw(
        defineComponent({
          components: { DanxSplitPanel },
          data() {
            return { panels: TWO_PANELS };
          },
          template: `
          <DanxSplitPanel :panels="panels">
            <template #toggles="{ panels: slotPanels }">
              <span class="panel-count">{{ slotPanels.length }}</span>
            </template>
          </DanxSplitPanel>
        `,
        })
      );
      const wrapper = mount(ParentComp);
      mountedWrappers.push(wrapper);

      expect(wrapper.find(".panel-count").text()).toBe("2");
    });

    it("provides isActive function to toggles slot", () => {
      const ParentComp = markRaw(
        defineComponent({
          components: { DanxSplitPanel },
          data() {
            return {
              panels: TWO_PANELS,
              active: ["sidebar"],
            };
          },
          template: `
          <DanxSplitPanel v-model="active" :panels="panels">
            <template #toggles="{ isActive }">
              <span class="sidebar-active">{{ isActive('sidebar') }}</span>
              <span class="content-active">{{ isActive('content') }}</span>
            </template>
          </DanxSplitPanel>
        `,
        })
      );
      const wrapper = mount(ParentComp);
      mountedWrappers.push(wrapper);

      expect(wrapper.find(".sidebar-active").text()).toBe("true");
      expect(wrapper.find(".content-active").text()).toBe("false");
    });

    it("provides toggle function to toggles slot", async () => {
      const ParentComp = markRaw(
        defineComponent({
          components: { DanxSplitPanel },
          data() {
            return {
              panels: TWO_PANELS,
              active: ["sidebar", "content"],
            };
          },
          template: `
          <DanxSplitPanel v-model="active" :panels="panels">
            <template #toggles="{ toggle }">
              <button class="toggle-btn" @click="toggle('sidebar')">Toggle</button>
            </template>
          </DanxSplitPanel>
        `,
        })
      );
      const wrapper = mount(ParentComp);
      mountedWrappers.push(wrapper);

      await wrapper.find(".toggle-btn").trigger("click");
      await nextTick();

      expect(wrapper.vm.active).toEqual(["content"]);
    });
  });

  describe("Three Panels", () => {
    it("renders three panels with correct widths", () => {
      const wrapper = mountSplitPanel({ panels: THREE_PANELS });
      const panels = wrapper.findAll(".danx-split-panel__panel");

      expect(panels).toHaveLength(3);
      // Weights 1:2:1 → 25%, 50%, 25%
      expect(panels[0]!.attributes("style")).toContain("flex-basis: 25%");
      expect(panels[1]!.attributes("style")).toContain("flex-basis: 50%");
      expect(panels[2]!.attributes("style")).toContain("flex-basis: 25%");
    });

    it("renders two handles between three panels", () => {
      const wrapper = mountSplitPanel({ panels: THREE_PANELS });
      const handles = wrapper.findAll(".danx-split-panel-handle");

      expect(handles).toHaveLength(2);
    });
  });

  describe("Handle Interaction", () => {
    it("handle pointerdown invokes startResize without error", async () => {
      const wrapper = mountSplitPanel();
      const handle = wrapper.find(".danx-split-panel-handle");

      // Trigger pointerdown — startResize is called but the container
      // ref is not attached to a sized element, so it exits early.
      // This verifies the event binding is wired correctly (no throw).
      await handle.trigger("pointerdown");

      // Widths remain unchanged since resize was a no-op
      const panels = wrapper.findAll(".danx-split-panel__panel");
      expect(panels[0]!.attributes("style")).toContain("flex-basis: 30%");
      expect(panels[1]!.attributes("style")).toContain("flex-basis: 70%");
    });
  });
});
