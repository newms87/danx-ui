/**
 * useLivePreview - Compiles editable SFC strings into live Vue components
 *
 * Uses Vue 3's runtime template compiler (requires vue/dist/vue.esm-bundler.js)
 * to turn user-edited SFC strings into rendered components in real-time.
 *
 * Supports full SFC format with <template>, <script setup>, and <style> blocks.
 * Template edits update the rendered output. Script edits re-evaluate bindings
 * (reactive state, functions, imports) via dynamic evaluation. Style blocks are
 * injected into the document head as global CSS (scoped attribute is stripped
 * since runtime-compiled components can't use Vue's scoping mechanism).
 *
 * Imports are resolved from AVAILABLE_VALUES — a flat registry of everything
 * the demo environment provides (Vue APIs, components, assets).
 *
 * NOTE: Script evaluation uses `new Function()`, which requires `unsafe-eval`
 * in Content-Security-Policy. This is demo-only code and is NOT shipped in
 * the library build.
 *
 * @param code - Reactive ref containing a Vue SFC or template string
 * @returns { component, error } - shallowRef of the compiled component, and any compilation error
 */
import {
  type Component,
  type Ref,
  computed,
  defineComponent,
  onScopeDispose,
  reactive,
  ref,
  shallowRef,
  watch,
  watchEffect,
} from "vue";
import { DanxBadge } from "../../src/components/badge";
import { DanxButton, DanxActionButton } from "../../src/components/button";
import { DanxChip } from "../../src/components/chip";
import {
  DanxIcon,
  iconRegistry,
  infoIcon,
  questionIcon,
  warningTriangleIcon,
  listIcon,
  gearIcon,
  handleIcon,
  musicIcon,
  filePdfIcon,
} from "../../src/components/icon";
import { CodeViewer } from "../../src/components/code-viewer";
import { DanxContextMenu } from "../../src/components/context-menu";
import {
  DanxDialog,
  DialogBreadcrumbs,
  useDialog,
  useDialogStack,
} from "../../src/components/dialog";
import { DanxPopover } from "../../src/components/popover";
import { MarkdownEditor } from "../../src/components/markdown-editor";
import { DanxButtonGroup } from "../../src/components/buttonGroup";
import { DanxTabs } from "../../src/components/tabs";
import { DanxTooltip } from "../../src/components/tooltip";
import { DanxProgressBar } from "../../src/components/progress-bar";
import { DanxSplitPanel, SplitPanelHandle, useSplitPanel } from "../../src/components/split-panel";
import { DanxInfiniteScroll } from "../../src/components/infinite-scroll";
import { useDanxInfiniteScroll } from "../../src/components/infinite-scroll";
import { DanxFile } from "../../src/components/danx-file";
import {
  DanxFileNavigator,
  useDanxFileNavigator,
  useDanxFileMetadata,
  useVirtualCarousel,
} from "../../src/components/danx-file-navigator";
import {
  resolveFileUrl,
  resolveThumbUrl,
  isImage,
  isVideo,
  isPdf,
  isAudio,
  isPreviewable,
  isInProgress,
  hasChildren,
  fileTypeIcon,
  formatFileSize,
  createDownloadEvent,
  triggerFileDownload,
} from "../../src/components/danx-file";
import { downloadFile } from "../../src/shared/download";
import { useVariant } from "../../src/shared/composables/useVariant";
import {
  fCurrency,
  fCurrencyNoCents,
  fNumber,
  fShortCurrency,
  fShortNumber,
  fShortSize,
  fBoolean,
  fPercent,
  centerTruncate,
  fTruncate,
  fUppercase,
  fLowercase,
  fAddress,
  fPhone,
  fNameOrCount,
  fDate,
  fDateTime,
  fSlashDate,
  fLocalizedDateTime,
  fDateTimeMs,
  dbDateTime,
  fSecondsToTime,
  fSecondsToDuration,
  fMillisecondsToDuration,
  fDuration,
  fTimeAgo,
  DateTime,
} from "../../src/shared/formatters";
import {
  arrayCount,
  arraySum,
  arrayAvg,
  arrayMin,
  arrayMax,
  arrayFirst,
  arrayLast,
  arrayJoin,
} from "../../src/shared/arrayUtils";
import { useAutoColor, hashStringToIndex, AUTO_COLOR_PALETTE } from "../../src/shared/autoColor";
import starIcon from "danx-icon/src/fontawesome/solid/star.svg?raw";

/** Components available in compiled templates via the `components` option */
const REGISTERED_COMPONENTS: Record<string, Component> = {
  DanxBadge,
  DanxButton,
  DanxActionButton,
  DanxChip,
  DanxIcon,
  CodeViewer,
  DanxContextMenu,
  DanxDialog,
  DialogBreadcrumbs,
  DanxPopover,
  MarkdownEditor,
  DanxButtonGroup,
  DanxTabs,
  DanxTooltip,
  DanxFile,
  DanxFileNavigator,
  DanxProgressBar,
  DanxSplitPanel,
  SplitPanelHandle,
  DanxInfiniteScroll,
};

/**
 * Flat registry of values available for import resolution in script blocks.
 * When a script contains `import { ref } from "vue"`, we look up `ref` here.
 */
const AVAILABLE_VALUES: Record<string, unknown> = {
  ref,
  computed,
  reactive,
  watch,
  watchEffect,
  DanxBadge,
  DanxButton,
  DanxActionButton,
  DanxChip,
  DanxIcon,
  CodeViewer,
  DanxContextMenu,
  DanxDialog,
  DialogBreadcrumbs,
  DanxPopover,
  useDialog,
  useDialogStack,
  MarkdownEditor,
  DanxButtonGroup,
  DanxTabs,
  DanxTooltip,
  useVariant,
  starIcon,
  iconRegistry,
  infoIcon,
  questionIcon,
  warningTriangleIcon,
  listIcon,
  gearIcon,
  handleIcon,
  musicIcon,
  filePdfIcon,
  // Formatters - numbers
  fCurrency,
  fCurrencyNoCents,
  fNumber,
  fShortCurrency,
  fShortNumber,
  fShortSize,
  fBoolean,
  fPercent,
  // Formatters - strings
  centerTruncate,
  fTruncate,
  fUppercase,
  fLowercase,
  fAddress,
  fPhone,
  fNameOrCount,
  // Array utilities
  arrayCount,
  arraySum,
  arrayAvg,
  arrayMin,
  arrayMax,
  arrayFirst,
  arrayLast,
  arrayJoin,
  // Formatters - datetime
  fDate,
  fDateTime,
  fSlashDate,
  fLocalizedDateTime,
  fDateTimeMs,
  dbDateTime,
  fSecondsToTime,
  fSecondsToDuration,
  fMillisecondsToDuration,
  fDuration,
  fTimeAgo,
  DateTime,
  // Auto-color
  useAutoColor,
  hashStringToIndex,
  AUTO_COLOR_PALETTE,
  // DanxProgressBar
  DanxProgressBar,
  // DanxFile + DanxFileNavigator
  DanxFile,
  DanxFileNavigator,
  resolveFileUrl,
  resolveThumbUrl,
  isImage,
  isVideo,
  isPdf,
  isAudio,
  isPreviewable,
  isInProgress,
  hasChildren,
  fileTypeIcon,
  formatFileSize,
  createDownloadEvent,
  triggerFileDownload,
  downloadFile,
  useDanxFileNavigator,
  useDanxFileMetadata,
  useVirtualCarousel,
  // SplitPanel
  DanxSplitPanel,
  SplitPanelHandle,
  useSplitPanel,
  // InfiniteScroll
  DanxInfiniteScroll,
  useDanxInfiniteScroll,
};

const DEBOUNCE_MS = 250;

/**
 * Extract the inner content of a <template> block from an SFC string.
 * Returns the original string unchanged if no <template> block is found.
 */
export function extractTemplate(source: string): string {
  const match = source.match(/<template>([\s\S]*)<\/template>/);
  return match ? match[1]!.trim() : source;
}

/**
 * Extract the inner content of a <script> block from an SFC string.
 * Returns null if no script block is found.
 */
export function extractScript(source: string): string | null {
  const match = source.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  return match ? match[1]!.trim() : null;
}

/**
 * Extract the inner content of all <style> blocks from an SFC string.
 * Strips the `scoped` attribute since runtime-compiled components can't
 * use Vue's scoping mechanism. Returns null if no style blocks are found.
 */
export function extractStyle(source: string): string | null {
  const matches = [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)];
  if (matches.length === 0) return null;
  return matches.map((m) => m[1]!.trim()).join("\n\n");
}

/**
 * Parse import statements from a script block.
 * Resolves imported names from AVAILABLE_VALUES and returns
 * the resolved bindings plus the remaining script body.
 */
export function parseScript(script: string): {
  bindings: Record<string, unknown>;
  body: string;
} {
  const bindings: Record<string, unknown> = {};
  const bodyLines: string[] = [];

  // Collapse multi-line imports into single lines so the per-line regex can match them
  const normalized = script.replace(/import\s*\{[^}]*\}\s*from\s*["'][^"']+["'];?/gs, (match) =>
    match.replace(/\s*\n\s*/g, " ")
  );

  for (const line of normalized.split("\n")) {
    const trimmed = line.trim();

    // Skip type-only imports (TypeScript, no runtime effect)
    if (trimmed.startsWith("import type")) continue;

    // Named imports: import { ref, computed } from "vue"
    const namedMatch = trimmed.match(/^import\s+\{([^}]+)\}\s+from\s+["'][^"']+["'];?\s*$/);
    if (namedMatch) {
      for (const name of namedMatch[1]!.split(",").map((n) => n.trim())) {
        if (name in AVAILABLE_VALUES) {
          bindings[name] = AVAILABLE_VALUES[name];
        }
      }
      continue;
    }

    // Default imports: import starIcon from "..."
    const defaultMatch = trimmed.match(/^import\s+(\w+)\s+from\s+["'][^"']+["'];?\s*$/);
    if (defaultMatch) {
      const name = defaultMatch[1]!;
      if (name in AVAILABLE_VALUES) {
        bindings[name] = AVAILABLE_VALUES[name];
      }
      continue;
    }

    bodyLines.push(line);
  }

  return { bindings, body: bodyLines.join("\n").trim() };
}

/**
 * Find all top-level const/let/var and function declarations in a script body.
 * Returns the list of declared names so we can return them from setup().
 */
export function findDeclaredNames(script: string): string[] {
  const names: string[] = [];
  for (const match of script.matchAll(/(?:const|let|var)\s+(\w+)/g)) {
    names.push(match[1]!);
  }
  for (const match of script.matchAll(/(?:async\s+)?function\s+(\w+)/g)) {
    names.push(match[1]!);
  }
  return [...new Set(names)];
}

/**
 * Build a setup() function from a parsed script block.
 * Uses `new Function()` to evaluate the script body with resolved imports
 * as parameters, then returns all declared + imported names.
 */
export function buildSetup(script: string): (() => Record<string, unknown>) | null {
  const { bindings, body } = parseScript(script);
  const importNames = Object.keys(bindings);
  const importValues = Object.values(bindings);
  const declaredNames = findDeclaredNames(body);
  const allNames = [...new Set([...importNames, ...declaredNames])];

  if (allNames.length === 0) return null;

  // No body code — just return resolved imports (e.g. starIcon)
  if (!body) {
    return () => ({ ...bindings });
  }

  // Build a function that receives imports as params, runs the body,
  // and returns all names (imports + declarations)
  const returnStmt = `return { ${allNames.join(", ")} }`;
  const fnBody = `${body}\n${returnStmt}`;

  try {
    const fn = new Function(...importNames, fnBody);
    return () => fn(...importValues);
  } catch {
    return null;
  }
}

/** Counter for generating unique style element IDs */
let styleIdCounter = 0;

export function useLivePreview(code: Ref<string>): {
  component: Ref<Component | null>;
  error: Ref<string | null>;
} {
  const component = shallowRef<Component | null>(null);
  const error = shallowRef<string | null>(null);
  const styleId = `danx-live-preview-${++styleIdCounter}`;

  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  function injectStyle(css: string | null) {
    let el = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!css) {
      el?.remove();
      return;
    }
    if (!el) {
      el = document.createElement("style");
      el.id = styleId;
      document.head.appendChild(el);
    }
    el.textContent = css;
  }

  function compile(source: string) {
    try {
      const template = extractTemplate(source);
      const script = extractScript(source);
      const style = extractStyle(source);

      let setup: (() => Record<string, unknown>) | undefined;
      if (script) {
        setup = buildSetup(script) ?? undefined;
      }

      const compiled = defineComponent({
        template,
        components: REGISTERED_COMPONENTS,
        setup: setup ?? (() => ({})),
      });
      component.value = compiled;
      error.value = null;
      injectStyle(style);
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
    }
  }

  // Compile immediately on first call
  compile(code.value);

  // Debounced recompilation on changes
  watch(code, (newCode) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => compile(newCode), DEBOUNCE_MS);
  });

  // Clean up injected style on scope disposal
  onScopeDispose(() => {
    clearTimeout(debounceTimer);
    document.getElementById(styleId)?.remove();
  });

  return { component, error };
}
