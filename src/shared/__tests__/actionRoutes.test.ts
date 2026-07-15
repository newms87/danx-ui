import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import { useActionRoutes } from "../actionRoutes";
import { removeObjectFromLists } from "../objectStore";
import { request } from "../request";
import type { ListControlsRoutes } from "../action-types";
import type { TypedObject } from "../store-types";

describe("useActionRoutes", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("list posts to <base>/list, stores items, and returns shared instances", async () => {
    const post = vi.spyOn(request, "post").mockResolvedValue({
      data: [{ id: 1, __type: "User", __timestamp: 1 }],
      meta: { total: 1 },
    });
    const routes = useActionRoutes("/api/users");
    const response = await routes.list({ page: 1 });
    expect(post).toHaveBeenCalledWith(
      "/api/users/list",
      { page: 1 },
      expect.objectContaining({ ignoreAbort: true })
    );
    expect(response.data?.[0]?.__id).toBeTypeOf("string"); // stored
  });

  it("list tolerates a response without data", async () => {
    vi.spyOn(request, "post").mockResolvedValue({ data: undefined, meta: undefined });
    const routes = useActionRoutes("/api/users");
    const response = await routes.list();
    expect(response.data).toBeUndefined();
  });

  it("summary posts the filter with ignoreAbort", async () => {
    const post = vi.spyOn(request, "post").mockResolvedValue({ count: 3 });
    const routes = useActionRoutes("/api/users");
    await routes.summary!({ active: true });
    expect(post).toHaveBeenCalledWith(
      "/api/users/summary",
      { filter: { active: true } },
      expect.objectContaining({ ignoreAbort: true })
    );
  });

  it("details gets the item and stores it; fields are forwarded as params", async () => {
    const get = vi
      .spyOn(request, "get")
      .mockResolvedValue({ id: 5, __type: "User", __timestamp: 1 });
    const routes = useActionRoutes("/api/users");
    const item = await routes.details!({ id: 5, __type: "User" }, { name: true });
    expect(get).toHaveBeenCalledWith(
      "/api/users/5/details",
      expect.objectContaining({ params: { fields: { name: true } } })
    );
    expect(item.__id).toBeTypeOf("string");
  });

  it("details works without fields", async () => {
    const get = vi
      .spyOn(request, "get")
      .mockResolvedValue({ id: 6, __type: "User", __timestamp: 1 });
    const routes = useActionRoutes("/api/users");
    await routes.details!({ id: 6, __type: "User" });
    const options = get.mock.calls[0]![1] as Record<string, unknown>;
    expect(options.params).toBeUndefined();
  });

  it("fieldOptions gets the field-options route", async () => {
    const get = vi.spyOn(request, "get").mockResolvedValue({ status: ["a", "b"] });
    const routes = useActionRoutes("/api/users");
    await routes.fieldOptions!();
    expect(get).toHaveBeenCalledWith("/api/users/field-options", undefined);
  });

  it("applyAction posts apply-action with the timestamp header and stores item/result", async () => {
    const post = vi.spyOn(request, "post").mockResolvedValue({
      item: { id: 1, __type: "User", __timestamp: 1 },
      result: { id: 2, __type: "Other", __timestamp: 1 },
      success: true,
    });
    const routes = useActionRoutes("/api/users");
    const response = await routes.applyAction!(
      "update",
      { id: 1, __type: "User" },
      { name: "Ada" }
    );
    const [url, body, options] = post.mock.calls[0]!;
    expect(url).toBe("/api/users/1/apply-action");
    expect(body).toEqual({ action: "update", data: { name: "Ada" } });
    expect((options as Record<string, unknown>).waitOnPrevious).toBe(true);
    expect((options as Record<string, unknown>).useMostRecentResponse).toBe(true);
    expect((options as { headers: Record<string, string> }).headers["X-Timestamp"]).toBeTypeOf(
      "string"
    );
    expect(response.item?.__id).toBeTypeOf("string");
    expect((response.result as { __id?: string }).__id).toBeTypeOf("string");
  });

  it("applyAction omits the id segment when target is null and defaults data", async () => {
    const post = vi.spyOn(request, "post").mockResolvedValue({ success: true });
    const routes = useActionRoutes("/api/users");
    await routes.applyAction!("bulk", null);
    const [url, body] = post.mock.calls[0]!;
    expect(url).toBe("/api/users/apply-action");
    expect(body).toEqual({ action: "bulk", data: {} });
  });

  it("applyAction leaves a non-typed result untouched", async () => {
    vi.spyOn(request, "post").mockResolvedValue({ result: { plain: true } });
    const routes = useActionRoutes("/api/users");
    const response = await routes.applyAction!("noop", null);
    expect(response.result).toEqual({ plain: true });
  });

  it("batchAction posts the id filter with waitOnPrevious", async () => {
    const post = vi.spyOn(request, "post").mockResolvedValue({ success: true });
    const routes = useActionRoutes("/api/users");
    await routes.batchAction!(
      "delete",
      [
        { id: 1, __type: "User" },
        { id: 2, __type: "User" },
      ],
      { force: true }
    );
    expect(post).toHaveBeenCalledWith(
      "/api/users/batch-action",
      { action: "delete", filter: { id: [1, 2] }, data: { force: true } },
      expect.objectContaining({ waitOnPrevious: true })
    );
  });

  it("merges extend routes over the defaults", async () => {
    const customExport: ListControlsRoutes["export"] = vi.fn(async () => undefined);
    const routes = useActionRoutes("/api/users", { export: customExport });
    expect(routes.export).toBe(customExport);
  });

  it("unregisters the list ref on component unmount, so later deletes no longer splice it", async () => {
    vi.spyOn(request, "post").mockResolvedValue({
      data: [{ id: 1, __type: "User", __timestamp: 1 }],
      meta: { total: 1 },
    });

    let listValue: TypedObject[] = [];
    const wrapper = mount(
      defineComponent({
        setup() {
          const routes = useActionRoutes<TypedObject>("/api/users");
          return { routes };
        },
        render() {
          return h("div");
        },
      })
    );
    const routes = (wrapper.vm as unknown as { routes: ListControlsRoutes<TypedObject> }).routes;
    const response = await routes.list();
    listValue = response.data as TypedObject[];
    expect(listValue).toHaveLength(1);

    wrapper.unmount();

    removeObjectFromLists(listValue[0]!);
    expect(listValue).toHaveLength(1);
  });

  it("dispose() unregisters the list ref for non-component call sites", async () => {
    vi.spyOn(request, "post").mockResolvedValue({
      data: [{ id: 2, __type: "User", __timestamp: 1 }],
      meta: { total: 1 },
    });
    const routes = useActionRoutes<TypedObject>("/api/users");
    const response = await routes.list();
    const listValue = response.data as TypedObject[];
    expect(listValue).toHaveLength(1);

    routes.dispose!();

    removeObjectFromLists(listValue[0]!);
    expect(listValue).toHaveLength(1);

    // Idempotent — Set#delete on a missing entry is a no-op, must not throw.
    expect(() => routes.dispose!()).not.toThrow();
  });
});
