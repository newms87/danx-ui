import { describe, it, expect, beforeEach } from "vitest";
import { renderUnorderedList, renderOrderedList, renderTaskList } from "../renderList";
import type { BlockToken } from "../../types";
import { resetParserState } from "../../state";

/**
 * Simple mock for renderTokensFn parameter
 * Renders paragraph tokens with <p> wrapping; other types produce empty string
 */
const mockRenderTokens = (tokens: BlockToken[], _sanitize: boolean) =>
  tokens.map((t) => (t.type === "paragraph" ? `<p>${(t as any).content}</p>` : "")).join("");

describe("renderUnorderedList", () => {
  beforeEach(() => {
    resetParserState();
  });

  it("renders basic list items", () => {
    const token: Extract<BlockToken, { type: "ul" }> = {
      type: "ul",
      items: [{ content: "Apple" }, { content: "Banana" }, { content: "Cherry" }],
    };
    const result = renderUnorderedList(token, true, mockRenderTokens);
    expect(result).toBe("<ul><li>Apple</li><li>Banana</li><li>Cherry</li></ul>");
  });

  it("renders list items with inline markdown", () => {
    const token: Extract<BlockToken, { type: "ul" }> = {
      type: "ul",
      items: [
        { content: "**bold item**" },
        { content: "*italic item*" },
        { content: "~~strikethrough~~" },
      ],
    };
    const result = renderUnorderedList(token, true, mockRenderTokens);
    expect(result).toContain("<li><strong>bold item</strong></li>");
    expect(result).toContain("<li><em>italic item</em></li>");
    expect(result).toContain("<li><del>strikethrough</del></li>");
  });

  it("renders nested children by calling renderTokensFn", () => {
    const nestedChildren: BlockToken[] = [{ type: "paragraph", content: "Nested paragraph" }];
    const token: Extract<BlockToken, { type: "ul" }> = {
      type: "ul",
      items: [{ content: "Parent item", children: nestedChildren }],
    };
    const result = renderUnorderedList(token, true, mockRenderTokens);
    expect(result).toBe("<ul><li>Parent item<p>Nested paragraph</p></li></ul>");
  });

  it("renders items without children (no renderTokensFn call)", () => {
    const token: Extract<BlockToken, { type: "ul" }> = {
      type: "ul",
      items: [{ content: "Simple item" }],
    };
    const result = renderUnorderedList(token, true, mockRenderTokens);
    expect(result).toBe("<ul><li>Simple item</li></ul>");
  });

  it("handles empty items array", () => {
    const token: Extract<BlockToken, { type: "ul" }> = {
      type: "ul",
      items: [],
    };
    const result = renderUnorderedList(token, true, mockRenderTokens);
    expect(result).toBe("<ul></ul>");
  });

  it("renders inline code in list items", () => {
    const token: Extract<BlockToken, { type: "ul" }> = {
      type: "ul",
      items: [{ content: "Use `Array.map()` for transforms" }],
    };
    const result = renderUnorderedList(token, true, mockRenderTokens);
    expect(result).toContain("<code>Array.map()</code>");
  });

  it("does not invoke renderTokensFn when children is empty array", () => {
    const token: Extract<BlockToken, { type: "ul" }> = {
      type: "ul",
      items: [{ content: "Item", children: [] }],
    };
    const result = renderUnorderedList(token, true, mockRenderTokens);
    expect(result).toBe("<ul><li>Item</li></ul>");
  });
});

describe("renderOrderedList", () => {
  beforeEach(() => {
    resetParserState();
  });

  it("renders basic ordered list", () => {
    const token: Extract<BlockToken, { type: "ol" }> = {
      type: "ol",
      start: 1,
      items: [{ content: "First" }, { content: "Second" }, { content: "Third" }],
    };
    const result = renderOrderedList(token, true, mockRenderTokens);
    expect(result).toBe("<ol><li>First</li><li>Second</li><li>Third</li></ol>");
  });

  it("adds start attribute when start is not 1", () => {
    const token: Extract<BlockToken, { type: "ol" }> = {
      type: "ol",
      start: 3,
      items: [{ content: "Third item" }, { content: "Fourth item" }],
    };
    const result = renderOrderedList(token, true, mockRenderTokens);
    expect(result).toBe('<ol start="3"><li>Third item</li><li>Fourth item</li></ol>');
  });

  it("does not add start attribute when start is 1", () => {
    const token: Extract<BlockToken, { type: "ol" }> = {
      type: "ol",
      start: 1,
      items: [{ content: "Item" }],
    };
    const result = renderOrderedList(token, true, mockRenderTokens);
    expect(result).toBe("<ol><li>Item</li></ol>");
    expect(result).not.toContain("start=");
  });

  it("renders nested children via renderTokensFn", () => {
    const nestedChildren: BlockToken[] = [{ type: "paragraph", content: "Sub content" }];
    const token: Extract<BlockToken, { type: "ol" }> = {
      type: "ol",
      start: 1,
      items: [{ content: "Parent", children: nestedChildren }],
    };
    const result = renderOrderedList(token, true, mockRenderTokens);
    expect(result).toBe("<ol><li>Parent<p>Sub content</p></li></ol>");
  });

  it("handles large start numbers", () => {
    const token: Extract<BlockToken, { type: "ol" }> = {
      type: "ol",
      start: 99,
      items: [{ content: "Item 99" }],
    };
    const result = renderOrderedList(token, true, mockRenderTokens);
    expect(result).toBe('<ol start="99"><li>Item 99</li></ol>');
  });

  it("renders inline markdown in ordered list items", () => {
    const token: Extract<BlockToken, { type: "ol" }> = {
      type: "ol",
      start: 1,
      items: [{ content: "**Important** first step" }, { content: "Then do *this*" }],
    };
    const result = renderOrderedList(token, true, mockRenderTokens);
    expect(result).toContain("<strong>Important</strong> first step");
    expect(result).toContain("Then do <em>this</em>");
  });

  it("handles empty items array", () => {
    const token: Extract<BlockToken, { type: "ol" }> = {
      type: "ol",
      start: 1,
      items: [],
    };
    const result = renderOrderedList(token, true, mockRenderTokens);
    expect(result).toBe("<ol></ol>");
  });
});

describe("renderTaskList", () => {
  beforeEach(() => {
    resetParserState();
  });

  it("renders unchecked items with disabled checkbox", () => {
    const token: Extract<BlockToken, { type: "task_list" }> = {
      type: "task_list",
      items: [{ checked: false, content: "Todo item" }],
    };
    const result = renderTaskList(token, true);
    expect(result).toContain('<input type="checkbox" disabled />');
    expect(result).not.toContain("checked");
  });

  it("renders checked items with checked disabled checkbox", () => {
    const token: Extract<BlockToken, { type: "task_list" }> = {
      type: "task_list",
      items: [{ checked: true, content: "Done item" }],
    };
    const result = renderTaskList(token, true);
    expect(result).toContain('<input type="checkbox" checked disabled />');
  });

  it("has task-list class on ul element", () => {
    const token: Extract<BlockToken, { type: "task_list" }> = {
      type: "task_list",
      items: [{ checked: false, content: "Item" }],
    };
    const result = renderTaskList(token, true);
    expect(result).toMatch(/^<ul class="task-list">/);
  });

  it("has task-list-item class on li elements", () => {
    const token: Extract<BlockToken, { type: "task_list" }> = {
      type: "task_list",
      items: [
        { checked: false, content: "Item A" },
        { checked: true, content: "Item B" },
      ],
    };
    const result = renderTaskList(token, true);
    expect(result).toContain('<li class="task-list-item">');
    // Both items should have the class
    const matches = result.match(/class="task-list-item"/g);
    expect(matches).toHaveLength(2);
  });

  it("renders mixed checked and unchecked items", () => {
    const token: Extract<BlockToken, { type: "task_list" }> = {
      type: "task_list",
      items: [
        { checked: true, content: "Buy groceries" },
        { checked: false, content: "Clean house" },
        { checked: true, content: "Do laundry" },
        { checked: false, content: "Cook dinner" },
      ],
    };
    const result = renderTaskList(token, true);
    const checkedCount = (result.match(/checked disabled/g) || []).length;
    const uncheckedCount = (result.match(/<input type="checkbox" disabled \/>/g) || []).length;
    expect(checkedCount).toBe(2);
    expect(uncheckedCount).toBe(2);
  });

  it("parses inline markdown in task list content", () => {
    const token: Extract<BlockToken, { type: "task_list" }> = {
      type: "task_list",
      items: [{ checked: false, content: "**Important** task" }],
    };
    const result = renderTaskList(token, true);
    expect(result).toContain("<strong>Important</strong> task");
  });

  it("renders complete task list HTML structure", () => {
    const token: Extract<BlockToken, { type: "task_list" }> = {
      type: "task_list",
      items: [
        { checked: false, content: "Task A" },
        { checked: true, content: "Task B" },
      ],
    };
    const result = renderTaskList(token, true);
    expect(result).toBe(
      '<ul class="task-list">' +
        '<li class="task-list-item"><input type="checkbox" disabled /> Task A</li>' +
        '<li class="task-list-item"><input type="checkbox" checked disabled /> Task B</li>' +
        "</ul>"
    );
  });

  it("handles empty items array", () => {
    const token: Extract<BlockToken, { type: "task_list" }> = {
      type: "task_list",
      items: [],
    };
    const result = renderTaskList(token, true);
    expect(result).toBe('<ul class="task-list"></ul>');
  });
});
