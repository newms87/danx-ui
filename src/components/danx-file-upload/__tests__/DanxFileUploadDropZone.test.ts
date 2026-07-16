import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DanxFileUploadDropZone from "../DanxFileUploadDropZone.vue";

describe("DanxFileUploadDropZone", () => {
  function createWrapper(props: { isDragging?: boolean; disabled?: boolean } = {}) {
    return mount(DanxFileUploadDropZone, {
      props: {
        isDragging: false,
        disabled: false,
        ...props,
      },
      slots: {
        default: "<div class='child'>Content</div>",
      },
    });
  }

  it("renders slot content", () => {
    const wrapper = createWrapper();
    expect(wrapper.find(".child").exists()).toBe(true);
  });

  it("applies active class when isDragging and not disabled", () => {
    const wrapper = createWrapper({ isDragging: true });
    expect(wrapper.classes()).toContain("danx-file-upload-drop-zone--active");
  });

  it("does not apply active class when isDragging but disabled", () => {
    const wrapper = createWrapper({ isDragging: true, disabled: true });
    expect(wrapper.classes()).not.toContain("danx-file-upload-drop-zone--active");
  });

  it("applies disabled class when disabled", () => {
    const wrapper = createWrapper({ disabled: true });
    expect(wrapper.classes()).toContain("danx-file-upload-drop-zone--disabled");
  });

  it("emits dragEnter on dragenter event", async () => {
    const wrapper = createWrapper();
    await wrapper.trigger("dragenter", {
      dataTransfer: { types: ["Files"] },
    });
    expect(wrapper.emitted("dragEnter")).toHaveLength(1);
  });

  it("emits dragLeave on dragleave event", async () => {
    const wrapper = createWrapper();
    await wrapper.trigger("dragleave");
    expect(wrapper.emitted("dragLeave")).toHaveLength(1);
  });

  it("emits drop with files on drop event", async () => {
    const wrapper = createWrapper();
    const file = new File(["data"], "test.jpg", { type: "image/jpeg" });
    const fileList = Object.assign([file], {
      item: (i: number) => [file][i] ?? null,
    }) as unknown as FileList;

    await wrapper.trigger("drop", {
      dataTransfer: { files: fileList },
    });

    const emitted = wrapper.emitted("drop");
    expect(emitted).toHaveLength(1);
    expect(emitted![0]![0]).toBe(fileList);
  });

  it("does not emit drop when no files in dataTransfer", async () => {
    const wrapper = createWrapper();
    const emptyFileList = Object.assign([] as File[], {
      item: () => null,
      length: 0,
    }) as unknown as FileList;

    await wrapper.trigger("drop", {
      dataTransfer: { files: emptyFileList },
    });

    expect(wrapper.emitted("drop")).toBeUndefined();
  });

  it("has base class on root element", () => {
    const wrapper = createWrapper();
    expect(wrapper.classes()).toContain("danx-file-upload-drop-zone");
  });

  it("prevents default on dragover", async () => {
    const wrapper = createWrapper();
    const event = new Event("dragover", { cancelable: true, bubbles: true });
    wrapper.element.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it("does not emit dragEnter when dragenter has no dataTransfer", async () => {
    const wrapper = createWrapper();
    await wrapper.trigger("dragenter");
    expect(wrapper.emitted("dragEnter")).toBeUndefined();
  });

  it("does not emit dragEnter on dragenter event when disabled", async () => {
    const wrapper = createWrapper({ disabled: true });
    await wrapper.trigger("dragenter", {
      dataTransfer: { types: ["Files"] },
    });
    expect(wrapper.emitted("dragEnter")).toBeUndefined();
  });

  it("does not emit drop when disabled", async () => {
    const wrapper = createWrapper({ disabled: true });
    const file = new File(["data"], "test.jpg", { type: "image/jpeg" });
    const fileList = Object.assign([file], {
      item: (i: number) => [file][i] ?? null,
    }) as unknown as FileList;

    await wrapper.trigger("drop", {
      dataTransfer: { files: fileList },
    });

    expect(wrapper.emitted("drop")).toBeUndefined();
  });

  it("is focusable so it can receive paste events", () => {
    const wrapper = createWrapper();
    expect(wrapper.attributes("tabindex")).toBe("0");
  });

  it("emits paste with files on paste event", async () => {
    const wrapper = createWrapper();
    const file = new File(["data"], "test.jpg", { type: "image/jpeg" });
    const fileList = Object.assign([file], {
      item: (i: number) => [file][i] ?? null,
    }) as unknown as FileList;

    await wrapper.trigger("paste", {
      clipboardData: { files: fileList },
    });

    const emitted = wrapper.emitted("paste");
    expect(emitted).toHaveLength(1);
    expect(emitted![0]![0]).toBe(fileList);
  });

  it("does not emit paste when no files in clipboardData (e.g. pasted text)", async () => {
    const wrapper = createWrapper();
    const emptyFileList = Object.assign([] as File[], {
      item: () => null,
      length: 0,
    }) as unknown as FileList;

    await wrapper.trigger("paste", {
      clipboardData: { files: emptyFileList },
    });

    expect(wrapper.emitted("paste")).toBeUndefined();
  });

  it("does not emit paste when disabled", async () => {
    const wrapper = createWrapper({ disabled: true });
    const file = new File(["data"], "test.jpg", { type: "image/jpeg" });
    const fileList = Object.assign([file], {
      item: (i: number) => [file][i] ?? null,
    }) as unknown as FileList;

    await wrapper.trigger("paste", {
      clipboardData: { files: fileList },
    });

    expect(wrapper.emitted("paste")).toBeUndefined();
  });
});
