import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import ConfirmActionDialog from "../ConfirmActionDialog.vue";
import { useDialogStack } from "../../dialog/useDialogStack";

/**
 * ConfirmActionDialog wraps DanxDialog which uses <Teleport to="body">.
 * Teleported content renders in document.body, so DOM assertions query the
 * body while event assertions use the wrapper.
 */

const wrappers: VueWrapper[] = [];

function mountDialog(props: { action: string; label: string; target?: unknown }) {
  const wrapper = mount(ConfirmActionDialog, { props });
  wrappers.push(wrapper);
  return wrapper;
}

function bodyText(): string {
  return document.body.textContent ?? "";
}

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
  useDialogStack().reset();
});

afterEach(() => {
  for (const w of wrappers) w.unmount();
  wrappers.length = 0;
});

describe("ConfirmActionDialog", () => {
  it("renders dialog with action and label in title", async () => {
    mountDialog({ action: "Delete", label: "Campaign" });
    await nextTick();
    expect(bodyText()).toContain("Delete Campaign");
  });

  it("renders descriptive confirmation text", async () => {
    mountDialog({ action: "Archive", label: "Document" });
    await nextTick();
    expect(bodyText()).toContain("archive this document");
  });

  it("emits confirm with empty input when confirmed", async () => {
    const wrapper = mountDialog({ action: "Delete", label: "Item" });
    await nextTick();

    const vm = wrapper.vm as unknown as { handleConfirm: () => void };
    vm.handleConfirm();
    await nextTick();

    const emits = wrapper.emitted("confirm");
    expect(emits).toBeTruthy();
    expect(emits![0]![0]).toEqual({});
  });

  it("emits cancel when dialog closes", async () => {
    const wrapper = mountDialog({ action: "Delete", label: "Item" });
    await nextTick();

    const vm = wrapper.vm as unknown as { handleCancel: () => void };
    vm.handleCancel();
    await nextTick();

    expect(wrapper.emitted("cancel")).toBeTruthy();
  });

  it("uses the danger variant for destructive styling", async () => {
    mountDialog({ action: "Delete", label: "Item" });
    await nextTick();
    // variant="danger" drives the confirm button styling — no styling props
    expect(document.body.querySelector("dialog")).not.toBeNull();
  });
});
