import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import DanxKbd from "../DanxKbd.vue";
import { detectOs, resolveKeyLabel } from "../kbdKeyLabels";

describe("DanxKbd", () => {
  describe("Rendering", () => {
    it("renders a single key as a kbd element", () => {
      const wrapper = mount(DanxKbd, { props: { keys: ["esc"], os: "other" } });

      const keys = wrapper.findAll("kbd");
      expect(keys).toHaveLength(1);
      expect(keys[0]!.text()).toBe("ESC");
    });

    it("renders a multi-key combo with separators", () => {
      const wrapper = mount(DanxKbd, { props: { keys: ["ctrl", "shift", "p"], os: "other" } });

      const keys = wrapper.findAll("kbd");
      expect(keys).toHaveLength(3);
      expect(keys[0]!.text()).toBe("Ctrl");
      expect(keys[1]!.text()).toBe("Shift");
      expect(keys[2]!.text()).toBe("P");

      const separators = wrapper.findAll(".danx-kbd__separator");
      expect(separators).toHaveLength(2);
      expect(separators[0]!.text()).toBe("+");
    });

    it("supports a custom separator", () => {
      const wrapper = mount(DanxKbd, {
        props: { keys: ["ctrl", "k"], os: "other", separator: "then" },
      });

      expect(wrapper.find(".danx-kbd__separator").text()).toBe("then");
    });

    it("uppercases unrecognized key names", () => {
      const wrapper = mount(DanxKbd, { props: { keys: ["k"], os: "other" } });

      expect(wrapper.find("kbd").text()).toBe("K");
    });
  });

  describe("OS-aware rendering", () => {
    it("renders Mac symbols when os='mac'", () => {
      const wrapper = mount(DanxKbd, {
        props: { keys: ["ctrl", "alt", "shift", "meta", "cmd", "command", "option"], os: "mac" },
      });

      const labels = wrapper.findAll("kbd").map((k) => k.text());
      expect(labels).toEqual(["^", "⌥", "⇧", "⌘", "⌘", "⌘", "⌥"]);
    });

    it("renders word labels when os='other'", () => {
      const wrapper = mount(DanxKbd, {
        props: {
          keys: ["ctrl", "alt", "shift", "meta", "cmd", "command", "option"],
          os: "other",
        },
      });

      const labels = wrapper.findAll("kbd").map((k) => k.text());
      expect(labels).toEqual(["Ctrl", "Alt", "Shift", "Win", "Win", "Win", "Alt"]);
    });

    it("is case-insensitive when resolving modifier names", () => {
      const wrapper = mount(DanxKbd, { props: { keys: ["CTRL", "Shift"], os: "mac" } });

      const labels = wrapper.findAll("kbd").map((k) => k.text());
      expect(labels).toEqual(["^", "⇧"]);
    });
  });

  describe("OS auto-detection", () => {
    let originalPlatform: PropertyDescriptor | undefined;
    let originalUserAgent: PropertyDescriptor | undefined;

    beforeEach(() => {
      originalPlatform = Object.getOwnPropertyDescriptor(navigator, "platform");
      originalUserAgent = Object.getOwnPropertyDescriptor(navigator, "userAgent");
    });

    afterEach(() => {
      if (originalPlatform) {
        Object.defineProperty(navigator, "platform", originalPlatform);
      }
      if (originalUserAgent) {
        Object.defineProperty(navigator, "userAgent", originalUserAgent);
      }
    });

    function setPlatform(value: string) {
      Object.defineProperty(navigator, "platform", { value, configurable: true });
    }

    function setUserAgent(value: string) {
      Object.defineProperty(navigator, "userAgent", { value, configurable: true });
    }

    it("detects mac from navigator.platform", () => {
      setPlatform("MacIntel");
      setUserAgent("");

      expect(detectOs()).toBe("mac");
    });

    it("detects mac from navigator.userAgent when platform is not mac-like", () => {
      setPlatform("");
      setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)");

      expect(detectOs()).toBe("mac");
    });

    it("falls back to 'other' when neither platform nor userAgent indicate mac", () => {
      setPlatform("Win32");
      setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");

      expect(detectOs()).toBe("other");
    });

    it("uses auto-detection when no os prop is provided", () => {
      setPlatform("MacIntel");
      setUserAgent("");

      const wrapper = mount(DanxKbd, { props: { keys: ["meta", "s"] } });

      expect(wrapper.find("kbd").text()).toBe("⌘");
    });

    it("prefers the explicit os prop over auto-detection", () => {
      setPlatform("MacIntel");
      setUserAgent("");

      const wrapper = mount(DanxKbd, { props: { keys: ["meta"], os: "other" } });

      expect(wrapper.find("kbd").text()).toBe("Win");
    });
  });

  describe("resolveKeyLabel", () => {
    it("returns the raw uppercased key when no mapping exists", () => {
      expect(resolveKeyLabel("enter", "mac")).toBe("ENTER");
      expect(resolveKeyLabel("enter", "other")).toBe("ENTER");
    });
  });
});
