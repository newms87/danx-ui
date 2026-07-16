import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DanxAuditHistoryItem from "../DanxAuditHistoryItem.vue";
import type { AuditHistoryEntry } from "../types";

describe("DanxAuditHistoryItem", () => {
  describe("Actor, action, and timestamp", () => {
    it("renders the actor", () => {
      const wrapper = mount(DanxAuditHistoryItem, {
        props: {
          entry: {
            actor: "Jane Doe",
            timestamp: Date.now(),
            action: "create",
          },
        },
      });

      expect(wrapper.text()).toContain("Jane Doe");
    });

    it("renders the action label", () => {
      const wrapper = mount(DanxAuditHistoryItem, {
        props: {
          entry: { actor: "Jane Doe", timestamp: Date.now(), action: "update" },
        },
      });

      expect(wrapper.text()).toContain("update");
    });

    it("renders a relative timestamp via fTimeAgo", () => {
      const wrapper = mount(DanxAuditHistoryItem, {
        props: {
          entry: { actor: "Jane Doe", timestamp: Date.now(), action: "create" },
        },
      });

      expect(wrapper.find(".danx-audit-history-item__timestamp").text()).toBe("a few seconds ago");
    });

    it("renders an older timestamp as N minutes ago", () => {
      const wrapper = mount(DanxAuditHistoryItem, {
        props: {
          entry: {
            actor: "Jane Doe",
            timestamp: Date.now() - 5 * 60 * 1000,
            action: "create",
          },
        },
      });

      expect(wrapper.find(".danx-audit-history-item__timestamp").text()).toBe("5 minutes ago");
    });
  });

  describe("Action variant coloring", () => {
    it.each([
      ["create", "success"],
      ["update", "info"],
      ["delete", "danger"],
      ["restore", "muted"],
    ])("colors action %s with variant %s", (action, expectedVariant) => {
      const wrapper = mount(DanxAuditHistoryItem, {
        props: {
          entry: { actor: "Jane Doe", timestamp: Date.now(), action },
        },
      });

      const chipStyle = wrapper.find(".danx-audit-history-item__action").attributes("style");
      expect(chipStyle).toContain(`--dx-variant-chip-${expectedVariant}-bg`);
    });

    it("actionVariant prop overrides the automatic action -> variant mapping", () => {
      const wrapper = mount(DanxAuditHistoryItem, {
        props: {
          entry: { actor: "Jane Doe", timestamp: Date.now(), action: "create" },
          actionVariant: "danger",
        },
      });

      const chipStyle = wrapper.find(".danx-audit-history-item__action").attributes("style");
      expect(chipStyle).toContain("--dx-variant-chip-danger-bg");
    });
  });

  describe("Field diff branch", () => {
    const diffEntry: AuditHistoryEntry = {
      actor: "Jane Doe",
      timestamp: Date.now(),
      action: "update",
      field: "status",
      oldValue: "Draft",
      newValue: "Published",
    };

    it("renders the field name", () => {
      const wrapper = mount(DanxAuditHistoryItem, { props: { entry: diffEntry } });

      expect(wrapper.find(".danx-audit-history-item__field").text()).toBe("status");
    });

    it("renders the old value struck through and the new value", () => {
      const wrapper = mount(DanxAuditHistoryItem, { props: { entry: diffEntry } });

      expect(wrapper.find(".danx-audit-history-item__old").text()).toBe("Draft");
      expect(wrapper.find(".danx-audit-history-item__new").text()).toBe("Published");
    });

    it("does not render the description fallback when a field diff is present", () => {
      const wrapper = mount(DanxAuditHistoryItem, {
        props: { entry: { ...diffEntry, description: "should not show" } },
      });

      expect(wrapper.text()).not.toContain("should not show");
    });
  });

  describe("Fallback/no-field branch", () => {
    it("renders the description prop when no field is set", () => {
      const wrapper = mount(DanxAuditHistoryItem, {
        props: {
          entry: {
            actor: "Jane Doe",
            timestamp: Date.now(),
            action: "create",
            description: "created this record",
          },
        },
      });

      expect(wrapper.text()).toContain("created this record");
      expect(wrapper.find(".danx-audit-history-item__field").exists()).toBe(false);
    });

    it("renders nothing extra when neither field nor description is set", () => {
      const wrapper = mount(DanxAuditHistoryItem, {
        props: {
          entry: { actor: "Jane Doe", timestamp: Date.now(), action: "create" },
        },
      });

      expect(wrapper.find(".danx-audit-history-item__body").text()).toBe("");
    });

    it("default slot overrides the description fallback and receives the entry", () => {
      const wrapper = mount(DanxAuditHistoryItem, {
        props: {
          entry: {
            actor: "Jane Doe",
            timestamp: Date.now(),
            action: "create",
            description: "created this record",
          },
        },
        slots: {
          default: ({ entry }: { entry: AuditHistoryEntry }) => `custom: ${entry.actor}`,
        },
      });

      expect(wrapper.text()).toContain("custom: Jane Doe");
      expect(wrapper.text()).not.toContain("created this record");
    });
  });
});
