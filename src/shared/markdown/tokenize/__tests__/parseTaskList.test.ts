import { describe, it, expect } from "vitest";
import { parseTaskList } from "../parseTaskList";

describe("parseTaskList", () => {
  it("parses - [ ] as unchecked task item", () => {
    const lines = ["- [ ] Unchecked task"];
    const result = parseTaskList(lines, 0);
    expect(result).toEqual({
      token: {
        type: "task_list",
        items: [{ checked: false, content: "Unchecked task" }],
      },
      endIndex: 1,
    });
  });

  it("parses - [x] as checked task item (lowercase x)", () => {
    const lines = ["- [x] Checked task"];
    const result = parseTaskList(lines, 0);
    expect(result).toEqual({
      token: {
        type: "task_list",
        items: [{ checked: true, content: "Checked task" }],
      },
      endIndex: 1,
    });
  });

  it("parses - [X] as checked task item (uppercase X)", () => {
    const lines = ["- [X] Checked task"];
    const result = parseTaskList(lines, 0);
    expect(result).toEqual({
      token: {
        type: "task_list",
        items: [{ checked: true, content: "Checked task" }],
      },
      endIndex: 1,
    });
  });

  it("parses multiple consecutive task items", () => {
    const lines = [
      "- [ ] Task one",
      "- [x] Task two",
      "- [ ] Task three",
    ];
    const result = parseTaskList(lines, 0);
    expect(result).toEqual({
      token: {
        type: "task_list",
        items: [
          { checked: false, content: "Task one" },
          { checked: true, content: "Task two" },
          { checked: false, content: "Task three" },
        ],
      },
      endIndex: 3,
    });
  });

  it("returns null for non-task-list lines", () => {
    const lines = ["Just a regular line"];
    expect(parseTaskList(lines, 0)).toBeNull();
  });

  it("returns null for regular list items (not task items)", () => {
    const lines = ["- Regular list item"];
    expect(parseTaskList(lines, 0)).toBeNull();
  });

  it("stops at non-task lines", () => {
    const lines = [
      "- [ ] Task item",
      "Not a task item",
      "- [ ] Another task",
    ];
    const result = parseTaskList(lines, 0);
    expect(result).toEqual({
      token: {
        type: "task_list",
        items: [{ checked: false, content: "Task item" }],
      },
      endIndex: 1,
    });
  });

  it("handles task items with * marker", () => {
    const lines = ["* [ ] Task with asterisk"];
    const result = parseTaskList(lines, 0);
    expect(result).toEqual({
      token: {
        type: "task_list",
        items: [{ checked: false, content: "Task with asterisk" }],
      },
      endIndex: 1,
    });
  });

  it("handles task items with + marker", () => {
    const lines = ["+ [x] Task with plus"];
    const result = parseTaskList(lines, 0);
    expect(result).toEqual({
      token: {
        type: "task_list",
        items: [{ checked: true, content: "Task with plus" }],
      },
      endIndex: 1,
    });
  });

  it("starts parsing from given index", () => {
    const lines = ["text", "- [ ] Task item", "- [x] Done"];
    const result = parseTaskList(lines, 1);
    expect(result).toEqual({
      token: {
        type: "task_list",
        items: [
          { checked: false, content: "Task item" },
          { checked: true, content: "Done" },
        ],
      },
      endIndex: 3,
    });
  });

  it("returns null for empty string", () => {
    const lines = [""];
    expect(parseTaskList(lines, 0)).toBeNull();
  });

  it("handles task items with special characters in content", () => {
    const lines = ["- [ ] Buy **groceries** & `milk`"];
    const result = parseTaskList(lines, 0);
    expect(result!.token).toHaveProperty("items", [
      { checked: false, content: "Buy **groceries** & `milk`" },
    ]);
  });

  it("skips empty lines and continues if next non-empty line is a task item", () => {
    const lines = [
      "- [ ] Task 1",
      "",
      "- [x] Task 2",
    ];
    const result = parseTaskList(lines, 0);
    expect(result!.token).toHaveProperty("items", [
      { checked: false, content: "Task 1" },
      { checked: true, content: "Task 2" },
    ]);
  });

  it("stops at empty line when next non-empty line is not a task item", () => {
    const lines = [
      "- [ ] Task 1",
      "",
      "Regular text",
    ];
    const result = parseTaskList(lines, 0);
    expect(result!.token).toHaveProperty("items", [
      { checked: false, content: "Task 1" },
    ]);
  });
});
