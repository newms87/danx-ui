import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { danxOptions, getDanxOptions, setDanxOptions } from "../config";
import type { DanxOptions } from "../config-types";

describe("config singleton", () => {
  let snapshot: DanxOptions;

  beforeEach(() => {
    snapshot = danxOptions.value;
  });

  afterEach(() => {
    // Restore the module-level singleton between tests.
    danxOptions.value = snapshot;
  });

  it("starts with empty request baseUrl/headers and empty flashMessages", () => {
    danxOptions.value = { request: { baseUrl: "", headers: {} }, flashMessages: {} };
    expect(getDanxOptions()).toEqual({
      request: { baseUrl: "", headers: {} },
      flashMessages: {},
    });
  });

  it("setDanxOptions sets request config", () => {
    setDanxOptions({ request: { baseUrl: "https://api.test", headers: { A: "1" } } });
    expect(getDanxOptions().request).toEqual({ baseUrl: "https://api.test", headers: { A: "1" } });
  });

  it("shallow-merges request without dropping previously-set sibling keys", () => {
    setDanxOptions({ request: { baseUrl: "https://api.test", headers: { A: "1" } } });
    setDanxOptions({ request: { headers: { B: "2" } } });
    // baseUrl preserved, headers replaced wholesale (shallow)
    expect(getDanxOptions().request).toEqual({ baseUrl: "https://api.test", headers: { B: "2" } });
  });

  it("shallow-merges flashMessages config", () => {
    setDanxOptions({ flashMessages: { error: { duration: 1000 } } });
    setDanxOptions({ flashMessages: { success: { duration: 2000 } } });
    expect(getDanxOptions().flashMessages).toEqual({
      error: { duration: 1000 },
      success: { duration: 2000 },
    });
  });

  it("merges onUnauthorized and onAppVersionMismatch handlers", () => {
    const onUnauthorized = () => ({ redirected: true });
    const onAppVersionMismatch = () => undefined;
    setDanxOptions({ request: { onUnauthorized, onAppVersionMismatch } });
    expect(getDanxOptions().request?.onUnauthorized).toBe(onUnauthorized);
    expect(getDanxOptions().request?.onAppVersionMismatch).toBe(onAppVersionMismatch);
  });

  it("getDanxOptions reflects the live ref value", () => {
    setDanxOptions({ request: { baseUrl: "https://live" } });
    expect(getDanxOptions()).toBe(danxOptions.value);
    expect(getDanxOptions().request?.baseUrl).toBe("https://live");
  });
});
