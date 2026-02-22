import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ref } from "vue";
import { hashStringToIndex, useAutoColor, AUTO_COLOR_PALETTE } from "../autoColor";

describe("hashStringToIndex", () => {
  it("returns consistent index for same input", () => {
    const a = hashStringToIndex("Pending", 28);
    const b = hashStringToIndex("Pending", 28);
    expect(a).toBe(b);
  });

  it("returns index in range [0, count)", () => {
    for (const str of [
      "Pending",
      "Approved",
      "Rejected",
      "",
      "x",
      "A very long string value here",
    ]) {
      const idx = hashStringToIndex(str, 28);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(28);
    }
  });

  it("returns deterministic index for empty string", () => {
    // FNV-1a offset basis through murmur3 finalizer, mod 28
    expect(hashStringToIndex("", 28)).toBe(11);
  });

  it("produces different indices for different strings", () => {
    const strings = [
      "Pending",
      "Approved",
      "Rejected",
      "Draft",
      "Published",
      "Archived",
      "In Review",
    ];
    const indices = strings.map((s) => hashStringToIndex(s, 28));
    const unique = new Set(indices);
    // With 7 strings and 28 buckets, we expect at least 3 distinct values
    expect(unique.size).toBeGreaterThanOrEqual(3);
  });

  it("works with count of 1", () => {
    expect(hashStringToIndex("anything", 1)).toBe(0);
  });
});

describe("hashStringToIndex distribution", () => {
  /**
   * Generate a large corpus of realistic words/phrases and verify that
   * hashStringToIndex distributes them evenly across all 28 palette buckets.
   * Tolerance: no bucket may deviate more than ±5% from the median count.
   *
   * Uses combinatorial word lists (adjective+noun, verb+noun, name+status, etc.)
   * to produce 150,000+ distinct strings that mimic real-world auto-color inputs.
   * The large corpus ensures statistical fluctuation stays within ±5%.
   */
  it("distributes 150,000 words evenly across all 28 buckets (±5% tolerance from median)", () => {
    // Word pools for generating diverse combinations
    const adjectives = [
      "big",
      "small",
      "fast",
      "slow",
      "new",
      "old",
      "hot",
      "cold",
      "red",
      "blue",
      "dark",
      "light",
      "good",
      "bad",
      "long",
      "short",
      "wide",
      "thin",
      "deep",
      "flat",
      "soft",
      "hard",
      "dry",
      "wet",
      "raw",
      "rich",
      "poor",
      "safe",
      "wild",
      "calm",
      "bold",
      "bright",
      "clean",
      "crisp",
      "dull",
      "eager",
      "fair",
      "fresh",
      "grand",
      "keen",
    ]; // 40

    const nouns = [
      "cat",
      "dog",
      "car",
      "box",
      "cup",
      "key",
      "map",
      "pen",
      "bag",
      "hat",
      "book",
      "door",
      "fish",
      "lamp",
      "moon",
      "ring",
      "ship",
      "tree",
      "wall",
      "bell",
      "bird",
      "cake",
      "coin",
      "drum",
      "flag",
      "gift",
      "hill",
      "iron",
      "jade",
      "knot",
      "lake",
      "mask",
      "nest",
      "opal",
      "pool",
      "quiz",
      "rope",
      "seed",
      "tile",
      "vine",
    ]; // 40

    const verbs = [
      "run",
      "jump",
      "swim",
      "walk",
      "fly",
      "climb",
      "push",
      "pull",
      "read",
      "write",
      "sing",
      "dance",
      "cook",
      "draw",
      "play",
      "build",
      "break",
      "shake",
      "throw",
      "catch",
      "spin",
      "lift",
      "drop",
      "fold",
      "pour",
      "mix",
      "chop",
      "wrap",
      "peel",
      "slice",
    ]; // 30

    const statuses = [
      "Pending",
      "Approved",
      "Rejected",
      "Draft",
      "Published",
      "Archived",
      "In Review",
      "Completed",
      "Cancelled",
      "On Hold",
      "Active",
      "Inactive",
      "New",
      "Open",
      "Closed",
      "Resolved",
      "Blocked",
      "Deferred",
      "Scheduled",
      "Running",
      "Paused",
      "Failed",
      "Success",
      "Warning",
      "Error",
      "Critical",
      "Low",
      "Medium",
      "High",
      "Urgent",
      "None",
      "Default",
      "Custom",
      "Ready",
    ]; // 34

    const names = [
      "Alice",
      "Bob",
      "Charlie",
      "Diana",
      "Eve",
      "Frank",
      "Grace",
      "Henry",
      "Iris",
      "Jack",
      "Kate",
      "Leo",
      "Mia",
      "Noah",
      "Olivia",
      "Peter",
      "Quinn",
      "Rosa",
      "Sam",
      "Tina",
      "Uma",
      "Victor",
      "Wendy",
      "Xander",
      "Yara",
      "Zoe",
      "Adam",
      "Beth",
      "Carl",
      "Dora",
      "Eric",
      "Fiona",
      "Gwen",
      "Hugo",
      "Isla",
      "Joel",
      "Kira",
      "Luke",
      "Nora",
      "Owen",
    ]; // 40

    const categories = [
      "Technology",
      "Science",
      "Art",
      "Music",
      "Sports",
      "Health",
      "Finance",
      "Education",
      "Travel",
      "Food",
      "Fashion",
      "Nature",
      "History",
      "Culture",
      "Politics",
      "Business",
      "Entertainment",
      "Gaming",
      "Photography",
      "Design",
      "Engineering",
      "Marketing",
      "Sales",
      "Support",
      "Legal",
      "HR",
      "Operations",
      "Research",
      "Analytics",
      "Security",
      "DevOps",
      "Testing",
      "Billing",
      "Shipping",
    ]; // 34

    const colors = [
      "red",
      "orange",
      "yellow",
      "green",
      "blue",
      "indigo",
      "violet",
      "pink",
      "brown",
      "gray",
      "white",
      "black",
      "gold",
      "silver",
      "teal",
      "coral",
      "navy",
      "maroon",
      "olive",
      "cyan",
      "magenta",
      "tan",
      "plum",
      "mint",
    ]; // 24

    const places = [
      "Tokyo",
      "Paris",
      "London",
      "Berlin",
      "Sydney",
      "Cairo",
      "Lima",
      "Oslo",
      "Rome",
      "Delhi",
      "Seoul",
      "Lisbon",
      "Prague",
      "Dublin",
      "Vienna",
      "Zurich",
      "Milan",
      "Athens",
      "Warsaw",
      "Boston",
      "Denver",
      "Austin",
      "Portland",
      "Memphis",
    ]; // 24

    const words = new Set<string>();

    // Standalone words from every pool (~266)
    for (const pool of [adjectives, nouns, verbs, statuses, names, categories, colors, places]) {
      for (const w of pool) words.add(w);
    }

    // adjective + noun (40×40 = 1,600)
    for (const adj of adjectives) {
      for (const noun of nouns) words.add(`${adj} ${noun}`);
    }

    // verb + noun (30×40 = 1,200)
    for (const verb of verbs) {
      for (const noun of nouns) words.add(`${verb} ${noun}`);
    }

    // name + status (40×34 = 1,360)
    for (const name of names) {
      for (const status of statuses) words.add(`${name} ${status}`);
    }

    // category + color (34×24 = 816)
    for (const cat of categories) {
      for (const color of colors) words.add(`${cat} ${color}`);
    }

    // place + category (24×34 = 816)
    for (const place of places) {
      for (const cat of categories) words.add(`${place} ${cat}`);
    }

    // color + noun (24×40 = 960)
    for (const color of colors) {
      for (const noun of nouns) words.add(`${color} ${noun}`);
    }

    // adjective + noun + verb — three-word phrases (40×40×30 = 48,000)
    for (const adj of adjectives) {
      for (const noun of nouns) {
        for (const verb of verbs) words.add(`${adj} ${noun} ${verb}`);
      }
    }

    // verb + adjective + noun — different word order (30×40×40 = 48,000)
    for (const verb of verbs) {
      for (const adj of adjectives) {
        for (const noun of nouns) words.add(`${verb} ${adj} ${noun}`);
      }
    }

    // name + category + color (40×34×24 = 32,640)
    for (const name of names) {
      for (const cat of categories) {
        for (const color of colors) words.add(`${name} ${cat} ${color}`);
      }
    }

    // place + name + status (24×40×34 = 32,640)
    for (const place of places) {
      for (const name of names) {
        for (const status of statuses) words.add(`${place} ${name} ${status}`);
      }
    }

    // Use all generated unique strings (150K+)
    const uniqueWords = [...words];
    expect(uniqueWords.length).toBeGreaterThanOrEqual(150_000);

    // Count how many strings land in each bucket
    const bucketCount = AUTO_COLOR_PALETTE.length; // 28
    const buckets = new Array(bucketCount).fill(0) as number[];

    for (const word of uniqueWords) {
      const idx = hashStringToIndex(word, bucketCount);
      buckets[idx]++;
    }

    // Calculate median
    const sorted = [...buckets].sort((a, b) => a - b);
    const median =
      sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1]! + sorted[sorted.length / 2]!) / 2
        : sorted[Math.floor(sorted.length / 2)]!;

    // Every bucket must be within ±5% of the median
    const tolerance = 0.05;
    const lowerBound = median * (1 - tolerance);
    const upperBound = median * (1 + tolerance);

    const distribution = buckets.map((count, i) => ({
      bucket: i,
      count,
      pctFromMedian: (((count - median) / median) * 100).toFixed(1) + "%",
    }));

    for (const { bucket, count, pctFromMedian } of distribution) {
      expect(
        count,
        `Bucket ${bucket} has ${count} items (${pctFromMedian} from median ${median}). ` +
          `Expected ${lowerBound.toFixed(1)}–${upperBound.toFixed(1)}. ` +
          `Full distribution: ${buckets.join(", ")}`
      ).toBeGreaterThanOrEqual(lowerBound);
      expect(
        count,
        `Bucket ${bucket} has ${count} items (${pctFromMedian} from median ${median}). ` +
          `Expected ${lowerBound.toFixed(1)}–${upperBound.toFixed(1)}. ` +
          `Full distribution: ${buckets.join(", ")}`
      ).toBeLessThanOrEqual(upperBound);
    }
  });
});

describe("AUTO_COLOR_PALETTE", () => {
  it("has 28 entries (14 standard + 14 deep)", () => {
    expect(AUTO_COLOR_PALETTE).toHaveLength(28);
  });

  it("each entry has bg, text, darkBg, darkText as var() references", () => {
    for (const entry of AUTO_COLOR_PALETTE) {
      expect(entry.bg).toMatch(/^var\(--color-.+-\d+\)$/);
      expect(entry.text).toMatch(/^var\(--color-.+-\d+\)$/);
      expect(entry.darkBg).toMatch(/^var\(--color-.+-\d+\)$/);
      expect(entry.darkText).toMatch(/^var\(--color-.+-\d+\)$/);
    }
  });

  it("each entry has inactiveBg, inactiveText, darkInactiveBg, darkInactiveText as var() references", () => {
    for (const entry of AUTO_COLOR_PALETTE) {
      expect(entry.inactiveBg).toMatch(/^var\(--color-.+-\d+\)$/);
      expect(entry.inactiveText).toMatch(/^var\(--color-.+-\d+\)$/);
      expect(entry.darkInactiveBg).toMatch(/^var\(--color-.+-\d+\)$/);
      expect(entry.darkInactiveText).toMatch(/^var\(--color-.+-\d+\)$/);
    }
  });

  it("standard entries (even indices) use shade-100 bg and shade-700 text", () => {
    for (let i = 0; i < AUTO_COLOR_PALETTE.length; i += 2) {
      const entry = AUTO_COLOR_PALETTE[i]!;
      expect(entry.bg).toMatch(/-100\)$/);
      expect(entry.text).toMatch(/-700\)$/);
      expect(entry.darkBg).toMatch(/-400\)$/);
      expect(entry.darkText).toMatch(/-900\)$/);
    }
  });

  it("deep entries (odd indices) use shade-300 bg and shade-900 text", () => {
    for (let i = 1; i < AUTO_COLOR_PALETTE.length; i += 2) {
      const entry = AUTO_COLOR_PALETTE[i]!;
      expect(entry.bg).toMatch(/-300\)$/);
      expect(entry.text).toMatch(/-900\)$/);
      expect(entry.darkBg).toMatch(/-500\)$/);
      expect(entry.darkText).toMatch(/-950\)$/);
    }
  });

  it("standard entries (even indices) use correct inactive shades", () => {
    for (let i = 0; i < AUTO_COLOR_PALETTE.length; i += 2) {
      const entry = AUTO_COLOR_PALETTE[i]!;
      expect(entry.inactiveBg).toMatch(/-50\)$/);
      expect(entry.inactiveText).toMatch(/-400\)$/);
      expect(entry.darkInactiveBg).toMatch(/-950\)$/);
      expect(entry.darkInactiveText).toMatch(/-500\)$/);
    }
  });

  it("deep entries (odd indices) use correct inactive shades", () => {
    for (let i = 1; i < AUTO_COLOR_PALETTE.length; i += 2) {
      const entry = AUTO_COLOR_PALETTE[i]!;
      expect(entry.inactiveBg).toMatch(/-200\)$/);
      expect(entry.inactiveText).toMatch(/-600\)$/);
      expect(entry.darkInactiveBg).toMatch(/-900\)$/);
      expect(entry.darkInactiveText).toMatch(/-600\)$/);
    }
  });

  it("standard and deep entries for same family share the color name", () => {
    for (let i = 0; i < AUTO_COLOR_PALETTE.length; i += 2) {
      const standard = AUTO_COLOR_PALETTE[i]!;
      const deep = AUTO_COLOR_PALETTE[i + 1]!;
      // Extract color name from bg var (e.g., "sky" from "var(--color-sky-100)")
      const standardName = standard.bg.match(/--color-(.+)-\d+/)?.[1];
      const deepName = deep.bg.match(/--color-(.+)-\d+/)?.[1];
      expect(standardName).toBeTruthy();
      expect(standardName).toBe(deepName);
    }
  });
});

describe("useAutoColor", () => {
  beforeEach(() => {
    // Ensure light mode for consistent tests
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    document.documentElement.classList.remove("dark");
  });

  it("returns style with --dx-chip-bg and --dx-chip-text keys", () => {
    const { style } = useAutoColor("Pending");
    expect(style.value).toHaveProperty("--dx-chip-bg");
    expect(style.value).toHaveProperty("--dx-chip-text");
  });

  it("returns only CSS custom properties (no direct background/color)", () => {
    const { style } = useAutoColor("Pending");
    expect(style.value).not.toHaveProperty("background");
    expect(style.value).not.toHaveProperty("color");
  });

  it("same value always produces same style", () => {
    const a = useAutoColor("Approved");
    const b = useAutoColor("Approved");
    expect(a.style.value).toEqual(b.style.value);
  });

  it("different values produce different styles", () => {
    const a = useAutoColor("Pending");
    const b = useAutoColor("Approved");
    // These hash to different indices, so styles differ
    expect(a.colorIndex.value).not.toBe(b.colorIndex.value);
    expect(a.style.value).not.toEqual(b.style.value);
  });

  it("colorIndex is in range 0..27", () => {
    for (const label of ["Pending", "Approved", "Rejected", "Draft", ""]) {
      const { colorIndex } = useAutoColor(label);
      expect(colorIndex.value).toBeGreaterThanOrEqual(0);
      expect(colorIndex.value).toBeLessThanOrEqual(27);
    }
  });

  it("uses light-mode colors when dark class is absent", () => {
    const { style, colorIndex } = useAutoColor("Test");
    const entry = AUTO_COLOR_PALETTE[colorIndex.value]!;
    expect(style.value["--dx-chip-bg" as keyof typeof style.value]).toBe(entry.bg);
    expect(style.value["--dx-chip-text" as keyof typeof style.value]).toBe(entry.text);
  });

  it("uses dark-mode colors when dark class is present", () => {
    document.documentElement.classList.add("dark");
    const { style, colorIndex } = useAutoColor("Test");
    const entry = AUTO_COLOR_PALETTE[colorIndex.value]!;
    expect(style.value["--dx-chip-bg" as keyof typeof style.value]).toBe(entry.darkBg);
    expect(style.value["--dx-chip-text" as keyof typeof style.value]).toBe(entry.darkText);
  });

  it("accepts a getter function", () => {
    const { colorIndex, style } = useAutoColor(() => "Pending");
    expect(colorIndex.value).toBe(hashStringToIndex("Pending", AUTO_COLOR_PALETTE.length));
    expect(style.value).toHaveProperty("--dx-chip-bg");
  });

  it("reacts to ref changes", () => {
    const label = ref("Pending");
    const { colorIndex: idxA } = useAutoColor(label);
    const firstIndex = idxA.value;

    label.value = "Draft";
    // After changing the ref, colorIndex should update
    expect(idxA.value).toBe(hashStringToIndex("Draft", AUTO_COLOR_PALETTE.length));
    // Ensure it actually changed (these strings hash differently)
    expect(idxA.value).not.toBe(firstIndex);
  });

  describe("inactiveStyle", () => {
    it("returns inactiveStyle with --dx-chip-bg and --dx-chip-text keys", () => {
      const { inactiveStyle } = useAutoColor("Pending");
      expect(inactiveStyle.value).toHaveProperty("--dx-chip-bg");
      expect(inactiveStyle.value).toHaveProperty("--dx-chip-text");
    });

    it("uses light-mode inactive colors when dark class is absent", () => {
      const { inactiveStyle, colorIndex } = useAutoColor("Test");
      const entry = AUTO_COLOR_PALETTE[colorIndex.value]!;
      expect(inactiveStyle.value["--dx-chip-bg" as keyof typeof inactiveStyle.value]).toBe(
        entry.inactiveBg
      );
      expect(inactiveStyle.value["--dx-chip-text" as keyof typeof inactiveStyle.value]).toBe(
        entry.inactiveText
      );
    });

    it("uses dark-mode inactive colors when dark class is present", () => {
      document.documentElement.classList.add("dark");
      const { inactiveStyle, colorIndex } = useAutoColor("Test");
      const entry = AUTO_COLOR_PALETTE[colorIndex.value]!;
      expect(inactiveStyle.value["--dx-chip-bg" as keyof typeof inactiveStyle.value]).toBe(
        entry.darkInactiveBg
      );
      expect(inactiveStyle.value["--dx-chip-text" as keyof typeof inactiveStyle.value]).toBe(
        entry.darkInactiveText
      );
    });

    it("inactive colors differ from active colors", () => {
      const { style, inactiveStyle } = useAutoColor("Test");
      expect(style.value).not.toEqual(inactiveStyle.value);
    });
  });

  describe("tokenPrefix", () => {
    it("defaults to --dx-chip prefix (DanxChip token)", () => {
      const { style } = useAutoColor("Test");
      expect(style.value).toHaveProperty("--dx-chip-bg");
      expect(style.value).toHaveProperty("--dx-chip-text");
    });

    it("uses custom prefix when provided", () => {
      const { style, inactiveStyle } = useAutoColor("Test", "--dx-button-group");
      expect(style.value).toHaveProperty("--dx-button-group-bg");
      expect(style.value).toHaveProperty("--dx-button-group-text");
      expect(style.value).not.toHaveProperty("--dx-chip-bg");
      expect(inactiveStyle.value).toHaveProperty("--dx-button-group-bg");
      expect(inactiveStyle.value).toHaveProperty("--dx-button-group-text");
    });

    it("custom prefix applies correct active color values", () => {
      const { style, colorIndex } = useAutoColor("Test", "--dx-custom");
      const entry = AUTO_COLOR_PALETTE[colorIndex.value]!;
      expect(style.value["--dx-custom-bg" as keyof typeof style.value]).toBe(entry.bg);
      expect(style.value["--dx-custom-text" as keyof typeof style.value]).toBe(entry.text);
    });

    it("custom prefix applies correct inactive color values", () => {
      const { inactiveStyle, colorIndex } = useAutoColor("Test", "--dx-custom");
      const entry = AUTO_COLOR_PALETTE[colorIndex.value]!;
      expect(inactiveStyle.value["--dx-custom-bg" as keyof typeof inactiveStyle.value]).toBe(
        entry.inactiveBg
      );
      expect(inactiveStyle.value["--dx-custom-text" as keyof typeof inactiveStyle.value]).toBe(
        entry.inactiveText
      );
    });
  });
});
