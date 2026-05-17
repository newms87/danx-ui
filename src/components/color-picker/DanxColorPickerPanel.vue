<!--
/**
 * DanxColorPickerPanel — internal panel rendered inside DanxColorPicker's
 * DanxPopover. Owns the HSV saturation/value surface, the hue strip, the
 * optional alpha strip, the numeric format tabs (HEX/RGB/HSL), the preset
 * palette grid, the recent-colors strip, and the optional eyedropper +
 * clear buttons.
 *
 * The panel is fully driven by props/emits — it does NOT touch
 * localStorage, and it does NOT own the popover open state. The parent
 * (DanxColorPicker) wires those up.
 */
-->

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import {
  DEFAULT_SWATCHES,
  formatColor,
  hslToRgb,
  hsvToRgb,
  parseColor,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
  type ColorFormat,
  type HSV,
  type RGB,
} from "./color-utils";

interface PanelProps {
  modelValue: string;
  swatches?: string[];
  paletteCols?: number;
  alpha?: boolean;
  output?: ColorFormat;
  clearable?: boolean;
  clearValue?: string;
  recent?: string[];
  testId?: string;
}

const props = withDefaults(defineProps<PanelProps>(), {
  swatches: () => DEFAULT_SWATCHES,
  paletteCols: 8,
  alpha: false,
  output: "hex",
  clearable: false,
  clearValue: "",
  recent: () => [],
});

const emit = defineEmits<{
  (e: "commit", value: string): void;
  (e: "clear"): void;
}>();

type Tab = "hex" | "rgb" | "hsl";
const activeTab = ref<Tab>("hex");

/**
 * Internal HSV state — the surface + hue strip + alpha strip all manipulate
 * this directly so dragging stays smooth (no round-trip through RGB on every
 * frame). We commit out as RGB only on pointer-up / Enter / palette click.
 */
const internal = ref<HSV>(initialHsv());
const hexDraft = ref<string>("");
const rgbDraft = ref({ r: 0, g: 0, b: 0, a: 1 });
const hslDraft = ref({ h: 0, s: 0, l: 0, a: 1 });
const eyedropperError = ref<string | null>(null);

const supportsEyedropper = computed(() => typeof window !== "undefined" && "EyeDropper" in window);

function initialHsv(): HSV {
  const rgb = parseColor(props.modelValue) ?? { r: 0, g: 0, b: 0, a: 1 };
  return rgbToHsv(rgb);
}

function syncDraftsFromHsv(hsv: HSV): void {
  const rgb = hsvToRgb(hsv);
  hexDraft.value = rgbToHex(rgb, props.alpha && rgb.a < 1);
  rgbDraft.value = { r: rgb.r, g: rgb.g, b: rgb.b, a: rgb.a };
  hslDraft.value = rgbToHsl(rgb);
}

syncDraftsFromHsv(internal.value);

watch(
  () => props.modelValue,
  (next) => {
    const rgb = parseColor(next);
    if (!rgb) return;
    const hsv = rgbToHsv(rgb);
    // Don't fight an in-progress drag: skip the re-seed when the parent is
    // echoing the same value we just emitted.
    const current = hsvToRgb(internal.value);
    if (current.r === rgb.r && current.g === rgb.g && current.b === rgb.b && current.a === rgb.a) {
      return;
    }
    internal.value = hsv;
    syncDraftsFromHsv(hsv);
  }
);

const currentRgb = computed<RGB>(() => hsvToRgb(internal.value));
const currentHex = computed(() => rgbToHex(currentRgb.value, false));
const currentHexAlpha = computed(() => rgbToHex(currentRgb.value, true));

/** Pure hue color used as the background of the saturation/value surface. */
const hueBaseColor = computed(() => {
  const rgb = hsvToRgb({ h: internal.value.h, s: 100, v: 100, a: 1 });
  return rgbToHex(rgb, false);
});

const surfaceThumbStyle = computed(() => ({
  left: `${internal.value.s}%`,
  top: `${100 - internal.value.v}%`,
}));

const hueThumbStyle = computed(() => ({ left: `${(internal.value.h / 360) * 100}%` }));

const alphaThumbStyle = computed(() => ({ left: `${internal.value.a * 100}%` }));

const alphaGradient = computed(() => {
  const c = currentHex.value;
  return `linear-gradient(to right, ${c}00, ${c}ff)`;
});

const paletteStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.paletteCols}, minmax(0, 1fr))`,
}));

// ---------------------------------------------------------------------------
// Pointer interaction (surface, hue strip, alpha strip)
// ---------------------------------------------------------------------------

const surfaceRef = ref<HTMLDivElement | null>(null);
const hueRef = ref<HTMLDivElement | null>(null);
const alphaRef = ref<HTMLDivElement | null>(null);
const activeDrag = ref<"surface" | "hue" | "alpha" | null>(null);
const activePointerId = ref<number | null>(null);

function percentOf(el: HTMLElement, clientX: number, clientY?: number) {
  const rect = el.getBoundingClientRect();
  const x = rect.width === 0 ? 0 : ((clientX - rect.left) / rect.width) * 100;
  const y =
    clientY !== undefined && rect.height !== 0 ? ((clientY - rect.top) / rect.height) * 100 : 0;
  return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
}

function startDrag(kind: "surface" | "hue" | "alpha", event: PointerEvent) {
  const target = event.currentTarget as HTMLElement | null;
  target?.setPointerCapture?.(event.pointerId);
  activeDrag.value = kind;
  activePointerId.value = event.pointerId;
  applyDrag(kind, event);
}

function applyDrag(kind: "surface" | "hue" | "alpha", event: PointerEvent) {
  if (kind === "surface" && surfaceRef.value) {
    const { x, y } = percentOf(surfaceRef.value, event.clientX, event.clientY);
    internal.value = { ...internal.value, s: x, v: 100 - y };
  } else if (kind === "hue" && hueRef.value) {
    const { x } = percentOf(hueRef.value, event.clientX);
    internal.value = { ...internal.value, h: (x / 100) * 360 };
  } else if (kind === "alpha" && alphaRef.value) {
    const { x } = percentOf(alphaRef.value, event.clientX);
    internal.value = { ...internal.value, a: x / 100 };
  }
  syncDraftsFromHsv(internal.value);
}

function onPointerMove(event: PointerEvent) {
  if (
    !activeDrag.value ||
    (activePointerId.value !== null && event.pointerId !== activePointerId.value)
  ) {
    return;
  }
  applyDrag(activeDrag.value, event);
}

function onPointerUp(event: PointerEvent) {
  if (!activeDrag.value) return;
  const target = event.currentTarget as HTMLElement | null;
  if (activePointerId.value !== null) target?.releasePointerCapture?.(activePointerId.value);
  activeDrag.value = null;
  activePointerId.value = null;
  commitCurrent();
}

function onSurfaceDown(e: PointerEvent) {
  startDrag("surface", e);
}
function onHueDown(e: PointerEvent) {
  startDrag("hue", e);
}
function onAlphaDown(e: PointerEvent) {
  startDrag("alpha", e);
}

// ---------------------------------------------------------------------------
// Keyboard (surface + hue + alpha thumbs)
// ---------------------------------------------------------------------------

function onSurfaceKey(e: KeyboardEvent) {
  const step = e.shiftKey ? 10 : 1;
  let { s, v } = internal.value;
  if (e.key === "ArrowLeft") s -= step;
  else if (e.key === "ArrowRight") s += step;
  else if (e.key === "ArrowUp") v += step;
  else if (e.key === "ArrowDown") v -= step;
  else return;
  e.preventDefault();
  internal.value = { ...internal.value, s: clamp(s, 0, 100), v: clamp(v, 0, 100) };
  syncDraftsFromHsv(internal.value);
  commitCurrent();
}

function onHueKey(e: KeyboardEvent) {
  const step = e.shiftKey ? 10 : 1;
  let h = internal.value.h;
  if (e.key === "ArrowLeft" || e.key === "ArrowDown") h -= step;
  else if (e.key === "ArrowRight" || e.key === "ArrowUp") h += step;
  else return;
  e.preventDefault();
  internal.value = { ...internal.value, h: (h + 360) % 360 };
  syncDraftsFromHsv(internal.value);
  commitCurrent();
}

function onAlphaKey(e: KeyboardEvent) {
  const step = e.shiftKey ? 0.1 : 0.01;
  let a = internal.value.a;
  if (e.key === "ArrowLeft" || e.key === "ArrowDown") a -= step;
  else if (e.key === "ArrowRight" || e.key === "ArrowUp") a += step;
  else return;
  e.preventDefault();
  internal.value = { ...internal.value, a: clamp(a, 0, 1) };
  syncDraftsFromHsv(internal.value);
  commitCurrent();
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// ---------------------------------------------------------------------------
// Commit
// ---------------------------------------------------------------------------

function commitCurrent() {
  const rgb = hsvToRgb(internal.value);
  let format = props.output;
  if (props.alpha && rgb.a < 1 && format === "hex") format = "hex"; // hex carries alpha automatically
  emit("commit", formatColor(rgb, format));
}

function commitFromColor(raw: string) {
  const rgb = parseColor(raw);
  if (!rgb) return;
  internal.value = rgbToHsv(rgb);
  syncDraftsFromHsv(internal.value);
  commitCurrent();
}

// ---------------------------------------------------------------------------
// Numeric input handlers (HEX/RGB/HSL tabs)
// ---------------------------------------------------------------------------

function onHexCommit() {
  const rgb = parseColor(hexDraft.value);
  if (!rgb) {
    syncDraftsFromHsv(internal.value);
    return;
  }
  internal.value = rgbToHsv(rgb);
  syncDraftsFromHsv(internal.value);
  commitCurrent();
}

function onRgbInput(channel: "r" | "g" | "b", event: Event) {
  const value = parseFloat((event.target as HTMLInputElement).value);
  if (!Number.isFinite(value)) return;
  const next = { ...rgbDraft.value, [channel]: value } as RGB;
  rgbDraft.value = next;
  const hsv = rgbToHsv(next);
  internal.value = hsv;
  syncDraftsFromHsv(hsv);
  commitCurrent();
}

function onAlphaInput(event: Event) {
  const value = parseFloat((event.target as HTMLInputElement).value);
  if (!Number.isFinite(value)) return;
  internal.value = { ...internal.value, a: clamp(value, 0, 1) };
  syncDraftsFromHsv(internal.value);
  commitCurrent();
}

function onHslInput(channel: "h" | "s" | "l", event: Event) {
  const value = parseFloat((event.target as HTMLInputElement).value);
  if (!Number.isFinite(value)) return;
  const next = { ...hslDraft.value, [channel]: value };
  hslDraft.value = next;
  const rgb = hslToRgb(next);
  internal.value = rgbToHsv(rgb);
  syncDraftsFromHsv(internal.value);
  commitCurrent();
}

// ---------------------------------------------------------------------------
// Palette + recents
// ---------------------------------------------------------------------------

function selectSwatch(swatch: string) {
  commitFromColor(swatch);
}

const swatchRefs = ref<HTMLElement[]>([]);
function setSwatchRef(index: number) {
  return (el: unknown) => {
    if (el instanceof HTMLElement) swatchRefs.value[index] = el;
  };
}

function onPaletteKey(event: KeyboardEvent, index: number) {
  const cols = Math.max(1, props.paletteCols);
  const total = props.swatches.length;
  let next = index;
  if (event.key === "ArrowRight") next = (index + 1) % total;
  else if (event.key === "ArrowLeft") next = (index - 1 + total) % total;
  else if (event.key === "ArrowDown") next = Math.min(total - 1, index + cols);
  else if (event.key === "ArrowUp") next = Math.max(0, index - cols);
  else if (event.key === "Home") next = 0;
  else if (event.key === "End") next = total - 1;
  else return;
  event.preventDefault();
  nextTick(() => swatchRefs.value[next]?.focus());
}

// ---------------------------------------------------------------------------
// Eyedropper
// ---------------------------------------------------------------------------

async function onEyedropper() {
  eyedropperError.value = null;
  try {
    interface EyeDropperResult {
      sRGBHex: string;
    }
    interface EyeDropperConstructor {
      new (): { open: () => Promise<EyeDropperResult> };
    }
    // The trigger button is `v-if="supportsEyedropper"` — Ctor is non-null
    // whenever this handler is reachable, so we cast directly without a guard.
    const Ctor = (window as unknown as { EyeDropper: EyeDropperConstructor }).EyeDropper;
    const dropper = new Ctor();
    const result = await dropper.open();
    commitFromColor(result.sRGBHex);
  } catch (err) {
    eyedropperError.value = err instanceof Error ? err.message : "Eyedropper cancelled";
  }
}

function onClear() {
  emit("clear");
}

function testIdFor(suffix: string): string | undefined {
  return props.testId ? `${props.testId}-${suffix}` : undefined;
}
</script>

<template>
  <div
    class="danx-color-picker__panel"
    role="dialog"
    aria-label="Color picker"
    :data-test="testIdFor('panel')"
  >
    <div
      ref="surfaceRef"
      class="danx-color-picker__surface"
      :style="{ '--dx-color-picker-hue-base': hueBaseColor }"
      :data-test="testIdFor('surface')"
      @pointerdown="onSurfaceDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <div
        class="danx-color-picker__surface-thumb"
        role="slider"
        aria-label="Saturation and value"
        :aria-valuetext="`Saturation ${Math.round(internal.s)}%, value ${Math.round(internal.v)}%`"
        :aria-valuemin="0"
        :aria-valuemax="100"
        :aria-valuenow="Math.round(internal.v)"
        tabindex="0"
        :style="surfaceThumbStyle"
        @keydown="onSurfaceKey"
      ></div>
    </div>

    <div class="danx-color-picker__strips">
      <div class="danx-color-picker__preview" :style="{ background: currentHexAlpha }"></div>
      <div class="danx-color-picker__strip-stack">
        <div
          ref="hueRef"
          class="danx-color-picker__hue"
          :data-test="testIdFor('hue')"
          @pointerdown="onHueDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
        >
          <div
            class="danx-color-picker__hue-thumb"
            role="slider"
            aria-label="Hue"
            :aria-valuemin="0"
            :aria-valuemax="360"
            :aria-valuenow="Math.round(internal.h)"
            tabindex="0"
            :style="hueThumbStyle"
            @keydown="onHueKey"
          ></div>
        </div>
        <div
          v-if="alpha"
          ref="alphaRef"
          class="danx-color-picker__alpha"
          :data-test="testIdFor('alpha')"
          @pointerdown="onAlphaDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
        >
          <div
            class="danx-color-picker__alpha-fill"
            :style="{ backgroundImage: alphaGradient }"
          ></div>
          <div
            class="danx-color-picker__alpha-thumb"
            role="slider"
            aria-label="Alpha"
            :aria-valuemin="0"
            :aria-valuemax="1"
            :aria-valuenow="Math.round(internal.a * 100) / 100"
            tabindex="0"
            :style="alphaThumbStyle"
            @keydown="onAlphaKey"
          ></div>
        </div>
      </div>
    </div>

    <div class="danx-color-picker__tabs" role="tablist" :data-test="testIdFor('tabs')">
      <button
        v-for="t in ['hex', 'rgb', 'hsl'] as Tab[]"
        :key="t"
        type="button"
        class="danx-color-picker__tab"
        :class="{ 'danx-color-picker__tab--active': activeTab === t }"
        role="tab"
        :aria-selected="activeTab === t"
        :data-test="testIdFor(`tab-${t}`)"
        @click="activeTab = t"
      >
        {{ t.toUpperCase() }}
      </button>
    </div>

    <div v-if="activeTab === 'hex'" class="danx-color-picker__row">
      <label class="danx-color-picker__input-group">
        <span class="danx-color-picker__input-label">HEX</span>
        <input
          v-model="hexDraft"
          class="danx-color-picker__number"
          type="text"
          :data-test="testIdFor('hex-input')"
          @change="onHexCommit"
          @keydown.enter.prevent="onHexCommit"
        />
      </label>
    </div>

    <div v-else-if="activeTab === 'rgb'" class="danx-color-picker__row">
      <label class="danx-color-picker__input-group">
        <span class="danx-color-picker__input-label">R</span>
        <input
          :value="rgbDraft.r"
          class="danx-color-picker__number"
          type="number"
          min="0"
          max="255"
          :data-test="testIdFor('rgb-r')"
          @input="(e) => onRgbInput('r', e)"
        />
      </label>
      <label class="danx-color-picker__input-group">
        <span class="danx-color-picker__input-label">G</span>
        <input
          :value="rgbDraft.g"
          class="danx-color-picker__number"
          type="number"
          min="0"
          max="255"
          :data-test="testIdFor('rgb-g')"
          @input="(e) => onRgbInput('g', e)"
        />
      </label>
      <label class="danx-color-picker__input-group">
        <span class="danx-color-picker__input-label">B</span>
        <input
          :value="rgbDraft.b"
          class="danx-color-picker__number"
          type="number"
          min="0"
          max="255"
          :data-test="testIdFor('rgb-b')"
          @input="(e) => onRgbInput('b', e)"
        />
      </label>
      <label v-if="alpha" class="danx-color-picker__input-group">
        <span class="danx-color-picker__input-label">A</span>
        <input
          :value="Math.round(internal.a * 100) / 100"
          class="danx-color-picker__number"
          type="number"
          min="0"
          max="1"
          step="0.01"
          :data-test="testIdFor('rgb-a')"
          @input="onAlphaInput"
        />
      </label>
    </div>

    <div v-else class="danx-color-picker__row">
      <label class="danx-color-picker__input-group">
        <span class="danx-color-picker__input-label">H</span>
        <input
          :value="Math.round(hslDraft.h)"
          class="danx-color-picker__number"
          type="number"
          min="0"
          max="360"
          :data-test="testIdFor('hsl-h')"
          @input="(e) => onHslInput('h', e)"
        />
      </label>
      <label class="danx-color-picker__input-group">
        <span class="danx-color-picker__input-label">S</span>
        <input
          :value="Math.round(hslDraft.s)"
          class="danx-color-picker__number"
          type="number"
          min="0"
          max="100"
          :data-test="testIdFor('hsl-s')"
          @input="(e) => onHslInput('s', e)"
        />
      </label>
      <label class="danx-color-picker__input-group">
        <span class="danx-color-picker__input-label">L</span>
        <input
          :value="Math.round(hslDraft.l)"
          class="danx-color-picker__number"
          type="number"
          min="0"
          max="100"
          :data-test="testIdFor('hsl-l')"
          @input="(e) => onHslInput('l', e)"
        />
      </label>
      <label v-if="alpha" class="danx-color-picker__input-group">
        <span class="danx-color-picker__input-label">A</span>
        <input
          :value="Math.round(internal.a * 100) / 100"
          class="danx-color-picker__number"
          type="number"
          min="0"
          max="1"
          step="0.01"
          :data-test="testIdFor('hsl-a')"
          @input="onAlphaInput"
        />
      </label>
    </div>

    <div v-if="recent.length > 0" class="danx-color-picker__recents">
      <span class="danx-color-picker__section-label">Recent</span>
      <div class="danx-color-picker__recent-strip" :data-test="testIdFor('recents')">
        <button
          v-for="(c, i) in recent"
          :key="`recent-${i}-${c}`"
          type="button"
          class="danx-color-picker__swatch-cell"
          :style="{ background: c }"
          :aria-label="`Recent color ${c}`"
          :data-test="testIdFor(`recent-${i}`)"
          @click="selectSwatch(c)"
        ></button>
      </div>
    </div>

    <div class="danx-color-picker__palette-wrap">
      <span class="danx-color-picker__section-label">Palette</span>
      <div
        class="danx-color-picker__palette"
        :style="paletteStyle"
        role="grid"
        :data-test="testIdFor('palette')"
      >
        <button
          v-for="(c, i) in swatches"
          :key="`palette-${i}-${c}`"
          :ref="setSwatchRef(i)"
          type="button"
          class="danx-color-picker__swatch-cell"
          :style="{ background: c }"
          :aria-label="`Color ${c}`"
          :data-test="testIdFor(`palette-${i}`)"
          @click="selectSwatch(c)"
          @keydown.enter.prevent="selectSwatch(c)"
          @keydown.space.prevent="selectSwatch(c)"
          @keydown="(e) => onPaletteKey(e, i)"
        ></button>
      </div>
    </div>

    <div class="danx-color-picker__actions">
      <button
        v-if="supportsEyedropper"
        type="button"
        class="danx-color-picker__action"
        :data-test="testIdFor('eyedropper')"
        @click="onEyedropper"
      >
        Eyedropper
      </button>
      <button
        v-if="clearable"
        type="button"
        class="danx-color-picker__action"
        :data-test="testIdFor('clear')"
        @click="onClear"
      >
        Clear
      </button>
    </div>

    <p
      v-if="eyedropperError"
      class="danx-color-picker__inline-error"
      :data-test="testIdFor('eyedropper-error')"
    >
      {{ eyedropperError }}
    </p>
  </div>
</template>
