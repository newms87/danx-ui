import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import MarkdownContent from "../MarkdownContent.vue";

describe("MarkdownContent", () => {
  function mountMarkdown(content: string, defaultCodeFormat?: "json" | "yaml") {
    return mount(MarkdownContent, {
      props: { content, defaultCodeFormat },
    });
  }

  describe("rendering", () => {
    it("renders container element", () => {
      const wrapper = mountMarkdown("Hello");
      expect(wrapper.find(".dx-markdown-content").exists()).toBe(true);
    });

    it("renders empty when content is empty string", () => {
      const wrapper = mountMarkdown("");
      const container = wrapper.find(".dx-markdown-content");
      expect(container.element.children).toHaveLength(0);
    });
  });

  describe("headings", () => {
    it("renders h1", () => {
      const wrapper = mountMarkdown("# Title");
      expect(wrapper.find("h1").exists()).toBe(true);
      expect(wrapper.find("h1").text()).toBe("Title");
    });

    it("renders h2", () => {
      const wrapper = mountMarkdown("## Subtitle");
      expect(wrapper.find("h2").exists()).toBe(true);
      expect(wrapper.find("h2").text()).toBe("Subtitle");
    });

    it("renders h3", () => {
      const wrapper = mountMarkdown("### Section");
      expect(wrapper.find("h3").exists()).toBe(true);
    });
  });

  describe("paragraphs", () => {
    it("renders paragraph", () => {
      const wrapper = mountMarkdown("Hello world");
      expect(wrapper.find("p").exists()).toBe(true);
      expect(wrapper.find("p").text()).toContain("Hello world");
    });

    it("converts newlines to br tags in paragraphs", () => {
      const wrapper = mountMarkdown("Line one\nLine two");
      const p = wrapper.find("p");
      expect(p.html()).toContain("<br>");
    });

    it("renders inline formatting in paragraphs", () => {
      const wrapper = mountMarkdown("**bold** text");
      const p = wrapper.find("p");
      expect(p.html()).toContain("<strong>");
    });
  });

  describe("code blocks", () => {
    it("renders code block as nested CodeViewer", () => {
      const markdown = '```json\n{"key": "value"}\n```';
      const wrapper = mountMarkdown(markdown);
      expect(wrapper.findComponent({ name: "CodeViewer" }).exists()).toBe(true);
    });

    it("passes normalized language to CodeViewer", () => {
      const markdown = "```js\nconsole.log('hi');\n```";
      const wrapper = mountMarkdown(markdown);
      const cv = wrapper.findComponent({ name: "CodeViewer" });
      expect(cv.props("format")).toBe("javascript");
    });

    it("passes defaultCodeFormat to nested CodeViewer", () => {
      const markdown = "```json\n{}\n```";
      const wrapper = mountMarkdown(markdown, "yaml");
      const cv = wrapper.findComponent({ name: "CodeViewer" });
      expect(cv.props("defaultCodeFormat")).toBe("yaml");
    });

    it("sets canEdit to false on nested CodeViewer", () => {
      const markdown = "```json\n{}\n```";
      const wrapper = mountMarkdown(markdown);
      const cv = wrapper.findComponent({ name: "CodeViewer" });
      expect(cv.props("canEdit")).toBe(false);
    });

    it("sets collapsible to false on nested CodeViewer", () => {
      const markdown = "```json\n{}\n```";
      const wrapper = mountMarkdown(markdown);
      const cv = wrapper.findComponent({ name: "CodeViewer" });
      expect(cv.props("collapsible")).toBe(false);
    });

    it("sets hideFooter on nested CodeViewer", () => {
      const markdown = "```json\n{}\n```";
      const wrapper = mountMarkdown(markdown);
      const cv = wrapper.findComponent({ name: "CodeViewer" });
      expect(cv.props("hideFooter")).toBe(true);
    });

    it("sets allowAnyLanguage on nested CodeViewer", () => {
      const markdown = "```json\n{}\n```";
      const wrapper = mountMarkdown(markdown);
      const cv = wrapper.findComponent({ name: "CodeViewer" });
      expect(cv.props("allowAnyLanguage")).toBe(true);
    });
  });

  describe("blockquotes", () => {
    it("renders blockquote", () => {
      const wrapper = mountMarkdown("> Quoted text");
      expect(wrapper.find("blockquote").exists()).toBe(true);
    });
  });

  describe("lists", () => {
    it("renders unordered list", () => {
      const wrapper = mountMarkdown("- Item 1\n- Item 2");
      expect(wrapper.find("ul").exists()).toBe(true);
      const items = wrapper.findAll("li");
      expect(items.length).toBeGreaterThanOrEqual(2);
    });

    it("renders ordered list", () => {
      const wrapper = mountMarkdown("1. First\n2. Second");
      expect(wrapper.find("ol").exists()).toBe(true);
    });

    it("renders ordered list with custom start", () => {
      const wrapper = mountMarkdown("3. Third\n4. Fourth");
      const ol = wrapper.find("ol");
      expect(ol.exists()).toBe(true);
    });

    it("renders nested unordered list", () => {
      const wrapper = mountMarkdown("- Parent\n  - Child");
      const uls = wrapper.findAll("ul");
      expect(uls.length).toBeGreaterThanOrEqual(1);
    });

    it("renders nested ordered list in unordered parent", () => {
      const wrapper = mountMarkdown("- Parent\n  1. Child");
      expect(wrapper.find("ul").exists()).toBe(true);
    });

    it("renders ordered list with nested unordered children", () => {
      const wrapper = mountMarkdown("1. Parent\n  - Child A\n  - Child B");
      const ol = wrapper.find("ol");
      expect(ol.exists()).toBe(true);
      const nestedUl = ol.find("ul");
      expect(nestedUl.exists()).toBe(true);
      const nestedItems = nestedUl.findAll("li");
      expect(nestedItems.length).toBe(2);
    });

    it("renders ordered list with nested ordered children", () => {
      const wrapper = mountMarkdown("1. Parent\n  1. Sub A\n  2. Sub B");
      const ol = wrapper.find("ol");
      expect(ol.exists()).toBe(true);
      const nestedOl = ol.find("ol");
      expect(nestedOl.exists()).toBe(true);
      const nestedItems = nestedOl.findAll("li");
      expect(nestedItems.length).toBe(2);
    });

    it("renders nested ordered list with custom start inside unordered parent", () => {
      const wrapper = mountMarkdown("- Parent\n  3. Sub A\n  4. Sub B");
      const ul = wrapper.find("ul");
      expect(ul.exists()).toBe(true);
      const nestedOl = ul.find("ol");
      expect(nestedOl.exists()).toBe(true);
      expect(nestedOl.attributes("start")).toBe("3");
    });

    it("renders deeply nested lists via renderListItem recursion", () => {
      const wrapper = mountMarkdown("- Level 1\n  - Level 2\n    - Level 3");
      const topUl = wrapper.find("ul");
      expect(topUl.exists()).toBe(true);
      const nestedUl = topUl.find("ul");
      expect(nestedUl.exists()).toBe(true);
      // Level 3 is rendered via renderListItem's recursive call
      const deepUl = nestedUl.find("ul");
      expect(deepUl.exists()).toBe(true);
      expect(deepUl.find("li").text()).toContain("Level 3");
    });

    it("renders deeply nested ordered list via renderListItem recursion", () => {
      const wrapper = mountMarkdown("- Level 1\n  1. Level 2\n    1. Level 3");
      const topUl = wrapper.find("ul");
      expect(topUl.exists()).toBe(true);
      const nestedOl = topUl.find("ol");
      expect(nestedOl.exists()).toBe(true);
      // Level 3 is rendered via renderListItem's ol branch
      const deepOl = nestedOl.find("ol");
      expect(deepOl.exists()).toBe(true);
      expect(deepOl.find("li").text()).toContain("Level 3");
    });

    it("renders renderListItem ol branch with custom start attribute", () => {
      const wrapper = mountMarkdown("- Level 1\n  5. Level 2\n    3. Level 3");
      const topUl = wrapper.find("ul");
      const nestedOl = topUl.find("ol");
      expect(nestedOl.exists()).toBe(true);
      // Level 3 rendered via renderListItem: ol with start !== 1
      const deepOl = nestedOl.find("ol");
      expect(deepOl.exists()).toBe(true);
      // The deep ol has start="3" attribute set by renderListItem
      expect(deepOl.attributes("start")).toBe("3");
    });

    it("renders task list", () => {
      const wrapper = mountMarkdown("- [ ] Todo\n- [x] Done");
      expect(wrapper.find(".task-list").exists()).toBe(true);
      const checkboxes = wrapper.findAll("input[type=checkbox]");
      expect(checkboxes).toHaveLength(2);
    });

    it("renders checked state of task items", () => {
      const wrapper = mountMarkdown("- [x] Done");
      const checkbox = wrapper.find<HTMLInputElement>("input[type=checkbox]");
      expect(checkbox.element.checked).toBe(true);
    });

    it("renders unchecked state of task items", () => {
      const wrapper = mountMarkdown("- [ ] Todo");
      const checkbox = wrapper.find<HTMLInputElement>("input[type=checkbox]");
      expect(checkbox.element.checked).toBe(false);
    });
  });

  describe("tables", () => {
    it("renders table with headers and rows", () => {
      const md = "| A | B |\n|---|---|\n| 1 | 2 |";
      const wrapper = mountMarkdown(md);
      expect(wrapper.find("table").exists()).toBe(true);
      expect(wrapper.find("thead").exists()).toBe(true);
      expect(wrapper.find("tbody").exists()).toBe(true);
    });

    it("renders aligned columns", () => {
      const md = "| Left | Center | Right |\n|:---|:---:|---:|\n| a | b | c |";
      const wrapper = mountMarkdown(md);
      const headers = wrapper.findAll("th");
      expect(headers.length).toBe(3);
    });
  });

  describe("horizontal rules", () => {
    it("renders horizontal rule", () => {
      const wrapper = mountMarkdown("---");
      expect(wrapper.find("hr").exists()).toBe(true);
    });
  });

  describe("definition lists", () => {
    it("renders definition list", () => {
      const wrapper = mountMarkdown("Term\n: Definition");
      expect(wrapper.find("dl").exists()).toBe(true);
      expect(wrapper.find("dt").exists()).toBe(true);
      expect(wrapper.find("dd").exists()).toBe(true);
    });
  });

  describe("footnotes", () => {
    it("renders footnotes section when footnotes exist", () => {
      const md = "Text with note[^1].\n\n[^1]: Footnote content";
      const wrapper = mountMarkdown(md);
      expect(wrapper.find(".footnotes").exists()).toBe(true);
    });

    it("does not render footnotes section when none exist", () => {
      const wrapper = mountMarkdown("Just text");
      expect(wrapper.find(".footnotes").exists()).toBe(false);
    });

    it("renders footnote backref links", () => {
      const md = "Text[^1].\n\n[^1]: Note";
      const wrapper = mountMarkdown(md);
      expect(wrapper.find(".footnote-backref").exists()).toBe(true);
    });

    it("sorts multiple footnotes by index order", () => {
      const md = "Text[^2] and more[^1].\n\n[^1]: First note\n[^2]: Second note";
      const wrapper = mountMarkdown(md);
      const footnoteItems = wrapper.findAll(".footnote-item");
      expect(footnoteItems.length).toBe(2);
      // Footnotes should be sorted by their index (order of definition),
      // so [^1] (index 1) appears before [^2] (index 2)
      expect(footnoteItems[0]!.text()).toContain("First note");
      expect(footnoteItems[1]!.text()).toContain("Second note");
    });
  });

  describe("defaults", () => {
    it("defaults content to empty string", () => {
      const wrapper = mount(MarkdownContent, { props: {} as { content: string } });
      expect(wrapper.find(".dx-markdown-content").exists()).toBe(true);
    });
  });
});
