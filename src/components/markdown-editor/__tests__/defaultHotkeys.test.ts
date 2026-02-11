import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerDefaultHotkeys } from "../defaultHotkeys";
import { HotkeyDefinition } from "../useMarkdownHotkeys";
import { createMockEditor } from "./mockEditor";
import { UseMarkdownEditorReturn } from "../useMarkdownEditor";

describe("defaultHotkeys", () => {
  let editor: UseMarkdownEditorReturn;
  let registeredHotkeys: HotkeyDefinition[];

  beforeEach(() => {
    editor = createMockEditor();
    registeredHotkeys = [];
  });

  function registerHotkey(def: HotkeyDefinition): void {
    registeredHotkeys.push(def);
  }

  function findHotkey(key: string): HotkeyDefinition | undefined {
    return registeredHotkeys.find((h) => h.key === key);
  }

  describe("registerDefaultHotkeys", () => {
    it("registers hotkeys for all expected key bindings", () => {
      registerDefaultHotkeys(editor, registerHotkey);
      expect(registeredHotkeys.length).toBeGreaterThan(0);
    });

    it("registers formatting hotkeys", () => {
      registerDefaultHotkeys(editor, registerHotkey);

      expect(findHotkey("ctrl+b")).toBeDefined();
      expect(findHotkey("ctrl+i")).toBeDefined();
      expect(findHotkey("ctrl+e")).toBeDefined();
      expect(findHotkey("ctrl+shift+s")).toBeDefined();
      expect(findHotkey("ctrl+shift+h")).toBeDefined();
      expect(findHotkey("ctrl+u")).toBeDefined();
      expect(findHotkey("ctrl+k")).toBeDefined();
    });

    it("registers heading hotkeys", () => {
      registerDefaultHotkeys(editor, registerHotkey);

      for (let i = 0; i <= 6; i++) {
        expect(findHotkey(`ctrl+${i}`)).toBeDefined();
      }
      expect(findHotkey("ctrl+<")).toBeDefined();
      expect(findHotkey("ctrl+>")).toBeDefined();
    });

    it("registers list hotkeys", () => {
      registerDefaultHotkeys(editor, registerHotkey);

      expect(findHotkey("ctrl+shift+[")).toBeDefined();
      expect(findHotkey("ctrl+shift+]")).toBeDefined();
      expect(findHotkey("tab")).toBeDefined();
      expect(findHotkey("shift+tab")).toBeDefined();
    });

    it("registers block hotkeys", () => {
      registerDefaultHotkeys(editor, registerHotkey);

      expect(findHotkey("ctrl+shift+k")).toBeDefined();
      expect(findHotkey("ctrl+enter")).toBeDefined();
      expect(findHotkey("ctrl+shift+q")).toBeDefined();
      expect(findHotkey("ctrl+shift+enter")).toBeDefined();
    });

    it("registers table hotkeys", () => {
      registerDefaultHotkeys(editor, registerHotkey);

      expect(findHotkey("ctrl+alt+shift+t")).toBeDefined();
      expect(findHotkey("ctrl+alt+shift+up")).toBeDefined();
      expect(findHotkey("ctrl+alt+shift+down")).toBeDefined();
      expect(findHotkey("ctrl+alt+shift+left")).toBeDefined();
      expect(findHotkey("ctrl+alt+shift+right")).toBeDefined();
      expect(findHotkey("ctrl+alt+backspace")).toBeDefined();
      expect(findHotkey("ctrl+shift+backspace")).toBeDefined();
      expect(findHotkey("ctrl+alt+shift+backspace")).toBeDefined();
    });

    it("registers help hotkey", () => {
      registerDefaultHotkeys(editor, registerHotkey);
      expect(findHotkey("ctrl+?")).toBeDefined();
    });

    it("all registered hotkeys have descriptions", () => {
      registerDefaultHotkeys(editor, registerHotkey);

      for (const hotkey of registeredHotkeys) {
        expect(hotkey.description).toBeTruthy();
      }
    });

    it("all registered hotkeys have groups", () => {
      registerDefaultHotkeys(editor, registerHotkey);

      for (const hotkey of registeredHotkeys) {
        expect(hotkey.group).toBeTruthy();
      }
    });

    it("all registered hotkeys have action functions", () => {
      registerDefaultHotkeys(editor, registerHotkey);

      for (const hotkey of registeredHotkeys) {
        expect(typeof hotkey.action).toBe("function");
      }
    });
  });

  describe("formatting actions", () => {
    it("ctrl+b calls toggleBold", () => {
      registerDefaultHotkeys(editor, registerHotkey);
      findHotkey("ctrl+b")!.action();
      expect(editor.inlineFormatting.toggleBold).toHaveBeenCalled();
    });

    it("ctrl+i calls toggleItalic", () => {
      registerDefaultHotkeys(editor, registerHotkey);
      findHotkey("ctrl+i")!.action();
      expect(editor.inlineFormatting.toggleItalic).toHaveBeenCalled();
    });

    it("ctrl+e calls toggleInlineCode", () => {
      registerDefaultHotkeys(editor, registerHotkey);
      findHotkey("ctrl+e")!.action();
      expect(editor.inlineFormatting.toggleInlineCode).toHaveBeenCalled();
    });

    it("ctrl+shift+s calls toggleStrikethrough", () => {
      registerDefaultHotkeys(editor, registerHotkey);
      findHotkey("ctrl+shift+s")!.action();
      expect(editor.inlineFormatting.toggleStrikethrough).toHaveBeenCalled();
    });

    it("ctrl+shift+h calls toggleHighlight", () => {
      registerDefaultHotkeys(editor, registerHotkey);
      findHotkey("ctrl+shift+h")!.action();
      expect(editor.inlineFormatting.toggleHighlight).toHaveBeenCalled();
    });

    it("ctrl+u calls toggleUnderline", () => {
      registerDefaultHotkeys(editor, registerHotkey);
      findHotkey("ctrl+u")!.action();
      expect(editor.inlineFormatting.toggleUnderline).toHaveBeenCalled();
    });

    it("ctrl+k calls insertLink", () => {
      registerDefaultHotkeys(editor, registerHotkey);
      findHotkey("ctrl+k")!.action();
      expect(editor.links.insertLink).toHaveBeenCalled();
    });
  });

  describe("heading actions with list handling", () => {
    it("ctrl+0 converts to paragraph when not in a list", () => {
      registerDefaultHotkeys(editor, registerHotkey);
      findHotkey("ctrl+0")!.action();
      expect(editor.headings.setHeadingLevel).toHaveBeenCalledWith(0);
    });

    it("ctrl+1 sets heading level 1", () => {
      registerDefaultHotkeys(editor, registerHotkey);
      findHotkey("ctrl+1")!.action();
      expect(editor.headings.setHeadingLevel).toHaveBeenCalledWith(1);
    });

    it("ctrl+1 converts list item to paragraph first when in a list", () => {
      (editor.lists.getCurrentListType as ReturnType<typeof vi.fn>).mockReturnValue("ul");
      registerDefaultHotkeys(editor, registerHotkey);
      findHotkey("ctrl+1")!.action();
      expect(editor.lists.convertCurrentListItemToParagraph).toHaveBeenCalled();
      expect(editor.headings.setHeadingLevel).toHaveBeenCalledWith(1);
    });

    it("ctrl+0 in a list converts to paragraph without calling setHeadingLevel(0)", () => {
      (editor.lists.getCurrentListType as ReturnType<typeof vi.fn>).mockReturnValue("ol");
      registerDefaultHotkeys(editor, registerHotkey);
      findHotkey("ctrl+0")!.action();
      expect(editor.lists.convertCurrentListItemToParagraph).toHaveBeenCalled();
      // level 0 + listType truthy means setHeadingLevel is NOT called
      expect(editor.headings.setHeadingLevel).not.toHaveBeenCalled();
    });

    it("ctrl+< calls decreaseHeadingLevel when not in a list", () => {
      registerDefaultHotkeys(editor, registerHotkey);
      findHotkey("ctrl+<")!.action();
      expect(editor.headings.decreaseHeadingLevel).toHaveBeenCalled();
    });

    it("ctrl+< converts list item to paragraph when in a list", () => {
      (editor.lists.getCurrentListType as ReturnType<typeof vi.fn>).mockReturnValue("ul");
      registerDefaultHotkeys(editor, registerHotkey);
      findHotkey("ctrl+<")!.action();
      expect(editor.lists.convertCurrentListItemToParagraph).toHaveBeenCalled();
      expect(editor.headings.decreaseHeadingLevel).not.toHaveBeenCalled();
    });

    it("ctrl+> calls increaseHeadingLevel when not in a list", () => {
      registerDefaultHotkeys(editor, registerHotkey);
      findHotkey("ctrl+>")!.action();
      expect(editor.headings.increaseHeadingLevel).toHaveBeenCalled();
    });

    it("ctrl+> in a list converts to paragraph then sets H6", () => {
      (editor.lists.getCurrentListType as ReturnType<typeof vi.fn>).mockReturnValue("ul");
      registerDefaultHotkeys(editor, registerHotkey);
      findHotkey("ctrl+>")!.action();
      expect(editor.lists.convertCurrentListItemToParagraph).toHaveBeenCalled();
      expect(editor.headings.setHeadingLevel).toHaveBeenCalledWith(6);
    });
  });

  describe("list actions", () => {
    it("ctrl+shift+[ calls toggleUnorderedList", () => {
      registerDefaultHotkeys(editor, registerHotkey);
      findHotkey("ctrl+shift+[")!.action();
      expect(editor.lists.toggleUnorderedList).toHaveBeenCalled();
    });

    it("ctrl+shift+] calls toggleOrderedList", () => {
      registerDefaultHotkeys(editor, registerHotkey);
      findHotkey("ctrl+shift+]")!.action();
      expect(editor.lists.toggleOrderedList).toHaveBeenCalled();
    });

    it("tab has a no-op action (handled elsewhere)", () => {
      registerDefaultHotkeys(editor, registerHotkey);
      const tabHotkey = findHotkey("tab")!;
      // Should not throw
      tabHotkey.action();
    });
  });

  describe("block actions", () => {
    it("ctrl+shift+k toggles code block when not in list", () => {
      registerDefaultHotkeys(editor, registerHotkey);
      findHotkey("ctrl+shift+k")!.action();
      expect(editor.codeBlocks.toggleCodeBlock).toHaveBeenCalled();
    });

    it("ctrl+shift+k in code block just toggles off", () => {
      (editor.codeBlocks.isInCodeBlock as ReturnType<typeof vi.fn>).mockReturnValue(true);
      registerDefaultHotkeys(editor, registerHotkey);
      findHotkey("ctrl+shift+k")!.action();
      expect(editor.codeBlocks.toggleCodeBlock).toHaveBeenCalledTimes(1);
      expect(editor.lists.convertCurrentListItemToParagraph).not.toHaveBeenCalled();
    });

    it("ctrl+shift+k in list converts to paragraph first", () => {
      (editor.lists.getCurrentListType as ReturnType<typeof vi.fn>).mockReturnValue("ul");
      registerDefaultHotkeys(editor, registerHotkey);
      findHotkey("ctrl+shift+k")!.action();
      expect(editor.lists.convertCurrentListItemToParagraph).toHaveBeenCalled();
      expect(editor.codeBlocks.toggleCodeBlock).toHaveBeenCalled();
    });

    it("ctrl+shift+q calls toggleBlockquote", () => {
      registerDefaultHotkeys(editor, registerHotkey);
      findHotkey("ctrl+shift+q")!.action();
      expect(editor.blockquotes.toggleBlockquote).toHaveBeenCalled();
    });

    it("ctrl+shift+enter calls insertHorizontalRule", () => {
      registerDefaultHotkeys(editor, registerHotkey);
      findHotkey("ctrl+shift+enter")!.action();
      expect(editor.insertHorizontalRule).toHaveBeenCalled();
    });
  });

  describe("table actions", () => {
    it("ctrl+alt+shift+t calls insertTable", () => {
      registerDefaultHotkeys(editor, registerHotkey);
      findHotkey("ctrl+alt+shift+t")!.action();
      expect(editor.tables.insertTable).toHaveBeenCalled();
    });

    it("table row/column actions only execute when in table", () => {
      registerDefaultHotkeys(editor, registerHotkey);

      findHotkey("ctrl+alt+shift+up")!.action();
      expect(editor.tables.insertRowAbove).not.toHaveBeenCalled();

      // Now make it think we're in a table
      (editor.tables.isInTable as ReturnType<typeof vi.fn>).mockReturnValue(true);
      findHotkey("ctrl+alt+shift+up")!.action();
      expect(editor.tables.insertRowAbove).toHaveBeenCalled();
    });

    it("table operations call correct methods when in table", () => {
      (editor.tables.isInTable as ReturnType<typeof vi.fn>).mockReturnValue(true);
      registerDefaultHotkeys(editor, registerHotkey);

      findHotkey("ctrl+alt+shift+down")!.action();
      expect(editor.tables.insertRowBelow).toHaveBeenCalled();

      findHotkey("ctrl+alt+shift+left")!.action();
      expect(editor.tables.insertColumnLeft).toHaveBeenCalled();

      findHotkey("ctrl+alt+shift+right")!.action();
      expect(editor.tables.insertColumnRight).toHaveBeenCalled();

      findHotkey("ctrl+alt+backspace")!.action();
      expect(editor.tables.deleteCurrentRow).toHaveBeenCalled();

      findHotkey("ctrl+shift+backspace")!.action();
      expect(editor.tables.deleteCurrentColumn).toHaveBeenCalled();

      findHotkey("ctrl+alt+shift+backspace")!.action();
      expect(editor.tables.deleteTable).toHaveBeenCalled();
    });

    it("alignment actions call correct methods when in table", () => {
      (editor.tables.isInTable as ReturnType<typeof vi.fn>).mockReturnValue(true);
      registerDefaultHotkeys(editor, registerHotkey);

      // ctrl+alt+l is registered twice (code block cycle + align left), find the table one
      const alignLeftHotkeys = registeredHotkeys.filter(
        (h) => h.key === "ctrl+alt+l" && h.group === "tables"
      );
      expect(alignLeftHotkeys.length).toBe(1);
      alignLeftHotkeys[0]!.action();
      expect(editor.tables.setColumnAlignmentLeft).toHaveBeenCalled();

      findHotkey("ctrl+alt+c")!.action();
      expect(editor.tables.setColumnAlignmentCenter).toHaveBeenCalled();

      findHotkey("ctrl+alt+r")!.action();
      expect(editor.tables.setColumnAlignmentRight).toHaveBeenCalled();
    });
  });

  describe("other actions", () => {
    it("ctrl+? calls showHotkeyHelp", () => {
      registerDefaultHotkeys(editor, registerHotkey);
      findHotkey("ctrl+?")!.action();
      expect(editor.showHotkeyHelp).toHaveBeenCalled();
    });
  });
});
