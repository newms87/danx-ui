import { describe, it, expect, vi } from "vitest";
import { nextTick, ref } from "vue";
import { useDanxFileViewer } from "../useDanxFileViewer";
import { makeFile } from "../../danx-file/__tests__/test-helpers";

describe("useDanxFileViewer", () => {
  describe("initial state", () => {
    it("currentFile starts as the anchor file", () => {
      const file = ref(makeFile("1"));
      const { currentFile } = useDanxFileViewer({
        file,
        relatedFiles: ref([]),
      });
      expect(currentFile.value.id).toBe("1");
    });

    it("currentIndex starts at 0 for single file", () => {
      const file = ref(makeFile("1"));
      const { currentIndex } = useDanxFileViewer({
        file,
        relatedFiles: ref([]),
      });
      expect(currentIndex.value).toBe(0);
    });

    it("hasNext is false for single file", () => {
      const file = ref(makeFile("1"));
      const { hasNext } = useDanxFileViewer({
        file,
        relatedFiles: ref([]),
      });
      expect(hasNext.value).toBe(false);
    });

    it("hasPrev is false for single file", () => {
      const file = ref(makeFile("1"));
      const { hasPrev } = useDanxFileViewer({
        file,
        relatedFiles: ref([]),
      });
      expect(hasPrev.value).toBe(false);
    });

    it("slideLabel is empty for single file", () => {
      const file = ref(makeFile("1"));
      const { slideLabel } = useDanxFileViewer({
        file,
        relatedFiles: ref([]),
      });
      expect(slideLabel.value).toBe("");
    });
  });

  describe("navigation with related files", () => {
    it("hasNext is true when there are more files", () => {
      const file = ref(makeFile("1"));
      const related = ref([makeFile("2"), makeFile("3")]);
      const { hasNext } = useDanxFileViewer({ file, relatedFiles: related });
      expect(hasNext.value).toBe(true);
    });

    it("next() advances to the next file", () => {
      const file = ref(makeFile("1"));
      const related = ref([makeFile("2")]);
      const { currentFile, next } = useDanxFileViewer({ file, relatedFiles: related });

      next();
      expect(currentFile.value.id).toBe("2");
    });

    it("prev() goes to the previous file", () => {
      const file = ref(makeFile("1"));
      const related = ref([makeFile("2")]);
      const { currentFile, next, prev } = useDanxFileViewer({
        file,
        relatedFiles: related,
      });

      next();
      expect(currentFile.value.id).toBe("2");

      prev();
      expect(currentFile.value.id).toBe("1");
    });

    it("next() does nothing at the end", () => {
      const file = ref(makeFile("1"));
      const { currentFile, next } = useDanxFileViewer({
        file,
        relatedFiles: ref([]),
      });

      next();
      expect(currentFile.value.id).toBe("1");
    });

    it("prev() does nothing at the beginning", () => {
      const file = ref(makeFile("1"));
      const { currentFile, prev } = useDanxFileViewer({
        file,
        relatedFiles: ref([]),
      });

      prev();
      expect(currentFile.value.id).toBe("1");
    });

    it("slideLabel returns empty when currentFile is not in allFiles", () => {
      const file = ref(makeFile("1"));
      const related = ref([makeFile("2"), makeFile("3")]);
      const { currentFile, slideLabel } = useDanxFileViewer({
        file,
        relatedFiles: related,
      });

      // Set currentFile to a file not in allFiles — currentIndex becomes -1
      currentFile.value = makeFile("not-in-list");
      expect(slideLabel.value).toBe("");
    });

    it("slideLabel shows position", () => {
      const file = ref(makeFile("1"));
      const related = ref([makeFile("2"), makeFile("3")]);
      const { slideLabel, next } = useDanxFileViewer({
        file,
        relatedFiles: related,
      });

      expect(slideLabel.value).toBe("1 / 3");
      next();
      expect(slideLabel.value).toBe("2 / 3");
    });

    it("deduplicates files by id", () => {
      const file = ref(makeFile("1"));
      const related = ref([makeFile("1"), makeFile("2")]);
      const { slideLabel } = useDanxFileViewer({ file, relatedFiles: related });
      expect(slideLabel.value).toBe("1 / 2");
    });
  });

  describe("goTo", () => {
    it("navigates directly to a specific file", () => {
      const file = ref(makeFile("1"));
      const file3 = makeFile("3");
      const related = ref([makeFile("2"), file3]);
      const { currentFile, goTo } = useDanxFileViewer({
        file,
        relatedFiles: related,
      });

      goTo(file3);
      expect(currentFile.value.id).toBe("3");
    });

    it("clears child stack", () => {
      const file = ref(makeFile("1"));
      const child = makeFile("child");
      const file2 = makeFile("2");
      const related = ref([file2]);
      const { currentFile, diveIntoChild, goTo, hasParent } = useDanxFileViewer({
        file,
        relatedFiles: related,
      });

      diveIntoChild(child);
      expect(hasParent.value).toBe(true);

      goTo(file2);
      expect(hasParent.value).toBe(false);
      expect(currentFile.value.id).toBe("2");
    });
  });

  describe("child stack", () => {
    it("diveIntoChild pushes current file and sets child as current", () => {
      const file = ref(makeFile("1"));
      const child = makeFile("child");
      const { currentFile, diveIntoChild, hasParent, childStack } = useDanxFileViewer({
        file,
        relatedFiles: ref([]),
      });

      diveIntoChild(child);
      expect(currentFile.value.id).toBe("child");
      expect(hasParent.value).toBe(true);
      expect(childStack.value).toHaveLength(1);
      expect(childStack.value[0]!.id).toBe("1");
    });

    it("backFromChild pops stack and restores parent", () => {
      const file = ref(makeFile("1"));
      const child = makeFile("child");
      const { currentFile, diveIntoChild, backFromChild, hasParent } = useDanxFileViewer({
        file,
        relatedFiles: ref([]),
      });

      diveIntoChild(child);
      backFromChild();
      expect(currentFile.value.id).toBe("1");
      expect(hasParent.value).toBe(false);
    });

    it("backFromChild does nothing when stack is empty", () => {
      const file = ref(makeFile("1"));
      const { currentFile, backFromChild } = useDanxFileViewer({
        file,
        relatedFiles: ref([]),
      });

      backFromChild();
      expect(currentFile.value.id).toBe("1");
    });

    it("supports multi-level diving", () => {
      const file = ref(makeFile("1"));
      const child = makeFile("child");
      const grandchild = makeFile("grandchild");
      const { currentFile, diveIntoChild, backFromChild, childStack } = useDanxFileViewer({
        file,
        relatedFiles: ref([]),
      });

      diveIntoChild(child);
      diveIntoChild(grandchild);
      expect(currentFile.value.id).toBe("grandchild");
      expect(childStack.value).toHaveLength(2);

      backFromChild();
      expect(currentFile.value.id).toBe("child");

      backFromChild();
      expect(currentFile.value.id).toBe("1");
    });

    it("disables next/prev/slideLabel when in child", () => {
      const file = ref(makeFile("1"));
      const related = ref([makeFile("2")]);
      const child = makeFile("child");
      const { hasNext, hasPrev, slideLabel, diveIntoChild } = useDanxFileViewer({
        file,
        relatedFiles: related,
      });

      expect(hasNext.value).toBe(true);
      diveIntoChild(child);
      expect(hasNext.value).toBe(false);
      expect(hasPrev.value).toBe(false);
      expect(slideLabel.value).toBe("");
    });
  });

  describe("onNavigate callback", () => {
    it("calls onNavigate when navigating with next()", () => {
      const file = ref(makeFile("1"));
      const related = ref([makeFile("2")]);
      const onNavigate = vi.fn();
      const { next } = useDanxFileViewer({
        file,
        relatedFiles: related,
        onNavigate,
      });

      next();
      expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ id: "2" }));
    });

    it("calls onNavigate for goTo", () => {
      const file = ref(makeFile("1"));
      const file3 = makeFile("3");
      const related = ref([makeFile("2"), file3]);
      const onNavigate = vi.fn();
      const { goTo } = useDanxFileViewer({ file, relatedFiles: related, onNavigate });

      goTo(file3);
      expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ id: "3" }));
    });

    it("calls onNavigate for diveIntoChild", () => {
      const file = ref(makeFile("1"));
      const child = makeFile("child");
      const onNavigate = vi.fn();
      const { diveIntoChild } = useDanxFileViewer({
        file,
        relatedFiles: ref([]),
        onNavigate,
      });

      diveIntoChild(child);
      expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ id: "child" }));
    });

    it("calls onNavigate for backFromChild", () => {
      const file = ref(makeFile("1"));
      const child = makeFile("child");
      const onNavigate = vi.fn();
      const { diveIntoChild, backFromChild } = useDanxFileViewer({
        file,
        relatedFiles: ref([]),
        onNavigate,
      });

      diveIntoChild(child);
      onNavigate.mockClear();
      backFromChild();
      expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ id: "1" }));
    });

    it("calls onNavigate for reset", () => {
      const file = ref(makeFile("1"));
      const related = ref([makeFile("2")]);
      const onNavigate = vi.fn();
      const { next, reset } = useDanxFileViewer({
        file,
        relatedFiles: related,
        onNavigate,
      });

      next();
      onNavigate.mockClear();
      reset();
      expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ id: "1" }));
    });
  });

  describe("allFiles", () => {
    it("exposes deduped allFiles computed", () => {
      const file = ref(makeFile("1"));
      const related = ref([makeFile("1"), makeFile("2")]);
      const { allFiles } = useDanxFileViewer({
        file,
        relatedFiles: related,
      });
      expect(allFiles.value.length).toBe(2);
      expect(allFiles.value[0]!.id).toBe("1");
      expect(allFiles.value[1]!.id).toBe("2");
    });
  });

  describe("anchor file change", () => {
    it("resets when anchor file ref changes", async () => {
      const file = ref(makeFile("1"));
      const related = ref([makeFile("2")]);
      const { currentFile, next, diveIntoChild, hasParent } = useDanxFileViewer({
        file,
        relatedFiles: related,
      });

      next();
      diveIntoChild(makeFile("child"));
      expect(hasParent.value).toBe(true);

      // Change the anchor file
      file.value = makeFile("new");
      await nextTick();
      expect(currentFile.value.id).toBe("new");
      expect(hasParent.value).toBe(false);
    });
  });

  describe("reset", () => {
    it("resets to anchor file and clears stack", () => {
      const file = ref(makeFile("1"));
      const related = ref([makeFile("2")]);
      const child = makeFile("child");
      const { currentFile, next, diveIntoChild, reset, hasParent } = useDanxFileViewer({
        file,
        relatedFiles: related,
      });

      next();
      diveIntoChild(child);
      expect(currentFile.value.id).toBe("child");
      expect(hasParent.value).toBe(true);

      reset();
      expect(currentFile.value.id).toBe("1");
      expect(hasParent.value).toBe(false);
    });
  });
});
