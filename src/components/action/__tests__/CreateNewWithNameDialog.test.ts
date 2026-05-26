import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import CreateNewWithNameDialog from "../CreateNewWithNameDialog.vue";
import { DanxInput } from "../../input";
import { useDialogStack } from "../../dialog/useDialogStack";

/**
 * CreateNewWithNameDialog wraps DanxDialog which uses <Teleport to="body">.
 * Teleported content renders in document.body, so DOM assertions query the
 * body while event assertions use the wrapper.
 */

const wrappers: VueWrapper[] = [];

function mountDialog(props: { title: string }) {
  const wrapper = mount(CreateNewWithNameDialog, { props });
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

describe("CreateNewWithNameDialog", () => {
  it("renders dialog with the provided title", async () => {
    mountDialog({ title: "Create Campaign" });
    await nextTick();
    expect(bodyText()).toContain("Create Campaign");
  });

  it("renders name input with label", async () => {
    mountDialog({ title: "Create Item" });
    await nextTick();
    expect(bodyText()).toContain("Name");
  });

  it("emits confirm with trimmed name (driven through the input v-model)", async () => {
    const wrapper = mountDialog({ title: "Create Widget" });
    await nextTick();

    // Drive the name via the DanxInput's update:modelValue so the v-model
    // write-back path executes (not just a direct vm.name assignment).
    const input = wrapper.findComponent(DanxInput);
    input.vm.$emit("update:modelValue", "  My Widget  ");
    await nextTick();

    const vm = wrapper.vm as unknown as { handleConfirm: () => void };
    vm.handleConfirm();
    await nextTick();

    const emits = wrapper.emitted("confirm");
    expect(emits).toBeTruthy();
    expect(emits![0]![0]).toEqual({ name: "My Widget" });
  });

  it("does not emit confirm when name is empty", async () => {
    const wrapper = mountDialog({ title: "Create Widget" });
    await nextTick();

    const vm = wrapper.vm as unknown as { name: string; handleConfirm: () => void };
    vm.name = "  ";
    await nextTick();
    vm.handleConfirm();
    await nextTick();

    expect(wrapper.emitted("confirm")).toBeFalsy();
  });

  it("emits cancel when dialog closes", async () => {
    const wrapper = mountDialog({ title: "Create Something" });
    await nextTick();

    const vm = wrapper.vm as unknown as { handleCancel: () => void };
    vm.handleCancel();
    await nextTick();

    expect(wrapper.emitted("cancel")).toBeTruthy();
  });
});
