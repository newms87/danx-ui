import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DanxTable from "../DanxTable.vue";
import type { TableColumn, TableSort } from "../types";

const COLUMNS: TableColumn[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "email", label: "Email" },
  { key: "role", label: "Role", align: "center", width: "8rem" },
];

const ROWS = [
  { id: "1", name: "Alice", email: "alice@example.com", role: "Admin" },
  { id: "2", name: "Bob", email: "bob@example.com", role: "Member" },
];

function mountTable(props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
  return mount(DanxTable, {
    props: { columns: COLUMNS, rows: ROWS, rowKey: "id", ...props },
    ...options,
  });
}

describe("DanxTable rendering", () => {
  it("renders a header cell per column", () => {
    const wrapper = mountTable();
    const headers = wrapper.findAll(".danx-table__header").map((h) => h.text());
    expect(headers).toEqual(["Name", "Email", "Role"]);
  });

  it("renders a row per data item, keyed by rowKey", () => {
    const wrapper = mountTable();
    expect(wrapper.findAll(".danx-table__row")).toHaveLength(2);
  });

  it("renders each cell's raw value by default", () => {
    const wrapper = mountTable();
    expect(wrapper.text()).toContain("Alice");
    expect(wrapper.text()).toContain("alice@example.com");
  });

  it("applies the column width style", () => {
    const wrapper = mountTable();
    const roleHeader = wrapper.findAll(".danx-table__header")[2]!;
    expect(roleHeader.attributes("style")).toContain("width: 8rem");
  });

  it("applies the column align class to header and cells", () => {
    const wrapper = mountTable();
    const roleHeader = wrapper.findAll(".danx-table__header")[2]!;
    expect(roleHeader.classes()).toContain("is-align-center");
    const roleCell = wrapper.findAll(".danx-table__cell")[2]!;
    expect(roleCell.classes()).toContain("is-align-center");
  });

  it("defaults align to left", () => {
    const wrapper = mountTable();
    const nameHeader = wrapper.findAll(".danx-table__header")[0]!;
    expect(nameHeader.classes()).toContain("is-align-left");
  });

  it("shows the default empty state when there are no rows", () => {
    const wrapper = mountTable({ rows: [] });
    expect(wrapper.find(".danx-table__empty").exists()).toBe(true);
    expect(wrapper.text()).toContain("No data to display");
    expect(wrapper.find(".danx-table__table").exists()).toBe(false);
  });

  it("renders a custom empty slot", () => {
    const wrapper = mountTable({ rows: [] }, { slots: { empty: "<span>Nothing here</span>" } });
    expect(wrapper.text()).toContain("Nothing here");
  });
});

describe("DanxTable interaction", () => {
  it("emits rowClick with the clicked row", async () => {
    const wrapper = mountTable();
    await wrapper.findAll(".danx-table__row")[1]!.trigger("click");
    expect(wrapper.emitted("rowClick")).toBeTruthy();
    expect(wrapper.emitted("rowClick")![0]![0]).toEqual(ROWS[1]);
  });

  it("does not emit sort when clicking a non-sortable header", async () => {
    const wrapper = mountTable();
    await wrapper.findAll(".danx-table__header")[1]!.trigger("click");
    expect(wrapper.emitted("sort")).toBeFalsy();
  });

  it("emits sort with asc direction when a sortable header is first clicked", async () => {
    const wrapper = mountTable();
    await wrapper.findAll(".danx-table__header")[0]!.trigger("click");
    expect(wrapper.emitted("sort")).toBeTruthy();
    expect(wrapper.emitted("sort")![0]![0]).toEqual({ key: "name", direction: "asc" });
  });

  it("emits sort with desc direction when the active asc column is clicked again", async () => {
    const sort: TableSort = { key: "name", direction: "asc" };
    const wrapper = mountTable({ sort });
    await wrapper.findAll(".danx-table__header")[0]!.trigger("click");
    expect(wrapper.emitted("sort")![0]![0]).toEqual({ key: "name", direction: "desc" });
  });

  it("resets to asc when a different column becomes sortable-active", async () => {
    const columns: TableColumn[] = [
      { key: "name", label: "Name", sortable: true },
      { key: "role", label: "Role", sortable: true },
    ];
    const sort: TableSort = { key: "role", direction: "desc" };
    const wrapper = mountTable({ columns, sort });
    await wrapper.findAll(".danx-table__header")[0]!.trigger("click");
    expect(wrapper.emitted("sort")![0]![0]).toEqual({ key: "name", direction: "asc" });
  });
});

describe("DanxTable sort indicator", () => {
  it("marks a sortable header with is-sortable", () => {
    const wrapper = mountTable();
    expect(wrapper.findAll(".danx-table__header")[0]!.classes()).toContain("is-sortable");
  });

  it("does not mark a non-sortable header with is-sortable", () => {
    const wrapper = mountTable();
    expect(wrapper.findAll(".danx-table__header")[1]!.classes()).not.toContain("is-sortable");
  });

  it("shows no sort icon when the column is not the active sort", () => {
    const wrapper = mountTable();
    expect(wrapper.find(".danx-table__sort-icon").exists()).toBe(false);
  });

  it("shows an ascending indicator and aria-sort when active asc", () => {
    const sort: TableSort = { key: "name", direction: "asc" };
    const wrapper = mountTable({ sort });
    const header = wrapper.findAll(".danx-table__header")[0]!;
    expect(header.find(".danx-table__sort-icon").exists()).toBe(true);
    expect(header.attributes("aria-sort")).toBe("ascending");
  });

  it("shows a descending indicator and aria-sort when active desc", () => {
    const sort: TableSort = { key: "name", direction: "desc" };
    const wrapper = mountTable({ sort });
    const header = wrapper.findAll(".danx-table__header")[0]!;
    expect(header.find(".danx-table__sort-icon").exists()).toBe(true);
    expect(header.attributes("aria-sort")).toBe("descending");
  });

  it("sets aria-sort to none on a header that isn't the active sort", () => {
    const sort: TableSort = { key: "name", direction: "asc" };
    const wrapper = mountTable({ sort });
    const emailHeader = wrapper.findAll(".danx-table__header")[1]!;
    expect(emailHeader.attributes("aria-sort")).toBe("none");
  });
});

describe("DanxTable slots", () => {
  it("renders a custom #cell-{key} slot with row/column/value bindings", () => {
    const wrapper = mountTable(
      {},
      {
        slots: {
          "cell-role": `<template #cell-role="{ row, column, value }"><span class="custom-cell">{{ row.name }}-{{ column.key }}-{{ value }}</span></template>`,
        },
      }
    );
    expect(wrapper.find(".custom-cell").text()).toBe("Alice-role-Admin");
  });

  it("falls back to the raw value when no #cell-{key} slot is provided", () => {
    const wrapper = mountTable();
    expect(wrapper.text()).toContain("Admin");
  });

  it("renders a custom #header-{key} slot with column bindings", () => {
    const wrapper = mountTable(
      {},
      {
        slots: {
          "header-role": `<template #header-role="{ column }"><span class="custom-header">{{ column.label }}!</span></template>`,
        },
      }
    );
    expect(wrapper.find(".custom-header").text()).toBe("Role!");
  });

  it("falls back to column.label when no #header-{key} slot is provided", () => {
    const wrapper = mountTable();
    expect(wrapper.findAll(".danx-table__header")[2]!.text()).toContain("Role");
  });
});
