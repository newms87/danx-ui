import { describe, it, expect } from "vitest";
import { escapeHtml } from "../escapeHtml";

describe("escapeHtml", () => {
  describe("individual character escaping", () => {
    it("escapes ampersand to &amp;", () => {
      expect(escapeHtml("&")).toBe("&amp;");
    });

    it("escapes less-than to &lt;", () => {
      expect(escapeHtml("<")).toBe("&lt;");
    });

    it("escapes greater-than to &gt;", () => {
      expect(escapeHtml(">")).toBe("&gt;");
    });

    it("escapes double quotes to &quot;", () => {
      expect(escapeHtml('"')).toBe("&quot;");
    });

    it("escapes single quotes to &#039;", () => {
      expect(escapeHtml("'")).toBe("&#039;");
    });
  });

  describe("multiple special characters", () => {
    it("escapes all special characters in a single string", () => {
      expect(escapeHtml(`<div class="test" data-val='5' & more>`)).toBe(
        "&lt;div class=&quot;test&quot; data-val=&#039;5&#039; &amp; more&gt;"
      );
    });

    it("escapes repeated special characters", () => {
      expect(escapeHtml("<<>>&&")).toBe("&lt;&lt;&gt;&gt;&amp;&amp;");
    });

    it("escapes mixed content with text and special chars", () => {
      expect(escapeHtml('Hello <world> & "everyone"')).toBe(
        "Hello &lt;world&gt; &amp; &quot;everyone&quot;"
      );
    });
  });

  describe("passthrough cases", () => {
    it("leaves normal text unchanged", () => {
      expect(escapeHtml("Hello world")).toBe("Hello world");
    });

    it("leaves numbers unchanged", () => {
      expect(escapeHtml("12345")).toBe("12345");
    });

    it("leaves whitespace unchanged", () => {
      expect(escapeHtml("  \t\n  ")).toBe("  \t\n  ");
    });
  });

  describe("edge cases", () => {
    it("handles empty string", () => {
      expect(escapeHtml("")).toBe("");
    });

    it("handles string with only special characters", () => {
      expect(escapeHtml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&#039;");
    });

    it("double-escapes already-escaped text", () => {
      expect(escapeHtml("&amp;")).toBe("&amp;amp;");
      expect(escapeHtml("&lt;")).toBe("&amp;lt;");
      expect(escapeHtml("&gt;")).toBe("&amp;gt;");
      expect(escapeHtml("&quot;")).toBe("&amp;quot;");
      expect(escapeHtml("&#039;")).toBe("&amp;#039;");
    });

    it("handles a realistic HTML snippet", () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
      );
    });

    it("handles string with special chars surrounded by normal text", () => {
      expect(escapeHtml("a&b<c>d\"e'f")).toBe("a&amp;b&lt;c&gt;d&quot;e&#039;f");
    });
  });
});
