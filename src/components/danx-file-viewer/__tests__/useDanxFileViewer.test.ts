import { describe, it, expect, vi } from "vitest";
import { nextTick, ref } from "vue";
import { useDanxFileViewer } from "../useDanxFileViewer";
import { makeFile, makeChild } from "../../danx-file/__tests__/test-helpers";

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

    it("stays in child mode when navigating within children", () => {
      const children = [makeChild("c1"), makeChild("c2"), makeChild("c3")];
      const file = ref(makeFile("1", { children }));
      const { currentFile, diveIntoChildren, goTo, hasParent } = useDanxFileViewer({
        file,
        relatedFiles: ref([]),
      });

      diveIntoChildren();
      expect(hasParent.value).toBe(true);

      goTo(children[2]!);
      expect(hasParent.value).toBe(true);
      expect(currentFile.value.id).toBe("c3");
    });
  });

  describe("child stack", () => {
    it("diveIntoChildren pushes current file and sets first child as current", () => {
      const children = [makeChild("c1"), makeChild("c2")];
      const file = ref(makeFile("1", { children }));
      const { currentFile, diveIntoChildren, hasParent, childStack } = useDanxFileViewer({
        file,
        relatedFiles: ref([]),
      });

      diveIntoChildren();
      expect(currentFile.value.id).toBe("c1");
      expect(hasParent.value).toBe(true);
      expect(childStack.value).toHaveLength(1);
      expect(childStack.value[0]!.id).toBe("1");
    });

    it("diveIntoChildren does nothing when no children exist", () => {
      const file = ref(makeFile("1", { children: [] }));
      const { currentFile, diveIntoChildren, hasParent } = useDanxFileViewer({
        file,
        relatedFiles: ref([]),
      });

      diveIntoChildren();
      expect(currentFile.value.id).toBe("1");
      expect(hasParent.value).toBe(false);
    });

    it("backFromChild pops stack and restores parent", () => {
      const children = [makeChild("c1")];
      const file = ref(makeFile("1", { children }));
      const { currentFile, diveIntoChildren, backFromChild, hasParent } = useDanxFileViewer({
        file,
        relatedFiles: ref([]),
      });

      diveIntoChildren();
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
      const grandchildren = [makeChild("gc1")];
      const children = [makeChild("c1", { children: grandchildren }), makeChild("c2")];
      const file = ref(makeFile("1", { children }));
      const { currentFile, diveIntoChildren, backFromChild, childStack } = useDanxFileViewer({
        file,
        relatedFiles: ref([]),
      });

      diveIntoChildren(); // into children[0] = c1
      expect(currentFile.value.id).toBe("c1");

      diveIntoChildren(); // into grandchildren[0] = gc1
      expect(currentFile.value.id).toBe("gc1");
      expect(childStack.value).toHaveLength(2);

      backFromChild();
      expect(currentFile.value.id).toBe("c1");

      backFromChild();
      expect(currentFile.value.id).toBe("1");
    });

    it("enables next/prev within children", () => {
      const children = [makeChild("c1"), makeChild("c2"), makeChild("c3")];
      const file = ref(makeFile("1", { children }));
      const related = ref([makeFile("2")]);
      const { hasNext, hasPrev, slideLabel, diveIntoChildren, next, currentFile } =
        useDanxFileViewer({
          file,
          relatedFiles: related,
        });

      diveIntoChildren();
      expect(currentFile.value.id).toBe("c1");
      expect(hasNext.value).toBe(true);
      expect(hasPrev.value).toBe(false);
      expect(slideLabel.value).toBe("1 / 3");

      next();
      expect(currentFile.value.id).toBe("c2");
      expect(slideLabel.value).toBe("2 / 3");
    });
  });

  describe("activeFiles", () => {
    it("returns root files at root level", () => {
      const file = ref(makeFile("1"));
      const related = ref([makeFile("2")]);
      const { activeFiles } = useDanxFileViewer({ file, relatedFiles: related });
      expect(activeFiles.value.length).toBe(2);
      expect(activeFiles.value[0]!.id).toBe("1");
      expect(activeFiles.value[1]!.id).toBe("2");
    });

    it("returns children when in child mode", () => {
      const children = [makeChild("c1"), makeChild("c2")];
      const file = ref(makeFile("1", { children }));
      const related = ref([makeFile("2")]);
      const { activeFiles, diveIntoChildren } = useDanxFileViewer({
        file,
        relatedFiles: related,
      });

      expect(activeFiles.value.length).toBe(2);
      diveIntoChildren();
      expect(activeFiles.value.length).toBe(2);
      expect(activeFiles.value[0]!.id).toBe("c1");
      expect(activeFiles.value[1]!.id).toBe("c2");
    });

    it("restores root files after backFromChild", () => {
      const children = [makeChild("c1")];
      const file = ref(makeFile("1", { children }));
      const { activeFiles, diveIntoChildren, backFromChild } = useDanxFileViewer({
        file,
        relatedFiles: ref([]),
      });

      diveIntoChildren();
      expect(activeFiles.value[0]!.id).toBe("c1");

      backFromChild();
      expect(activeFiles.value[0]!.id).toBe("1");
    });
  });

  describe("hasChildFiles", () => {
    it("is true when current file has children", () => {
      const children = [makeChild("c1")];
      const file = ref(makeFile("1", { children }));
      const { hasChildFiles } = useDanxFileViewer({
        file,
        relatedFiles: ref([]),
      });
      expect(hasChildFiles.value).toBe(true);
    });

    it("is false when current file has no children", () => {
      const file = ref(makeFile("1", { children: [] }));
      const { hasChildFiles } = useDanxFileViewer({
        file,
        relatedFiles: ref([]),
      });
      expect(hasChildFiles.value).toBe(false);
    });

    it("is false when children is undefined", () => {
      const file = ref(makeFile("1"));
      const { hasChildFiles } = useDanxFileViewer({
        file,
        relatedFiles: ref([]),
      });
      expect(hasChildFiles.value).toBe(false);
    });

    it("updates when navigating to a file with children", () => {
      const children = [makeChild("c1")];
      const file = ref(makeFile("1"));
      const file2 = makeFile("2", { children });
      const { hasChildFiles, goTo } = useDanxFileViewer({
        file,
        relatedFiles: ref([file2]),
      });

      expect(hasChildFiles.value).toBe(false);
      goTo(file2);
      expect(hasChildFiles.value).toBe(true);
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

    it("calls onNavigate for diveIntoChildren", () => {
      const children = [makeChild("c1")];
      const file = ref(makeFile("1", { children }));
      const onNavigate = vi.fn();
      const { diveIntoChildren } = useDanxFileViewer({
        file,
        relatedFiles: ref([]),
        onNavigate,
      });

      diveIntoChildren();
      expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ id: "c1" }));
    });

    it("calls onNavigate for backFromChild", () => {
      const children = [makeChild("c1")];
      const file = ref(makeFile("1", { children }));
      const onNavigate = vi.fn();
      const { diveIntoChildren, backFromChild } = useDanxFileViewer({
        file,
        relatedFiles: ref([]),
        onNavigate,
      });

      diveIntoChildren();
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
      const children = [makeChild("c1")];
      const file = ref(makeFile("1", { children }));
      const related = ref([makeFile("2")]);
      const { currentFile, diveIntoChildren, hasParent } = useDanxFileViewer({
        file,
        relatedFiles: related,
      });

      diveIntoChildren();
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
      const children = [makeChild("c1")];
      const file = ref(makeFile("1", { children }));
      const related = ref([makeFile("2")]);
      const { currentFile, diveIntoChildren, reset, hasParent } = useDanxFileViewer({
        file,
        relatedFiles: related,
      });

      diveIntoChildren();
      expect(currentFile.value.id).toBe("c1");
      expect(hasParent.value).toBe(true);

      reset();
      expect(currentFile.value.id).toBe("1");
      expect(hasParent.value).toBe(false);
    });
  });

  describe("navigateToAncestor", () => {
    it("navigates to a specific ancestor in the stack", () => {
      const grandchildren = [makeChild("gc1")];
      const children = [makeChild("c1", { children: grandchildren })];
      const file = ref(makeFile("1", { children }));
      const { currentFile, diveIntoChildren, navigateToAncestor, childStack } = useDanxFileViewer({
        file,
        relatedFiles: ref([]),
      });

      diveIntoChildren(); // into c1
      diveIntoChildren(); // into gc1
      expect(currentFile.value.id).toBe("gc1");
      expect(childStack.value).toHaveLength(2);

      // Navigate back to root (file "1")
      navigateToAncestor("1");
      expect(currentFile.value.id).toBe("1");
      expect(childStack.value).toHaveLength(0);
    });

    it("navigates to intermediate ancestor", () => {
      const greatGrandchildren = [makeChild("ggc1")];
      const grandchildren = [makeChild("gc1", { children: greatGrandchildren })];
      const children = [makeChild("c1", { children: grandchildren })];
      const file = ref(makeFile("1", { children }));
      const { currentFile, diveIntoChildren, navigateToAncestor, childStack } = useDanxFileViewer({
        file,
        relatedFiles: ref([]),
      });

      diveIntoChildren(); // into c1
      diveIntoChildren(); // into gc1
      diveIntoChildren(); // into ggc1
      expect(childStack.value).toHaveLength(3);

      // Navigate to "c1" (skipping gc1)
      navigateToAncestor("c1");
      expect(currentFile.value.id).toBe("c1");
      expect(childStack.value).toHaveLength(1);
      expect(childStack.value[0]!.id).toBe("1");
    });

    it("does nothing for unknown file ID", () => {
      const children = [makeChild("c1")];
      const file = ref(makeFile("1", { children }));
      const { currentFile, diveIntoChildren, navigateToAncestor } = useDanxFileViewer({
        file,
        relatedFiles: ref([]),
      });

      diveIntoChildren();
      navigateToAncestor("unknown");
      expect(currentFile.value.id).toBe("c1");
    });
  });

  describe("breadcrumbs", () => {
    it("returns empty array at root level", () => {
      const file = ref(makeFile("1"));
      const { breadcrumbs } = useDanxFileViewer({
        file,
        relatedFiles: ref([]),
      });
      expect(breadcrumbs.value).toEqual([]);
    });

    it("returns [parent, child] when one level deep", () => {
      const children = [makeChild("c1")];
      const file = ref(makeFile("1", { children }));
      const { breadcrumbs, diveIntoChildren } = useDanxFileViewer({
        file,
        relatedFiles: ref([]),
      });

      diveIntoChildren();
      expect(breadcrumbs.value).toEqual([
        { id: "1", name: "file-1.jpg" },
        { id: "c1", name: "child-c1.jpg" },
      ]);
    });

    it("returns full chain at three levels deep", () => {
      const grandchildren = [makeChild("gc1")];
      const children = [makeChild("c1", { children: grandchildren })];
      const file = ref(makeFile("1", { children }));
      const { breadcrumbs, diveIntoChildren } = useDanxFileViewer({
        file,
        relatedFiles: ref([]),
      });

      diveIntoChildren(); // into c1
      diveIntoChildren(); // into gc1
      expect(breadcrumbs.value).toEqual([
        { id: "1", name: "file-1.jpg" },
        { id: "c1", name: "child-c1.jpg" },
        { id: "gc1", name: "child-gc1.jpg" },
      ]);
    });

    it("updates after navigateToAncestor", () => {
      const grandchildren = [makeChild("gc1")];
      const children = [makeChild("c1", { children: grandchildren })];
      const file = ref(makeFile("1", { children }));
      const { breadcrumbs, diveIntoChildren, navigateToAncestor } = useDanxFileViewer({
        file,
        relatedFiles: ref([]),
      });

      diveIntoChildren(); // into c1
      diveIntoChildren(); // into gc1
      navigateToAncestor("c1");

      expect(breadcrumbs.value).toEqual([
        { id: "1", name: "file-1.jpg" },
        { id: "c1", name: "child-c1.jpg" },
      ]);
    });
  });
});
