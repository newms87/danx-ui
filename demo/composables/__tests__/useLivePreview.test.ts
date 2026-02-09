import { describe, expect, it } from "vitest";
import {
  buildSetup,
  extractScript,
  extractTemplate,
  findDeclaredNames,
  parseScript,
} from "../useLivePreview";

describe("extractTemplate", () => {
  it("returns content inside <template> tags", () => {
    const source = `<template><div>Hello</div></template>`;
    expect(extractTemplate(source)).toBe("<div>Hello</div>");
  });

  it("trims whitespace inside template tags", () => {
    const source = `<template>
  <div>Hello</div>
</template>`;
    expect(extractTemplate(source)).toBe("<div>Hello</div>");
  });

  it("returns original string when no <template> block found", () => {
    const source = `<div>Hello</div>`;
    expect(extractTemplate(source)).toBe("<div>Hello</div>");
  });

  it("handles multiline template content", () => {
    const source = `<template>
  <div>
    <span>Hello</span>
    <span>World</span>
  </div>
</template>`;
    const result = extractTemplate(source);
    expect(result).toContain("<span>Hello</span>");
    expect(result).toContain("<span>World</span>");
  });
});

describe("extractScript", () => {
  it("returns content inside <script> tags", () => {
    const source = `<template><div /></template>
<script>const x = 1;</script>`;
    expect(extractScript(source)).toBe("const x = 1;");
  });

  it("returns null when no <script> block found", () => {
    expect(extractScript("<div>Hello</div>")).toBeNull();
  });

  it('handles <script setup lang="ts">', () => {
    const source = `<template><div /></template>
<script setup lang="ts">
import { ref } from "vue";
const count = ref(0);
</script>`;
    const result = extractScript(source);
    expect(result).toContain('import { ref } from "vue"');
    expect(result).toContain("const count = ref(0)");
  });

  it("handles script with attributes", () => {
    const source = `<script setup>const x = 1;</script>`;
    expect(extractScript(source)).toBe("const x = 1;");
  });
});

describe("parseScript", () => {
  it("resolves named imports from AVAILABLE_VALUES", () => {
    const script = `import { ref, computed } from "vue";
const count = ref(0);`;
    const { bindings, body } = parseScript(script);
    expect(bindings).toHaveProperty("ref");
    expect(bindings).toHaveProperty("computed");
    expect(body).toBe("const count = ref(0);");
  });

  it("resolves default imports from AVAILABLE_VALUES", () => {
    const script = `import starIcon from "danx-icon/src/fontawesome/solid/star.svg?raw";`;
    const { bindings } = parseScript(script);
    expect(bindings).toHaveProperty("starIcon");
  });

  it("strips import type lines", () => {
    const script = `import type { Ref } from "vue";
const x = 1;`;
    const { bindings, body } = parseScript(script);
    expect(Object.keys(bindings)).toHaveLength(0);
    expect(body).toBe("const x = 1;");
  });

  it("ignores unknown imports gracefully", () => {
    const script = `import { unknownThing } from "unknown-module";
const x = 1;`;
    const { bindings, body } = parseScript(script);
    expect(bindings).not.toHaveProperty("unknownThing");
    expect(body).toBe("const x = 1;");
  });

  it("handles mixed imports and body lines", () => {
    const script = `import { ref } from "vue";
import { DanxButton } from "danx-ui";

const count = ref(0);
const label = "hello";`;
    const { bindings, body } = parseScript(script);
    expect(bindings).toHaveProperty("ref");
    expect(bindings).toHaveProperty("DanxButton");
    expect(body).toContain("const count = ref(0);");
    expect(body).toContain('const label = "hello";');
  });

  it("resolves CodeViewer from danx-ui imports", () => {
    const script = `import { CodeViewer } from "danx-ui";`;
    const { bindings } = parseScript(script);
    expect(bindings).toHaveProperty("CodeViewer");
  });

  it("resolves MarkdownEditor from danx-ui imports", () => {
    const script = `import { MarkdownEditor } from "danx-ui";`;
    const { bindings } = parseScript(script);
    expect(bindings).toHaveProperty("MarkdownEditor");
  });
});

describe("findDeclaredNames", () => {
  it("finds const declarations", () => {
    expect(findDeclaredNames("const count = ref(0);")).toEqual(["count"]);
  });

  it("finds let declarations", () => {
    expect(findDeclaredNames("let name = 'hello';")).toEqual(["name"]);
  });

  it("finds function declarations", () => {
    expect(findDeclaredNames("function handleClick() {}")).toEqual(["handleClick"]);
  });

  it("finds async function declarations", () => {
    expect(findDeclaredNames("async function fetchData() {}")).toEqual(["fetchData"]);
  });

  it("finds multiple declarations", () => {
    const script = `const a = 1;
let b = 2;
function doSomething() {}`;
    const names = findDeclaredNames(script);
    expect(names).toContain("a");
    expect(names).toContain("b");
    expect(names).toContain("doSomething");
  });

  it("deduplicates names", () => {
    const script = `const x = 1;
const x = 2;`;
    expect(findDeclaredNames(script)).toEqual(["x"]);
  });
});

describe("buildSetup", () => {
  it("returns a setup function that produces correct bindings", () => {
    const script = `import { ref } from "vue";
const count = ref(0);`;
    const setup = buildSetup(script);
    expect(setup).not.toBeNull();
    const result = setup!();
    expect(result).toHaveProperty("ref");
    expect(result).toHaveProperty("count");
    // count should be a ref with value 0
    expect((result.count as { value: number }).value).toBe(0);
  });

  it("returns null when no names are declared or imported", () => {
    expect(buildSetup("// just a comment")).toBeNull();
  });

  it("returns import-only bindings when body is empty", () => {
    const script = `import starIcon from "danx-icon/src/fontawesome/solid/star.svg?raw";`;
    const setup = buildSetup(script);
    expect(setup).not.toBeNull();
    const result = setup!();
    expect(result).toHaveProperty("starIcon");
  });

  it("returns null for invalid script body", () => {
    const script = `import { ref } from "vue";
const x = {{{ invalid syntax`;
    expect(buildSetup(script)).toBeNull();
  });

  it("handles functions in script body", () => {
    const script = `import { ref } from "vue";
const count = ref(0);
function increment() { count.value++; }`;
    const setup = buildSetup(script);
    expect(setup).not.toBeNull();
    const result = setup!();
    expect(result).toHaveProperty("count");
    expect(result).toHaveProperty("increment");
    expect(typeof result.increment).toBe("function");
  });
});
