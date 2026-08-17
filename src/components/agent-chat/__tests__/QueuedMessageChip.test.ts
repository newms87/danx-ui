import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import QueuedMessageChip from "../QueuedMessageChip.vue";

describe("QueuedMessageChip", () => {
  it("renders the given text", () => {
    const w = mount(QueuedMessageChip, { props: { text: "primary US numbers" } });
    expect(w.text()).toContain("primary US numbers");
  });
});
