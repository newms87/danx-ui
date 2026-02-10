import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import CodeViewerCollapsed from "../CodeViewerCollapsed.vue";

describe("CodeViewerCollapsed", () => {
  const defaultProps = {
    preview: "<span>some preview</span>",
    format: "json",
  };

  it("renders the collapsed container", () => {
    const wrapper = mount(CodeViewerCollapsed, { props: defaultProps });
    expect(wrapper.find(".code-collapsed").exists()).toBe(true);
  });

  it("renders the expand icon", () => {
    const wrapper = mount(CodeViewerCollapsed, { props: defaultProps });
    const icon = wrapper.find(".code-collapsed svg");
    expect(icon.exists()).toBe(true);
  });

  it("renders preview content via v-html", () => {
    const wrapper = mount(CodeViewerCollapsed, { props: defaultProps });
    const preview = wrapper.find(".code-collapsed-preview");
    expect(preview.html()).toContain("some preview");
  });

  it("emits expand when container is clicked", async () => {
    const wrapper = mount(CodeViewerCollapsed, { props: defaultProps });
    await wrapper.find(".code-collapsed").trigger("click");
    expect(wrapper.emitted("expand")).toHaveLength(1);
  });

  it("renders LanguageBadge with correct format", () => {
    const wrapper = mount(CodeViewerCollapsed, { props: defaultProps });
    expect(wrapper.text()).toContain("JSON");
  });

  it("emits format-change when language badge emits change", async () => {
    const wrapper = mount(CodeViewerCollapsed, {
      props: {
        ...defaultProps,
        availableFormats: ["json", "yaml"],
        allowAnyLanguage: false,
      },
    });
    const badge = wrapper.findComponent({ name: "LanguageBadge" });
    await badge.vm.$emit("change", "yaml");
    expect(wrapper.emitted("format-change")).toEqual([["yaml"]]);
  });

  it("click.stop on LanguageBadge prevents expand event from firing", async () => {
    const wrapper = mount(CodeViewerCollapsed, {
      props: {
        ...defaultProps,
        availableFormats: ["json", "yaml"],
        allowAnyLanguage: false,
      },
    });
    // Click on the LanguageBadge container - the @click.stop should prevent
    // the expand event from being emitted on the parent
    const badge = wrapper.findComponent({ name: "LanguageBadge" });
    await badge.trigger("click");

    // The expand event should NOT have fired because click.stop is on the badge
    expect(wrapper.emitted("expand")).toBeUndefined();
  });

  it("passes availableFormats to LanguageBadge", () => {
    const wrapper = mount(CodeViewerCollapsed, {
      props: {
        ...defaultProps,
        availableFormats: ["json", "yaml"],
      },
    });
    const badge = wrapper.findComponent({ name: "LanguageBadge" });
    expect(badge.props("availableFormats")).toEqual(["json", "yaml"]);
  });

  it("passes allowAnyLanguage to LanguageBadge", () => {
    const wrapper = mount(CodeViewerCollapsed, {
      props: {
        ...defaultProps,
        allowAnyLanguage: true,
      },
    });
    const badge = wrapper.findComponent({ name: "LanguageBadge" });
    expect(badge.props("allowAnyLanguage")).toBe(true);
  });

  it("defaults availableFormats to empty array", () => {
    const wrapper = mount(CodeViewerCollapsed, { props: defaultProps });
    const badge = wrapper.findComponent({ name: "LanguageBadge" });
    expect(badge.props("availableFormats")).toEqual([]);
  });

  it("defaults allowAnyLanguage to false", () => {
    const wrapper = mount(CodeViewerCollapsed, { props: defaultProps });
    const badge = wrapper.findComponent({ name: "LanguageBadge" });
    expect(badge.props("allowAnyLanguage")).toBe(false);
  });

  it("toggleable is false when availableFormats is empty", () => {
    const wrapper = mount(CodeViewerCollapsed, { props: defaultProps });
    const badge = wrapper.findComponent({ name: "LanguageBadge" });
    expect(badge.props("toggleable")).toBe(false);
  });

  it("toggleable is false when availableFormats has one item", () => {
    const wrapper = mount(CodeViewerCollapsed, {
      props: { ...defaultProps, availableFormats: ["json"] },
    });
    const badge = wrapper.findComponent({ name: "LanguageBadge" });
    expect(badge.props("toggleable")).toBe(false);
  });

  it("toggleable is true when availableFormats has multiple items", () => {
    const wrapper = mount(CodeViewerCollapsed, {
      props: { ...defaultProps, availableFormats: ["json", "yaml"] },
    });
    const badge = wrapper.findComponent({ name: "LanguageBadge" });
    expect(badge.props("toggleable")).toBe(true);
  });
});
