import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { markRaw, defineComponent, nextTick } from "vue";
import DanxFileUpload from "../DanxFileUpload.vue";
import type { PreviewFile } from "../../danx-file/types";
import { makeFile } from "../../danx-file/__tests__/test-helpers";

/** Stub components to avoid deep rendering */
const DanxFieldWrapperStub = markRaw(
  defineComponent({
    template: "<div class='field-wrapper'><slot /></div>",
  })
);

const DanxFileStub = markRaw(
  defineComponent({
    props: ["file", "size", "showFilename", "showFileSize", "removable", "disabled"],
    emits: ["remove"],
    template: `<div class="danx-file-stub" :data-file-id="file.id" @click="$emit('remove', file)">{{ file.name }}</div>`,
  })
);

const DanxIconStub = markRaw(
  defineComponent({
    props: ["icon"],
    template: "<span class='icon-stub' />",
  })
);

/** Hanging mock handler to prevent async resolution during sync tests */
function hangingHandler() {
  return vi.fn(
    (): Promise<PreviewFile> =>
      new Promise(() => {
        /* never resolves */
      })
  );
}

describe("DanxFileUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:mock"),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function createWrapper(props: Record<string, unknown> = {}, modelValue: PreviewFile[] = []) {
    return mount(DanxFileUpload, {
      props: {
        modelValue,
        uploadFn: hangingHandler(),
        ...props,
      },
      global: {
        stubs: {
          DanxFieldWrapper: DanxFieldWrapperStub,
          DanxFile: DanxFileStub,
          DanxIcon: DanxIconStub,
        },
      },
    });
  }

  it("renders DanxFile for each file in model", () => {
    const files = [makeFile("1"), makeFile("2")];
    const wrapper = createWrapper({ multiple: true }, files);

    const fileStubs = wrapper.findAll(".danx-file-stub");
    expect(fileStubs).toHaveLength(2);
  });

  it("shows add card when canAddMore is true", () => {
    const wrapper = createWrapper();
    expect(wrapper.find(".danx-file-upload__add-card").exists()).toBe(true);
  });

  it("hides add card when disabled", () => {
    const wrapper = createWrapper({ disabled: true });
    expect(wrapper.find(".danx-file-upload__add-card").exists()).toBe(false);
  });

  it("hides add card when readonly", () => {
    const wrapper = createWrapper({ readonly: true });
    expect(wrapper.find(".danx-file-upload__add-card").exists()).toBe(false);
  });

  it("hides add card in single mode when file exists", () => {
    const wrapper = createWrapper({}, [makeFile("1")]);
    expect(wrapper.find(".danx-file-upload__add-card").exists()).toBe(false);
  });

  it("applies file size class to add card", () => {
    const wrapper = createWrapper({ fileSize: "lg" });
    const addCard = wrapper.find(".danx-file-upload__add-card");
    expect(addCard.classes()).toContain("danx-file-upload__add-card--lg");
  });

  it("renders hidden file input with accept and multiple", () => {
    const wrapper = createWrapper({ accept: "image/*", multiple: true });
    const input = wrapper.find("input[type='file']");
    expect(input.exists()).toBe(true);
    expect(input.attributes("accept")).toBe("image/*");
    expect(input.attributes("multiple")).toBeDefined();
    expect(input.attributes("aria-hidden")).toBe("true");
  });

  it("passes size prop to DanxFile stubs", () => {
    const wrapper = createWrapper({ fileSize: "lg" }, [makeFile("1")]);
    const fileStub = wrapper.findComponent(DanxFileStub);
    expect(fileStub.props("size")).toBe("lg");
  });

  it("passes showFilename prop to DanxFile stubs", () => {
    const wrapper = createWrapper({ showFilename: true }, [makeFile("1")]);
    const fileStub = wrapper.findComponent(DanxFileStub);
    expect(fileStub.props("showFilename")).toBe(true);
  });

  it("passes showFileSize prop to DanxFile stubs", () => {
    const wrapper = createWrapper({ showFileSize: true }, [makeFile("1")]);
    const fileStub = wrapper.findComponent(DanxFileStub);
    expect(fileStub.props("showFileSize")).toBe(true);
  });

  it("renders DanxFieldWrapper with label and error", () => {
    const wrapper = createWrapper({ label: "My Label", error: "Bad file" });
    const fieldWrapper = wrapper.find(".field-wrapper");
    expect(fieldWrapper.exists()).toBe(true);
  });

  it("emits remove when DanxFile emits remove", async () => {
    const file = makeFile("1");
    const wrapper = createWrapper({}, [file]);

    // Click the DanxFile stub to trigger remove
    await wrapper.find(".danx-file-stub").trigger("click");
    await nextTick();

    const emitted = wrapper.emitted("remove");
    expect(emitted).toBeTruthy();
    expect(emitted![0]![0]).toEqual(file);
  });

  it("renders drop zone component", () => {
    const wrapper = createWrapper();
    expect(wrapper.find(".danx-file-upload-drop-zone").exists()).toBe(true);
  });

  it("calls addFiles when hidden input changes", async () => {
    const wrapper = createWrapper();
    const input = wrapper.find("input[type='file']");

    // Simulate input change with a file
    const file = new File(["data"], "test.jpg", { type: "image/jpeg" });
    const fileList = Object.assign([file], {
      item: (i: number) => [file][i] ?? null,
    }) as unknown as FileList;

    // Set files on the element and trigger change
    Object.defineProperty(input.element, "files", { value: fileList, writable: true });
    await input.trigger("change");

    // The model should have been updated with the temp file
    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
  });

  it("resets input value after change", async () => {
    const wrapper = createWrapper();
    const input = wrapper.find("input[type='file']");
    const inputEl = input.element as HTMLInputElement;

    const file = new File(["data"], "test.jpg", { type: "image/jpeg" });
    const fileList = Object.assign([file], {
      item: (i: number) => [file][i] ?? null,
    }) as unknown as FileList;

    Object.defineProperty(inputEl, "files", { value: fileList, writable: true });
    await input.trigger("change");

    expect(inputEl.value).toBe("");
  });

  it("does not call addFiles when input change has no files", async () => {
    const wrapper = createWrapper();
    const input = wrapper.find("input[type='file']");

    Object.defineProperty(input.element, "files", { value: null, writable: true });
    await input.trigger("change");

    expect(wrapper.emitted("update:modelValue")).toBeFalsy();
  });

  it("does not call addFiles when input change has empty FileList", async () => {
    const wrapper = createWrapper();
    const input = wrapper.find("input[type='file']");

    const emptyFileList = Object.assign([] as File[], {
      item: () => null,
      length: 0,
    }) as unknown as FileList;
    Object.defineProperty(input.element, "files", { value: emptyFileList, writable: true });
    await input.trigger("change");

    expect(wrapper.emitted("update:modelValue")).toBeFalsy();
  });

  it("handles drop zone drop event", async () => {
    const wrapper = createWrapper();

    const file = new File(["data"], "dropped.jpg", { type: "image/jpeg" });
    const fileList = Object.assign([file], {
      item: (i: number) => [file][i] ?? null,
    }) as unknown as FileList;

    // Find the drop zone and emit a drop event
    const dropZone = wrapper.findComponent({ name: "DanxFileUploadDropZone" });
    dropZone.vm.$emit("drop", fileList);
    await nextTick();

    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
  });

  it("opens file picker when add button is clicked", async () => {
    const wrapper = createWrapper();
    const input = wrapper.find("input[type='file']");
    const clickSpy = vi.spyOn(input.element as HTMLInputElement, "click");

    await wrapper.find(".danx-file-upload__add-card").trigger("click");

    expect(clickSpy).toHaveBeenCalled();
  });

  it("renders empty slot content when provided", () => {
    const wrapper = mount(DanxFileUpload, {
      props: {
        modelValue: [],
        uploadFn: hangingHandler(),
      },
      slots: {
        empty: "<div class='custom-empty'>Drop files here</div>",
      },
      global: {
        stubs: {
          DanxFieldWrapper: DanxFieldWrapperStub,
          DanxFile: DanxFileStub,
          DanxIcon: DanxIconStub,
        },
      },
    });

    expect(wrapper.find(".custom-empty").exists()).toBe(true);
    expect(wrapper.find(".custom-empty").text()).toBe("Drop files here");
  });
});
