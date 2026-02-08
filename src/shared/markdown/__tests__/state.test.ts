import { describe, it, expect, beforeEach } from "vitest";
import { getFootnotes, getLinkRefs, setLinkRef, setFootnote, resetParserState } from "../state";

describe("parser state", () => {
  beforeEach(() => {
    resetParserState();
  });

  describe("initial state", () => {
    it("getFootnotes returns an empty object", () => {
      expect(getFootnotes()).toEqual({});
    });

    it("getLinkRefs returns an empty object", () => {
      expect(getLinkRefs()).toEqual({});
    });
  });

  describe("setLinkRef", () => {
    it("stores a link reference retrievable by getLinkRefs", () => {
      setLinkRef("example", { url: "https://example.com" });
      const refs = getLinkRefs();
      expect(refs["example"]).toEqual({ url: "https://example.com" });
    });

    it("stores a link reference with a title", () => {
      setLinkRef("example", { url: "https://example.com", title: "Example Site" });
      const refs = getLinkRefs();
      expect(refs["example"]).toEqual({ url: "https://example.com", title: "Example Site" });
    });

    it("stores multiple link references", () => {
      setLinkRef("one", { url: "https://one.com" });
      setLinkRef("two", { url: "https://two.com", title: "Two" });
      const refs = getLinkRefs();
      expect(Object.keys(refs).length).toBe(2);
      expect(refs["one"]).toEqual({ url: "https://one.com" });
      expect(refs["two"]).toEqual({ url: "https://two.com", title: "Two" });
    });

    it("overwrites an existing link reference with the same id", () => {
      setLinkRef("dup", { url: "https://old.com" });
      setLinkRef("dup", { url: "https://new.com" });
      const refs = getLinkRefs();
      expect(refs["dup"]).toEqual({ url: "https://new.com" });
    });
  });

  describe("setFootnote", () => {
    it("stores a footnote with auto-incrementing index starting at 1", () => {
      setFootnote("fn1", "First footnote content");
      const footnotes = getFootnotes();
      expect(footnotes["fn1"]).toEqual({ content: "First footnote content", index: 1 });
    });

    it("assigns sequential indices to multiple footnotes", () => {
      setFootnote("a", "First");
      setFootnote("b", "Second");
      setFootnote("c", "Third");
      const footnotes = getFootnotes();
      expect(footnotes["a"]!.index).toBe(1);
      expect(footnotes["b"]!.index).toBe(2);
      expect(footnotes["c"]!.index).toBe(3);
    });

    it("stores the content for each footnote", () => {
      setFootnote("x", "Content X");
      setFootnote("y", "Content Y");
      const footnotes = getFootnotes();
      expect(footnotes["x"]!.content).toBe("Content X");
      expect(footnotes["y"]!.content).toBe("Content Y");
    });

    it("overwrites an existing footnote but increments the counter", () => {
      setFootnote("dup", "Original");
      setFootnote("dup", "Replaced");
      const footnotes = getFootnotes();
      expect(footnotes["dup"]).toEqual({ content: "Replaced", index: 2 });
    });
  });

  describe("resetParserState", () => {
    it("clears all link references", () => {
      setLinkRef("ref1", { url: "https://example.com" });
      setLinkRef("ref2", { url: "https://other.com" });
      resetParserState();
      expect(getLinkRefs()).toEqual({});
    });

    it("clears all footnotes", () => {
      setFootnote("fn1", "Content 1");
      setFootnote("fn2", "Content 2");
      resetParserState();
      expect(getFootnotes()).toEqual({});
    });

    it("resets the footnote counter so next footnote starts at 1", () => {
      setFootnote("first", "First run");
      setFootnote("second", "Second run");
      expect(getFootnotes()["second"]!.index).toBe(2);

      resetParserState();

      setFootnote("after-reset", "After reset");
      expect(getFootnotes()["after-reset"]!.index).toBe(1);
    });

    it("allows re-populating state after reset", () => {
      setLinkRef("ref", { url: "https://old.com" });
      setFootnote("fn", "Old footnote");
      resetParserState();

      setLinkRef("new-ref", { url: "https://new.com" });
      setFootnote("new-fn", "New footnote");

      expect(getLinkRefs()).toEqual({ "new-ref": { url: "https://new.com" } });
      expect(getFootnotes()).toEqual({ "new-fn": { content: "New footnote", index: 1 } });
    });
  });

  describe("cross-test isolation via beforeEach", () => {
    it("first test adds state", () => {
      setLinkRef("isolated", { url: "https://test.com" });
      setFootnote("iso-fn", "Isolated footnote");
      expect(Object.keys(getLinkRefs()).length).toBe(1);
      expect(Object.keys(getFootnotes()).length).toBe(1);
    });

    it("second test has clean state due to beforeEach reset", () => {
      expect(getLinkRefs()).toEqual({});
      expect(getFootnotes()).toEqual({});
    });
  });
});
