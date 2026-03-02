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
    template: `<div class="danx-file-stub" :data-file-id="file.id">{{ file.name }}</div>`,
  })
);

const DanxIconStub = markRaw(
  defineComponent({
    props: ["icon"],
    template: "<span class='icon-stub' />",
  })
);

const DanxDialogStub = markRaw(
  defineComponent({
    props: ["modelValue", "width", "height"],
    emits: ["update:modelValue"],
    template: "<div class='danx-dialog-stub' v-if='modelValue'><slot /></div>",
  })
);

const DanxFileViewerStub = markRaw(
  defineComponent({
    props: ["file", "relatedFiles", "downloadable"],
    emits: ["download"],
    template: "<div class='danx-file-viewer-stub' :data-file-id='file.id' />",
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
          DanxDialog: DanxDialogStub,
          DanxFileViewer: DanxFileViewerStub,
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

    // Emit remove directly from the DanxFile stub
    const fileComp = wrapper.findComponent(DanxFileStub);
    fileComp.vm.$emit("remove", file);
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
          DanxDialog: DanxDialogStub,
          DanxFileViewer: DanxFileViewerStub,
        },
      },
    });

    expect(wrapper.find(".custom-empty").exists()).toBe(true);
    expect(wrapper.find(".custom-empty").text()).toBe("Drop files here");
  });

  describe("file viewer", () => {
    it("opens viewer dialog when a file thumbnail is clicked", async () => {
      const files = [makeFile("1"), makeFile("2")];
      const wrapper = createWrapper({}, files);

      // Click the first file stub — the native click bubbles to the @click handler
      await wrapper.findAll(".danx-file-stub")[0]!.trigger("click");
      await nextTick();

      const dialog = wrapper.findComponent(DanxDialogStub);
      expect(dialog.exists()).toBe(true);
      expect(dialog.props("modelValue")).toBe(true);

      const viewer = wrapper.findComponent(DanxFileViewerStub);
      expect(viewer.exists()).toBe(true);
      expect(viewer.props("file")).toEqual(files[0]);
      expect(viewer.props("relatedFiles")).toEqual(files);
    });

    it("does not open viewer when viewable is false", async () => {
      const files = [makeFile("1")];
      const wrapper = createWrapper({ viewable: false }, files);

      await wrapper.find(".danx-file-stub").trigger("click");
      await nextTick();

      expect(wrapper.find(".danx-dialog-stub").exists()).toBe(false);
    });

    it("does not open viewer for uploading files", async () => {
      const uploadingFile = makeFile("1", { progress: 50 });
      const wrapper = createWrapper({}, [uploadingFile]);

      await wrapper.find(".danx-file-stub").trigger("click");
      await nextTick();

      expect(wrapper.find(".danx-dialog-stub").exists()).toBe(false);
    });

    it("passes downloadable prop to DanxFileViewer", async () => {
      const files = [makeFile("1")];
      const wrapper = createWrapper({ downloadable: true }, files);

      await wrapper.find(".danx-file-stub").trigger("click");
      await nextTick();

      const viewer = wrapper.findComponent(DanxFileViewerStub);
      expect(viewer.props("downloadable")).toBe(true);
    });

    it("forwards download event from DanxFileViewer", async () => {
      const files = [makeFile("1")];
      const wrapper = createWrapper({ downloadable: true }, files);

      // Open the viewer
      await wrapper.find(".danx-file-stub").trigger("click");
      await nextTick();

      // Emit download from the viewer stub
      const downloadEvent = { file: files[0], url: files[0]!.url! };
      const viewer = wrapper.findComponent(DanxFileViewerStub);
      viewer.vm.$emit("download", downloadEvent);
      await nextTick();

      const emitted = wrapper.emitted("download");
      expect(emitted).toBeTruthy();
      expect(emitted![0]![0]).toEqual(downloadEvent);
    });

    it("adds cursor-pointer class when viewable and not uploading", () => {
      const files = [makeFile("1")];
      const wrapper = createWrapper({}, files);

      const danxFile = wrapper.findComponent(DanxFileStub);
      expect(danxFile.classes()).toContain("cursor-pointer");
    });

    it("does not add cursor-pointer class when viewable is false", () => {
      const files = [makeFile("1")];
      const wrapper = createWrapper({ viewable: false }, files);

      const danxFile = wrapper.findComponent(DanxFileStub);
      expect(danxFile.classes()).not.toContain("cursor-pointer");
    });

    it("does not add cursor-pointer class for uploading files", () => {
      const uploadingFile = makeFile("1", { progress: 50 });
      const wrapper = createWrapper({}, [uploadingFile]);

      const danxFile = wrapper.findComponent(DanxFileStub);
      expect(danxFile.classes()).not.toContain("cursor-pointer");
    });

    it("closes viewer dialog when DanxDialog emits update:modelValue false", async () => {
      const files = [makeFile("1")];
      const wrapper = createWrapper({}, files);

      // Open the viewer
      await wrapper.find(".danx-file-stub").trigger("click");
      await nextTick();

      const dialog = wrapper.findComponent(DanxDialogStub);
      expect(dialog.props("modelValue")).toBe(true);

      // Close via v-model
      dialog.vm.$emit("update:modelValue", false);
      await nextTick();

      // Dialog should be gone (modelValue is false)
      const dialogAfter = wrapper.findComponent(DanxDialogStub);
      expect(dialogAfter.props("modelValue")).toBe(false);
    });

    it("sets dialog dimensions to 95vw/95vh", async () => {
      const files = [makeFile("1")];
      const wrapper = createWrapper({}, files);

      await wrapper.find(".danx-file-stub").trigger("click");
      await nextTick();

      const dialog = wrapper.findComponent(DanxDialogStub);
      expect(dialog.props("width")).toBe(95);
      expect(dialog.props("height")).toBe(95);
    });
  });
});
