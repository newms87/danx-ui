import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DanxCodeDiff from "../DanxCodeDiff.vue";

describe("DanxCodeDiff", () => {
  function mountDiff(props = {}) {
    return mount(DanxCodeDiff, {
      props: {
        oldValue: "line1\nline2\nline3",
        newValue: "line1\nchanged\nline3",
        ...props,
      },
    });
  }

  describe("rendering", () => {
    it("renders the diff container", () => {
      const wrapper = mountDiff();
      expect(wrapper.find(".dx-code-diff").exists()).toBe(true);
    });

    it("renders label when provided", () => {
      const wrapper = mountDiff({ label: "Config diff" });
      expect(wrapper.text()).toContain("Config diff");
    });

    it("does not render label when empty", () => {
      const wrapper = mountDiff({ label: "" });
      expect(wrapper.find(".mb-2.text-sm").exists()).toBe(false);
    });

    it("applies light theme class", () => {
      const wrapper = mountDiff({ theme: "light" });
      expect(wrapper.find(".dx-code-diff").classes()).toContain("theme-light");
    });

    it("does not apply light theme class by default", () => {
      const wrapper = mountDiff();
      expect(wrapper.find(".dx-code-diff").classes()).not.toContain("theme-light");
    });
  });

  describe("unified mode (default)", () => {
    it("renders one column with a single diff-content block", () => {
      const wrapper = mountDiff();
      expect(wrapper.findAll(".diff-content")).toHaveLength(1);
    });

    it("renders unchanged, removed, and added lines", () => {
      const wrapper = mountDiff();
      const lines = wrapper.findAll(".diff-line");
      const types = lines.map((line) => line.classes().find((c) => c.startsWith("diff-line--")));

      expect(types).toContain("diff-line--unchanged");
      expect(types).toContain("diff-line--removed");
      expect(types).toContain("diff-line--added");
    });

    it("prefixes added/removed/unchanged lines with +/-/space", () => {
      const wrapper = mountDiff();
      const prefixes = wrapper.findAll(".diff-line-prefix").map((p) => p.text());
      expect(prefixes).toContain("+");
      expect(prefixes).toContain("-");
    });

    it("renders no diff lines for two empty values", () => {
      const wrapper = mountDiff({ oldValue: "", newValue: "" });
      expect(wrapper.findAll(".diff-line")).toHaveLength(0);
    });

    it("renders only unchanged lines when values are identical", () => {
      const wrapper = mountDiff({ oldValue: "a\nb", newValue: "a\nb" });
      const lines = wrapper.findAll(".diff-line");
      expect(lines).toHaveLength(2);
      lines.forEach((line) => expect(line.classes()).toContain("diff-line--unchanged"));
    });
  });

  describe("split mode", () => {
    it("renders two columns", () => {
      const wrapper = mountDiff({ mode: "split" });
      expect(wrapper.find(".diff-split").exists()).toBe(true);
      expect(wrapper.findAll(".diff-content")).toHaveLength(2);
    });

    it("renders an empty placeholder row on the right when a line was removed", () => {
      const wrapper = mountDiff({ oldValue: "a\nb\nc", newValue: "a\nc", mode: "split" });
      const columns = wrapper.findAll(".diff-content");
      const rightLines = columns[1]!.findAll(".diff-line");
      expect(rightLines.some((line) => line.classes().includes("diff-line--empty"))).toBe(true);
    });

    it("renders an empty placeholder row on the left when a line was added", () => {
      const wrapper = mountDiff({ oldValue: "a\nc", newValue: "a\nb\nc", mode: "split" });
      const columns = wrapper.findAll(".diff-content");
      const leftLines = columns[0]!.findAll(".diff-line");
      expect(leftLines.some((line) => line.classes().includes("diff-line--empty"))).toBe(true);
    });
  });

  describe("syntax highlighting", () => {
    it("applies the language class based on the format prop", () => {
      const wrapper = mountDiff({ format: "json", oldValue: '{"a":1}', newValue: '{"a":2}' });
      expect(wrapper.find("code.language-json").exists()).toBe(true);
    });

    it("wraps highlighted tokens in syntax spans for json format", () => {
      const wrapper = mountDiff({ format: "json", oldValue: '{"a":1}', newValue: '{"a":2}' });
      expect(wrapper.html()).toContain("syntax-");
    });
  });
});
