import { describe, it, expect } from "vitest";
import { useDialog } from "../useDialog";

describe("useDialog", () => {
  describe("initial state", () => {
    it("isOpen starts as false by default", () => {
      const { isOpen } = useDialog();
      expect(isOpen.value).toBe(false);
    });

    it("isOpen starts as true when initialOpen=true", () => {
      const { isOpen } = useDialog(true);
      expect(isOpen.value).toBe(true);
    });
  });

  describe("open()", () => {
    it("sets isOpen to true", () => {
      const { isOpen, open } = useDialog();
      expect(isOpen.value).toBe(false);

      open();

      expect(isOpen.value).toBe(true);
    });

    it("is idempotent when already open", () => {
      const { isOpen, open } = useDialog(true);
      expect(isOpen.value).toBe(true);

      open();

      expect(isOpen.value).toBe(true);
    });
  });

  describe("close()", () => {
    it("sets isOpen to false", () => {
      const { isOpen, close } = useDialog(true);
      expect(isOpen.value).toBe(true);

      close();

      expect(isOpen.value).toBe(false);
    });

    it("is idempotent when already closed", () => {
      const { isOpen, close } = useDialog();
      expect(isOpen.value).toBe(false);

      close();

      expect(isOpen.value).toBe(false);
    });
  });

  describe("toggle()", () => {
    it("flips isOpen from false to true", () => {
      const { isOpen, toggle } = useDialog();
      expect(isOpen.value).toBe(false);

      toggle();

      expect(isOpen.value).toBe(true);
    });

    it("flips isOpen from true to false", () => {
      const { isOpen, toggle } = useDialog(true);
      expect(isOpen.value).toBe(true);

      toggle();

      expect(isOpen.value).toBe(false);
    });

    it("can be called multiple times", () => {
      const { isOpen, toggle } = useDialog();

      toggle();
      expect(isOpen.value).toBe(true);

      toggle();
      expect(isOpen.value).toBe(false);

      toggle();
      expect(isOpen.value).toBe(true);
    });
  });

  describe("isOpen ref", () => {
    it("returns a ref that works with v-model", () => {
      const { isOpen } = useDialog();

      expect(typeof isOpen).toBe("object");
      expect("value" in isOpen).toBe(true);

      // isOpen can be mutated directly (for v-model compatibility)
      isOpen.value = true;
      expect(isOpen.value).toBe(true);

      isOpen.value = false;
      expect(isOpen.value).toBe(false);
    });
  });
});
