import { describe, it, expect, vi, beforeEach } from "vitest";
import { useDragDrop } from "../useDragDrop";

/** Create a FileList-like array from File objects */
function toFileList(files: File[]): FileList {
  return Object.assign(files, {
    item: (i: number) => files[i] ?? null,
  }) as unknown as FileList;
}

function createFile(name = "test.jpg", type = "image/jpeg", size = 1024): File {
  return new File([new Uint8Array(size)], name, { type });
}

describe("useDragDrop", () => {
  let onDrop: (files: FileList) => void;

  beforeEach(() => {
    vi.clearAllMocks();
    onDrop = vi.fn();
  });

  it("starts with isDragging false", () => {
    const { isDragging } = useDragDrop({ onDrop });
    expect(isDragging.value).toBe(false);
  });

  it("sets isDragging on drag enter", () => {
    const { handleDragEnter, isDragging } = useDragDrop({ onDrop });
    handleDragEnter();
    expect(isDragging.value).toBe(true);
  });

  it("clears isDragging when drag depth returns to 0", () => {
    const { handleDragEnter, handleDragLeave, isDragging } = useDragDrop({ onDrop });

    handleDragEnter();
    handleDragEnter();
    handleDragLeave();
    expect(isDragging.value).toBe(true);

    handleDragLeave();
    expect(isDragging.value).toBe(false);
  });

  it("clamps drag depth to 0 on excess handleDragLeave calls", () => {
    const { handleDragEnter, handleDragLeave, isDragging } = useDragDrop({ onDrop });

    handleDragEnter();
    handleDragLeave();
    handleDragLeave();
    handleDragLeave();

    expect(isDragging.value).toBe(false);

    // Should still work normally after excess leaves
    handleDragEnter();
    expect(isDragging.value).toBe(true);
  });

  it("handleDrop resets isDragging and calls onDrop with files", () => {
    const { handleDragEnter, handleDrop, isDragging } = useDragDrop({ onDrop });

    handleDragEnter();
    expect(isDragging.value).toBe(true);

    const file = createFile();
    const fileList = toFileList([file]);
    const event = {
      dataTransfer: { files: fileList },
    } as unknown as DragEvent;

    handleDrop(event);

    expect(isDragging.value).toBe(false);
    expect(onDrop).toHaveBeenCalledWith(fileList);
  });

  it("handleDrop does nothing when no files in dataTransfer", () => {
    const { handleDrop } = useDragDrop({ onDrop });

    const event = {
      dataTransfer: { files: toFileList([]) },
    } as unknown as DragEvent;

    handleDrop(event);
    expect(onDrop).not.toHaveBeenCalled();
  });

  it("handleDrop handles null dataTransfer", () => {
    const { handleDrop } = useDragDrop({ onDrop });

    const event = { dataTransfer: null } as unknown as DragEvent;

    handleDrop(event);
    expect(onDrop).not.toHaveBeenCalled();
  });
});
