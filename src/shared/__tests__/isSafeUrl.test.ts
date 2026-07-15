import { describe, it, expect } from "vitest";
import { isSafeUrl, neutralizeUnsafeUrl } from "../isSafeUrl";

describe("isSafeUrl", () => {
  describe("safe schemes", () => {
    it("allows http URLs", () => {
      expect(isSafeUrl("http://example.com")).toBe(true);
    });

    it("allows https URLs", () => {
      expect(isSafeUrl("https://example.com")).toBe(true);
    });

    it("allows mailto URLs", () => {
      expect(isSafeUrl("mailto:user@example.com")).toBe(true);
    });

    it("allows tel URLs", () => {
      expect(isSafeUrl("tel:+1234567890")).toBe(true);
    });

    it("allows ftp URLs", () => {
      expect(isSafeUrl("ftp://ftp.example.com")).toBe(true);
    });

    it("allows ftps URLs", () => {
      expect(isSafeUrl("ftps://ftp.example.com")).toBe(true);
    });
  });

  describe("dangerous schemes", () => {
    it("blocks javascript: scheme", () => {
      expect(isSafeUrl("javascript:alert('XSS')")).toBe(false);
    });

    it("blocks javascript: with event handlers", () => {
      expect(isSafeUrl("javascript:void(0)")).toBe(false);
    });

    it("blocks javascript: with mixed case", () => {
      expect(isSafeUrl("JavaScript:alert('XSS')")).toBe(false);
      expect(isSafeUrl("jAvAsCrIpT:alert('XSS')")).toBe(false);
    });

    it("blocks data: scheme", () => {
      expect(isSafeUrl("data:text/html,<script>alert('XSS')</script>")).toBe(false);
    });

    it("blocks data: with base64", () => {
      expect(isSafeUrl("data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4=")).toBe(
        false
      );
    });

    it("blocks vbscript: scheme", () => {
      expect(isSafeUrl("vbscript:msgbox('XSS')")).toBe(false);
    });

    it("blocks vbscript: with mixed case", () => {
      expect(isSafeUrl("VBScript:msgbox('XSS')")).toBe(false);
    });
  });

  describe("relative URLs and fragments", () => {
    it("allows relative paths", () => {
      expect(isSafeUrl("/path/to/page")).toBe(true);
    });

    it("allows relative paths with query strings", () => {
      expect(isSafeUrl("/page?id=123&name=test")).toBe(true);
    });

    it("allows relative paths with current directory", () => {
      expect(isSafeUrl("./file.html")).toBe(true);
    });

    it("allows relative paths with parent directory", () => {
      expect(isSafeUrl("../parent/file.html")).toBe(true);
    });

    it("allows fragment URLs", () => {
      expect(isSafeUrl("#section")).toBe(true);
    });

    it("allows fragment URLs with underscore", () => {
      expect(isSafeUrl("#my_section")).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("rejects empty string", () => {
      expect(isSafeUrl("")).toBe(false);
    });

    it("rejects whitespace-only string", () => {
      expect(isSafeUrl("   ")).toBe(false);
    });

    it("rejects null", () => {
      // @ts-expect-error testing falsy input
      expect(isSafeUrl(null)).toBe(false);
    });

    it("rejects undefined", () => {
      // @ts-expect-error testing falsy input
      expect(isSafeUrl(undefined)).toBe(false);
    });

    it("handles URLs with whitespace", () => {
      expect(isSafeUrl("  https://example.com  ")).toBe(true);
    });

    it("allows URLs without scheme", () => {
      expect(isSafeUrl("example.com")).toBe(true);
    });

    it("allows URLs with port", () => {
      expect(isSafeUrl("http://localhost:3000")).toBe(true);
    });

    it("allows URLs with authentication", () => {
      expect(isSafeUrl("https://user:pass@example.com")).toBe(true);
    });

    it("rejects unknown schemes", () => {
      expect(isSafeUrl("custom:value")).toBe(false);
    });
  });
});

describe("neutralizeUnsafeUrl", () => {
  it("keeps safe URLs", () => {
    expect(neutralizeUnsafeUrl("https://example.com")).toBe("https://example.com");
  });

  it("returns empty string for unsafe URLs", () => {
    expect(neutralizeUnsafeUrl("javascript:alert('XSS')")).toBe("");
  });

  it("returns empty string for data URLs", () => {
    expect(neutralizeUnsafeUrl("data:text/html,<script>alert('XSS')</script>")).toBe("");
  });
});
