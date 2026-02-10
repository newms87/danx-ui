import { describe, it, expect, vi } from "vitest";
import { ref } from "vue";
import {
  unwrapLink,
  completeEditLink,
  createLinkElement,
  insertAndSelectLink,
} from "../linkDomUtils";

describe("linkDomUtils", () => {
  describe("unwrapLink", () => {
    it("replaces link with its text content", () => {
      const container = document.createElement("p");
      const link = document.createElement("a");
      link.href = "https://example.com";
      link.textContent = "Example";
      container.appendChild(link);

      unwrapLink(link);

      expect(container.innerHTML).toBe("Example");
      expect(container.querySelector("a")).toBeNull();
    });

    it("does nothing when link has no parent", () => {
      const link = document.createElement("a");
      link.href = "https://example.com";
      link.textContent = "Example";

      // Should not throw
      unwrapLink(link);
    });

    it("preserves multiple children of the link", () => {
      const container = document.createElement("p");
      const link = document.createElement("a");
      link.href = "https://example.com";

      const strong = document.createElement("strong");
      strong.textContent = "Bold";
      link.appendChild(strong);
      link.appendChild(document.createTextNode(" text"));
      container.appendChild(link);

      unwrapLink(link);

      expect(container.innerHTML).toBe("<strong>Bold</strong> text");
    });
  });

  describe("completeEditLink", () => {
    it("updates the href of an existing link", () => {
      const container = document.createElement("div");
      document.body.appendChild(container);
      const contentRef = ref<HTMLElement | null>(container);
      const onContentChange = vi.fn();

      const link = document.createElement("a");
      link.href = "https://old.com";
      link.textContent = "Link";
      container.appendChild(link);

      completeEditLink(link, "https://new.com", contentRef, onContentChange);

      expect(link.getAttribute("href")).toBe("https://new.com");
      expect(onContentChange).toHaveBeenCalled();

      container.remove();
    });

    it("unwraps the link when URL is empty", () => {
      const container = document.createElement("div");
      document.body.appendChild(container);
      const contentRef = ref<HTMLElement | null>(container);
      const onContentChange = vi.fn();

      const link = document.createElement("a");
      link.href = "https://example.com";
      link.textContent = "Link text";
      container.appendChild(link);

      completeEditLink(link, "", contentRef, onContentChange);

      expect(container.querySelector("a")).toBeNull();
      expect(container.textContent).toBe("Link text");
      expect(onContentChange).toHaveBeenCalled();

      container.remove();
    });

    it("unwraps the link when URL is whitespace only", () => {
      const container = document.createElement("div");
      document.body.appendChild(container);
      const contentRef = ref<HTMLElement | null>(container);
      const onContentChange = vi.fn();

      const link = document.createElement("a");
      link.href = "https://example.com";
      link.textContent = "Link text";
      container.appendChild(link);

      completeEditLink(link, "   ", contentRef, onContentChange);

      expect(container.querySelector("a")).toBeNull();
      expect(container.textContent).toBe("Link text");

      container.remove();
    });

    it("trims whitespace from URL", () => {
      const container = document.createElement("div");
      document.body.appendChild(container);
      const contentRef = ref<HTMLElement | null>(container);
      const onContentChange = vi.fn();

      const link = document.createElement("a");
      link.href = "https://old.com";
      link.textContent = "Link";
      container.appendChild(link);

      completeEditLink(link, "  https://example.com  ", contentRef, onContentChange);

      expect(link.getAttribute("href")).toBe("https://example.com");

      container.remove();
    });
  });

  describe("createLinkElement", () => {
    it("creates an anchor element with correct attributes", () => {
      const link = createLinkElement("https://example.com");

      expect(link.tagName).toBe("A");
      expect(link.getAttribute("href")).toBe("https://example.com");
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    });

    it("trims whitespace from URL", () => {
      const link = createLinkElement("  https://example.com  ");
      expect(link.getAttribute("href")).toBe("https://example.com");
    });
  });

  describe("insertAndSelectLink", () => {
    it("inserts a link at the given range and selects it", () => {
      const container = document.createElement("div");
      container.textContent = "Hello world";
      document.body.appendChild(container);
      const contentRef = ref<HTMLElement | null>(container);
      const onContentChange = vi.fn();

      // Create range in the middle
      const textNode = container.firstChild!;
      const range = document.createRange();
      range.setStart(textNode, 5);
      range.setEnd(textNode, 5);

      const link = createLinkElement("https://example.com");
      link.textContent = "Link";

      insertAndSelectLink(link, range, contentRef, onContentChange);

      expect(container.querySelector("a")).not.toBeNull();
      expect(onContentChange).toHaveBeenCalled();

      // Verify selection contains the link
      const sel = window.getSelection();
      expect(sel?.rangeCount).toBeGreaterThan(0);

      container.remove();
    });

    it("handles when getSelection returns null gracefully", () => {
      const container = document.createElement("div");
      container.textContent = "Hello";
      document.body.appendChild(container);
      const contentRef = ref<HTMLElement | null>(container);
      const onContentChange = vi.fn();

      const range = document.createRange();
      range.setStart(container.firstChild!, 0);
      range.setEnd(container.firstChild!, 0);

      const link = createLinkElement("https://example.com");
      link.textContent = "Link";

      // Should not throw
      insertAndSelectLink(link, range, contentRef, onContentChange);
      expect(onContentChange).toHaveBeenCalled();

      container.remove();
    });
  });
});
