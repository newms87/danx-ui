import { describe, it, expect, vi } from "vitest";
import { useLinkPopover, useTablePopover } from "../usePopoverManager";

describe("usePopoverManager", () => {
  describe("useLinkPopover", () => {
    it("starts with isVisible false", () => {
      const popover = useLinkPopover();
      expect(popover.isVisible.value).toBe(false);
    });

    it("starts with default position", () => {
      const popover = useLinkPopover();
      expect(popover.position.value).toEqual({ x: 0, y: 0 });
    });

    it("starts with undefined existingUrl and selectedText", () => {
      const popover = useLinkPopover();
      expect(popover.existingUrl.value).toBeUndefined();
      expect(popover.selectedText.value).toBeUndefined();
    });

    it("show sets visibility, position, and link data", () => {
      const popover = useLinkPopover();
      const onSubmit = vi.fn();
      const onCancel = vi.fn();

      popover.show({
        position: { x: 100, y: 200 },
        existingUrl: "https://example.com",
        selectedText: "Example",
        onSubmit,
        onCancel,
      });

      expect(popover.isVisible.value).toBe(true);
      expect(popover.position.value).toEqual({ x: 100, y: 200 });
      expect(popover.existingUrl.value).toBe("https://example.com");
      expect(popover.selectedText.value).toBe("Example");
    });

    it("submit hides popover and calls onSubmit callback", () => {
      const popover = useLinkPopover();
      const onSubmit = vi.fn();
      const onCancel = vi.fn();

      popover.show({
        position: { x: 0, y: 0 },
        onSubmit,
        onCancel,
      });

      popover.submit("https://test.com", "Test Label");

      expect(popover.isVisible.value).toBe(false);
      expect(onSubmit).toHaveBeenCalledWith("https://test.com", "Test Label");
    });

    it("submit clears callbacks after use", () => {
      const popover = useLinkPopover();
      const onSubmit = vi.fn();
      const onCancel = vi.fn();

      popover.show({
        position: { x: 0, y: 0 },
        onSubmit,
        onCancel,
      });

      popover.submit("https://test.com");

      // Calling submit again should not call the original callback
      popover.submit("https://other.com");
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it("cancel hides popover and calls onCancel callback", () => {
      const popover = useLinkPopover();
      const onSubmit = vi.fn();
      const onCancel = vi.fn();

      popover.show({
        position: { x: 0, y: 0 },
        onSubmit,
        onCancel,
      });

      popover.cancel();

      expect(popover.isVisible.value).toBe(false);
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("cancel clears callbacks after use", () => {
      const popover = useLinkPopover();
      const onSubmit = vi.fn();
      const onCancel = vi.fn();

      popover.show({
        position: { x: 0, y: 0 },
        onSubmit,
        onCancel,
      });

      popover.cancel();

      // Calling cancel again should not call the original callback
      popover.cancel();
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("submit without prior show does not throw", () => {
      const popover = useLinkPopover();
      expect(() => popover.submit("https://test.com")).not.toThrow();
      expect(popover.isVisible.value).toBe(false);
    });

    it("cancel without prior show does not throw", () => {
      const popover = useLinkPopover();
      expect(() => popover.cancel()).not.toThrow();
      expect(popover.isVisible.value).toBe(false);
    });

    it("submit passes label as undefined when not provided", () => {
      const popover = useLinkPopover();
      const onSubmit = vi.fn();

      popover.show({
        position: { x: 0, y: 0 },
        onSubmit,
        onCancel: vi.fn(),
      });

      popover.submit("https://test.com");
      expect(onSubmit).toHaveBeenCalledWith("https://test.com", undefined);
    });
  });

  describe("useTablePopover", () => {
    it("starts with isVisible false", () => {
      const popover = useTablePopover();
      expect(popover.isVisible.value).toBe(false);
    });

    it("starts with default position", () => {
      const popover = useTablePopover();
      expect(popover.position.value).toEqual({ x: 0, y: 0 });
    });

    it("show sets visibility and position", () => {
      const popover = useTablePopover();
      const onSubmit = vi.fn();
      const onCancel = vi.fn();

      popover.show({
        position: { x: 150, y: 250 },
        onSubmit,
        onCancel,
      });

      expect(popover.isVisible.value).toBe(true);
      expect(popover.position.value).toEqual({ x: 150, y: 250 });
    });

    it("submit hides popover and calls onSubmit callback with dimensions", () => {
      const popover = useTablePopover();
      const onSubmit = vi.fn();
      const onCancel = vi.fn();

      popover.show({
        position: { x: 0, y: 0 },
        onSubmit,
        onCancel,
      });

      popover.submit(3, 4);

      expect(popover.isVisible.value).toBe(false);
      expect(onSubmit).toHaveBeenCalledWith(3, 4);
    });

    it("submit clears callbacks after use", () => {
      const popover = useTablePopover();
      const onSubmit = vi.fn();
      const onCancel = vi.fn();

      popover.show({
        position: { x: 0, y: 0 },
        onSubmit,
        onCancel,
      });

      popover.submit(2, 3);
      popover.submit(4, 5);
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it("cancel hides popover and calls onCancel callback", () => {
      const popover = useTablePopover();
      const onSubmit = vi.fn();
      const onCancel = vi.fn();

      popover.show({
        position: { x: 0, y: 0 },
        onSubmit,
        onCancel,
      });

      popover.cancel();

      expect(popover.isVisible.value).toBe(false);
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("cancel clears callbacks after use", () => {
      const popover = useTablePopover();
      const onSubmit = vi.fn();
      const onCancel = vi.fn();

      popover.show({
        position: { x: 0, y: 0 },
        onSubmit,
        onCancel,
      });

      popover.cancel();
      popover.cancel();
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("submit without prior show does not throw", () => {
      const popover = useTablePopover();
      expect(() => popover.submit(2, 2)).not.toThrow();
    });

    it("cancel without prior show does not throw", () => {
      const popover = useTablePopover();
      expect(() => popover.cancel()).not.toThrow();
    });
  });
});
