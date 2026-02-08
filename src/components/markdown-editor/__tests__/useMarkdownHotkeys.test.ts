import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, type Ref } from "vue";
import {
	parseKeyCombo,
	matchesKeyCombo,
	useMarkdownHotkeys,
	HotkeyDefinition
} from "../useMarkdownHotkeys";

/**
 * Helper to create a mock KeyboardEvent with specified properties
 */
function createKeyboardEvent(options: {
	key: string;
	code?: string;
	ctrlKey?: boolean;
	shiftKey?: boolean;
	altKey?: boolean;
	metaKey?: boolean;
}): KeyboardEvent {
	return {
		key: options.key,
		code: options.code || "",
		ctrlKey: options.ctrlKey || false,
		shiftKey: options.shiftKey || false,
		altKey: options.altKey || false,
		metaKey: options.metaKey || false,
		preventDefault: vi.fn()
	} as unknown as KeyboardEvent;
}

describe("useMarkdownHotkeys", () => {
	describe("parseKeyCombo", () => {
		it("parses simple key without modifiers", () => {
			const result = parseKeyCombo("a");
			expect(result).toEqual({
				key: "a",
				ctrl: false,
				shift: false,
				alt: false,
				meta: false
			});
		});

		it("parses ctrl+key combination", () => {
			const result = parseKeyCombo("ctrl+b");
			expect(result).toEqual({
				key: "b",
				ctrl: true,
				shift: false,
				alt: false,
				meta: false
			});
		});

		it("parses control as alias for ctrl", () => {
			const result = parseKeyCombo("control+b");
			expect(result).toEqual({
				key: "b",
				ctrl: true,
				shift: false,
				alt: false,
				meta: false
			});
		});

		it("parses shift+key combination", () => {
			const result = parseKeyCombo("shift+a");
			expect(result).toEqual({
				key: "a",
				ctrl: false,
				shift: true,
				alt: false,
				meta: false
			});
		});

		it("parses alt+key combination", () => {
			const result = parseKeyCombo("alt+x");
			expect(result).toEqual({
				key: "x",
				ctrl: false,
				shift: false,
				alt: true,
				meta: false
			});
		});

		it("parses option as alias for alt (Mac)", () => {
			const result = parseKeyCombo("option+x");
			expect(result).toEqual({
				key: "x",
				ctrl: false,
				shift: false,
				alt: true,
				meta: false
			});
		});

		it("parses meta+key combination", () => {
			const result = parseKeyCombo("meta+s");
			expect(result).toEqual({
				key: "s",
				ctrl: false,
				shift: false,
				alt: false,
				meta: true
			});
		});

		it("parses cmd as alias for meta (Mac)", () => {
			const result = parseKeyCombo("cmd+s");
			expect(result).toEqual({
				key: "s",
				ctrl: false,
				shift: false,
				alt: false,
				meta: true
			});
		});

		it("parses command as alias for meta (Mac)", () => {
			const result = parseKeyCombo("command+s");
			expect(result).toEqual({
				key: "s",
				ctrl: false,
				shift: false,
				alt: false,
				meta: true
			});
		});

		it("parses win as alias for meta (Windows)", () => {
			const result = parseKeyCombo("win+e");
			expect(result).toEqual({
				key: "e",
				ctrl: false,
				shift: false,
				alt: false,
				meta: true
			});
		});

		it("parses windows as alias for meta (Windows)", () => {
			const result = parseKeyCombo("windows+e");
			expect(result).toEqual({
				key: "e",
				ctrl: false,
				shift: false,
				alt: false,
				meta: true
			});
		});

		it("parses ctrl+shift+key combination", () => {
			const result = parseKeyCombo("ctrl+shift+b");
			expect(result).toEqual({
				key: "b",
				ctrl: true,
				shift: true,
				alt: false,
				meta: false
			});
		});

		it("parses ctrl+alt+key combination", () => {
			const result = parseKeyCombo("ctrl+alt+d");
			expect(result).toEqual({
				key: "d",
				ctrl: true,
				shift: false,
				alt: true,
				meta: false
			});
		});

		it("parses all modifiers together", () => {
			const result = parseKeyCombo("ctrl+shift+alt+meta+x");
			expect(result).toEqual({
				key: "x",
				ctrl: true,
				shift: true,
				alt: true,
				meta: true
			});
		});

		it("handles uppercase input (normalizes to lowercase)", () => {
			const result = parseKeyCombo("CTRL+SHIFT+B");
			expect(result).toEqual({
				key: "b",
				ctrl: true,
				shift: true,
				alt: false,
				meta: false
			});
		});

		it("parses number keys", () => {
			const result = parseKeyCombo("ctrl+1");
			expect(result).toEqual({
				key: "1",
				ctrl: true,
				shift: false,
				alt: false,
				meta: false
			});
		});

		it("parses bracket key [", () => {
			const result = parseKeyCombo("ctrl+shift+[");
			expect(result).toEqual({
				key: "[",
				ctrl: true,
				shift: true,
				alt: false,
				meta: false
			});
		});

		it("parses bracket key ]", () => {
			const result = parseKeyCombo("ctrl+shift+]");
			expect(result).toEqual({
				key: "]",
				ctrl: true,
				shift: true,
				alt: false,
				meta: false
			});
		});

		it("parses special characters", () => {
			const result = parseKeyCombo("ctrl+/");
			expect(result).toEqual({
				key: "/",
				ctrl: true,
				shift: false,
				alt: false,
				meta: false
			});
		});
	});

	describe("matchesKeyCombo", () => {
		describe("basic key matching", () => {
			it("matches simple key press", () => {
				const event = createKeyboardEvent({ key: "a" });
				const parsed = parseKeyCombo("a");
				expect(matchesKeyCombo(event, parsed)).toBe(true);
			});

			it("does not match wrong key", () => {
				const event = createKeyboardEvent({ key: "b" });
				const parsed = parseKeyCombo("a");
				expect(matchesKeyCombo(event, parsed)).toBe(false);
			});

			it("matches case-insensitively", () => {
				const event = createKeyboardEvent({ key: "A" });
				const parsed = parseKeyCombo("a");
				expect(matchesKeyCombo(event, parsed)).toBe(true);
			});
		});

		describe("modifier key matching", () => {
			it("matches ctrl+key on Windows/Linux", () => {
				const event = createKeyboardEvent({ key: "b", ctrlKey: true });
				const parsed = parseKeyCombo("ctrl+b");
				expect(matchesKeyCombo(event, parsed)).toBe(true);
			});

			it("does not match when ctrl is expected but not pressed", () => {
				const event = createKeyboardEvent({ key: "b", ctrlKey: false });
				const parsed = parseKeyCombo("ctrl+b");
				expect(matchesKeyCombo(event, parsed)).toBe(false);
			});

			it("does not match when extra modifiers are pressed", () => {
				const event = createKeyboardEvent({ key: "b", ctrlKey: true, shiftKey: true });
				const parsed = parseKeyCombo("ctrl+b");
				expect(matchesKeyCombo(event, parsed)).toBe(false);
			});

			it("matches shift+key", () => {
				const event = createKeyboardEvent({ key: "a", shiftKey: true });
				const parsed = parseKeyCombo("shift+a");
				expect(matchesKeyCombo(event, parsed)).toBe(true);
			});

			it("matches alt+key", () => {
				const event = createKeyboardEvent({ key: "x", altKey: true });
				const parsed = parseKeyCombo("alt+x");
				expect(matchesKeyCombo(event, parsed)).toBe(true);
			});

			it("matches ctrl+shift+key", () => {
				const event = createKeyboardEvent({ key: "b", ctrlKey: true, shiftKey: true });
				const parsed = parseKeyCombo("ctrl+shift+b");
				expect(matchesKeyCombo(event, parsed)).toBe(true);
			});

			it("matches meta+key (for explicit meta hotkeys)", () => {
				const event = createKeyboardEvent({ key: "s", metaKey: true });
				const parsed = parseKeyCombo("meta+s");
				expect(matchesKeyCombo(event, parsed)).toBe(true);
			});
		});

		describe("number key matching", () => {
			it("matches ctrl+1", () => {
				const event = createKeyboardEvent({ key: "1", code: "Digit1", ctrlKey: true });
				const parsed = parseKeyCombo("ctrl+1");
				expect(matchesKeyCombo(event, parsed)).toBe(true);
			});

			it("matches ctrl+2", () => {
				const event = createKeyboardEvent({ key: "2", code: "Digit2", ctrlKey: true });
				const parsed = parseKeyCombo("ctrl+2");
				expect(matchesKeyCombo(event, parsed)).toBe(true);
			});

			it("matches ctrl+3", () => {
				const event = createKeyboardEvent({ key: "3", code: "Digit3", ctrlKey: true });
				const parsed = parseKeyCombo("ctrl+3");
				expect(matchesKeyCombo(event, parsed)).toBe(true);
			});

			it("matches ctrl+4", () => {
				const event = createKeyboardEvent({ key: "4", code: "Digit4", ctrlKey: true });
				const parsed = parseKeyCombo("ctrl+4");
				expect(matchesKeyCombo(event, parsed)).toBe(true);
			});

			it("matches ctrl+5", () => {
				const event = createKeyboardEvent({ key: "5", code: "Digit5", ctrlKey: true });
				const parsed = parseKeyCombo("ctrl+5");
				expect(matchesKeyCombo(event, parsed)).toBe(true);
			});

			it("matches ctrl+6", () => {
				const event = createKeyboardEvent({ key: "6", code: "Digit6", ctrlKey: true });
				const parsed = parseKeyCombo("ctrl+6");
				expect(matchesKeyCombo(event, parsed)).toBe(true);
			});

			it("matches numpad keys", () => {
				const event = createKeyboardEvent({ key: "1", code: "Numpad1", ctrlKey: true });
				const parsed = parseKeyCombo("ctrl+1");
				expect(matchesKeyCombo(event, parsed)).toBe(true);
			});

			it("does not match wrong number", () => {
				const event = createKeyboardEvent({ key: "2", code: "Digit2", ctrlKey: true });
				const parsed = parseKeyCombo("ctrl+1");
				expect(matchesKeyCombo(event, parsed)).toBe(false);
			});
		});

		describe("shifted key handling", () => {
			it("matches > when browser reports > directly", () => {
				// Browser reports the shifted character
				const event = createKeyboardEvent({ key: ">", shiftKey: true, ctrlKey: true });
				const parsed = parseKeyCombo("ctrl+>");
				expect(matchesKeyCombo(event, parsed)).toBe(true);
			});

			it("matches < when browser reports < directly", () => {
				const event = createKeyboardEvent({ key: "<", shiftKey: true, ctrlKey: true });
				const parsed = parseKeyCombo("ctrl+<");
				expect(matchesKeyCombo(event, parsed)).toBe(true);
			});

			it("matches ? when browser reports ? directly", () => {
				const event = createKeyboardEvent({ key: "?", shiftKey: true, ctrlKey: true });
				const parsed = parseKeyCombo("ctrl+?");
				expect(matchesKeyCombo(event, parsed)).toBe(true);
			});

			it("matches > via shift+. combination", () => {
				// Browser reports the base key with shift
				const event = createKeyboardEvent({ key: ".", shiftKey: true, ctrlKey: true });
				const parsed = parseKeyCombo("ctrl+>");
				expect(matchesKeyCombo(event, parsed)).toBe(true);
			});

			it("matches < via shift+, combination", () => {
				const event = createKeyboardEvent({ key: ",", shiftKey: true, ctrlKey: true });
				const parsed = parseKeyCombo("ctrl+<");
				expect(matchesKeyCombo(event, parsed)).toBe(true);
			});

			it("matches ? via shift+/ combination", () => {
				const event = createKeyboardEvent({ key: "/", shiftKey: true, ctrlKey: true });
				const parsed = parseKeyCombo("ctrl+?");
				expect(matchesKeyCombo(event, parsed)).toBe(true);
			});

			it("matches ! when browser reports !", () => {
				const event = createKeyboardEvent({ key: "!", shiftKey: true, ctrlKey: true });
				const parsed = parseKeyCombo("ctrl+!");
				expect(matchesKeyCombo(event, parsed)).toBe(true);
			});

			it("matches @ when browser reports @", () => {
				const event = createKeyboardEvent({ key: "@", shiftKey: true, ctrlKey: true });
				const parsed = parseKeyCombo("ctrl+@");
				expect(matchesKeyCombo(event, parsed)).toBe(true);
			});

			it("matches # when browser reports #", () => {
				const event = createKeyboardEvent({ key: "#", shiftKey: true, ctrlKey: true });
				const parsed = parseKeyCombo("ctrl+#");
				expect(matchesKeyCombo(event, parsed)).toBe(true);
			});
		});

		describe("bracket hotkeys (ctrl+shift+[ and ctrl+shift+])", () => {
			it("matches ctrl+shift+[ when browser reports { (shifted character)", () => {
				// When pressing Ctrl+Shift+[, browser reports key as "{"
				const event = createKeyboardEvent({ key: "{", shiftKey: true, ctrlKey: true });
				const parsed = parseKeyCombo("ctrl+shift+[");
				expect(matchesKeyCombo(event, parsed)).toBe(true);
			});

			it("matches ctrl+shift+] when browser reports } (shifted character)", () => {
				// When pressing Ctrl+Shift+], browser reports key as "}"
				const event = createKeyboardEvent({ key: "}", shiftKey: true, ctrlKey: true });
				const parsed = parseKeyCombo("ctrl+shift+]");
				expect(matchesKeyCombo(event, parsed)).toBe(true);
			});

			it("matches ctrl+shift+[ when browser reports [ with shift", () => {
				// Alternative: browser might report base key with shift modifier
				const event = createKeyboardEvent({ key: "[", shiftKey: true, ctrlKey: true });
				const parsed = parseKeyCombo("ctrl+shift+[");
				expect(matchesKeyCombo(event, parsed)).toBe(true);
			});

			it("matches ctrl+shift+] when browser reports ] with shift", () => {
				const event = createKeyboardEvent({ key: "]", shiftKey: true, ctrlKey: true });
				const parsed = parseKeyCombo("ctrl+shift+]");
				expect(matchesKeyCombo(event, parsed)).toBe(true);
			});

			it("does not match ctrl+[ without shift", () => {
				const event = createKeyboardEvent({ key: "[", shiftKey: false, ctrlKey: true });
				const parsed = parseKeyCombo("ctrl+shift+[");
				expect(matchesKeyCombo(event, parsed)).toBe(false);
			});

			it("does not match ctrl+] without shift", () => {
				const event = createKeyboardEvent({ key: "]", shiftKey: false, ctrlKey: true });
				const parsed = parseKeyCombo("ctrl+shift+]");
				expect(matchesKeyCombo(event, parsed)).toBe(false);
			});

			it("does not match shift+[ without ctrl", () => {
				const event = createKeyboardEvent({ key: "{", shiftKey: true, ctrlKey: false });
				const parsed = parseKeyCombo("ctrl+shift+[");
				expect(matchesKeyCombo(event, parsed)).toBe(false);
			});
		});

		describe("arrow key normalization", () => {
			it("matches ArrowUp to ctrl+alt+shift+up", () => {
				const event = createKeyboardEvent({
					key: "ArrowUp",
					ctrlKey: true,
					altKey: true,
					shiftKey: true
				});
				const parsed = parseKeyCombo("ctrl+alt+shift+up");
				expect(matchesKeyCombo(event, parsed)).toBe(true);
			});

			it("matches ArrowDown to ctrl+alt+shift+down", () => {
				const event = createKeyboardEvent({
					key: "ArrowDown",
					ctrlKey: true,
					altKey: true,
					shiftKey: true
				});
				const parsed = parseKeyCombo("ctrl+alt+shift+down");
				expect(matchesKeyCombo(event, parsed)).toBe(true);
			});

			it("matches ArrowLeft to ctrl+alt+shift+left", () => {
				const event = createKeyboardEvent({
					key: "ArrowLeft",
					ctrlKey: true,
					altKey: true,
					shiftKey: true
				});
				const parsed = parseKeyCombo("ctrl+alt+shift+left");
				expect(matchesKeyCombo(event, parsed)).toBe(true);
			});

			it("matches ArrowRight to ctrl+alt+shift+right", () => {
				const event = createKeyboardEvent({
					key: "ArrowRight",
					ctrlKey: true,
					altKey: true,
					shiftKey: true
				});
				const parsed = parseKeyCombo("ctrl+alt+shift+right");
				expect(matchesKeyCombo(event, parsed)).toBe(true);
			});

			it("matches ArrowUp with only ctrl modifier", () => {
				const event = createKeyboardEvent({
					key: "ArrowUp",
					ctrlKey: true
				});
				const parsed = parseKeyCombo("ctrl+up");
				expect(matchesKeyCombo(event, parsed)).toBe(true);
			});

			it("matches ArrowDown with only alt modifier", () => {
				const event = createKeyboardEvent({
					key: "ArrowDown",
					altKey: true
				});
				const parsed = parseKeyCombo("alt+down");
				expect(matchesKeyCombo(event, parsed)).toBe(true);
			});

			it("does not match ArrowUp when expecting ArrowDown", () => {
				const event = createKeyboardEvent({
					key: "ArrowUp",
					ctrlKey: true
				});
				const parsed = parseKeyCombo("ctrl+down");
				expect(matchesKeyCombo(event, parsed)).toBe(false);
			});

			it("does not match when modifiers are different", () => {
				const event = createKeyboardEvent({
					key: "ArrowUp",
					ctrlKey: true,
					shiftKey: false
				});
				const parsed = parseKeyCombo("ctrl+shift+up");
				expect(matchesKeyCombo(event, parsed)).toBe(false);
			});
		});

		describe("cross-platform modifier handling", () => {
			// Note: These tests check the function behavior; actual Mac detection
			// depends on navigator.platform which is mocked by jsdom

			it("matches ctrl+key when only ctrl is pressed (non-Mac)", () => {
				const event = createKeyboardEvent({ key: "c", ctrlKey: true, metaKey: false });
				const parsed = parseKeyCombo("ctrl+c");
				expect(matchesKeyCombo(event, parsed)).toBe(true);
			});

			it("does not match key press when ctrl is required but neither ctrl nor meta pressed", () => {
				const event = createKeyboardEvent({ key: "c", ctrlKey: false, metaKey: false });
				const parsed = parseKeyCombo("ctrl+c");
				expect(matchesKeyCombo(event, parsed)).toBe(false);
			});
		});
	});

	describe("useMarkdownHotkeys composable", () => {
		let contentRef: Ref<HTMLElement | null>;
		let onShowHotkeyHelp: () => void;

		beforeEach(() => {
			contentRef = ref<HTMLElement | null>(document.createElement("div"));
			onShowHotkeyHelp = vi.fn() as unknown as () => void;
		});

		it("registers and retrieves hotkey definitions", () => {
			const { registerHotkey, getHotkeyDefinitions } = useMarkdownHotkeys({
				contentRef,
				onShowHotkeyHelp
			});

			const def: HotkeyDefinition = {
				key: "ctrl+b",
				action: (vi.fn() as unknown as () => void),
				description: "Bold",
				group: "formatting"
			};

			registerHotkey(def);

			const definitions = getHotkeyDefinitions();
			expect(definitions).toHaveLength(1);
			expect(definitions[0]!.key).toBe("ctrl+b");
			expect(definitions[0]!.description).toBe("Bold");
		});

		it("unregisters hotkeys", () => {
			const { registerHotkey, unregisterHotkey, getHotkeyDefinitions } = useMarkdownHotkeys({
				contentRef,
				onShowHotkeyHelp
			});

			registerHotkey({
				key: "ctrl+b",
				action: (vi.fn() as unknown as () => void),
				description: "Bold",
				group: "formatting"
			});

			expect(getHotkeyDefinitions()).toHaveLength(1);

			unregisterHotkey("ctrl+b");

			expect(getHotkeyDefinitions()).toHaveLength(0);
		});

		it("handles keydown and executes registered action", () => {
			const { registerHotkey, handleKeyDown } = useMarkdownHotkeys({
				contentRef,
				onShowHotkeyHelp
			});

			const action = vi.fn() as unknown as () => void;
			registerHotkey({
				key: "ctrl+b",
				action,
				description: "Bold",
				group: "formatting"
			});

			const event = createKeyboardEvent({ key: "b", ctrlKey: true });
			const handled = handleKeyDown(event);

			expect(handled).toBe(true);
			expect(action).toHaveBeenCalledTimes(1);
			expect((event.preventDefault as any)).toHaveBeenCalled();
		});

		it("returns false when no hotkey matches", () => {
			const { handleKeyDown } = useMarkdownHotkeys({
				contentRef,
				onShowHotkeyHelp
			});

			const event = createKeyboardEvent({ key: "x" });
			const handled = handleKeyDown(event);

			expect(handled).toBe(false);
			expect((event.preventDefault as any)).not.toHaveBeenCalled();
		});

		it("triggers help on ctrl+/", () => {
			const { handleKeyDown } = useMarkdownHotkeys({
				contentRef,
				onShowHotkeyHelp
			});

			const event = createKeyboardEvent({ key: "/", ctrlKey: true });
			const handled = handleKeyDown(event);

			expect(handled).toBe(true);
			expect(onShowHotkeyHelp).toHaveBeenCalledTimes(1);
		});

		it("triggers help on ctrl+?", () => {
			const { handleKeyDown } = useMarkdownHotkeys({
				contentRef,
				onShowHotkeyHelp
			});

			const event = createKeyboardEvent({ key: "?", ctrlKey: true });
			const handled = handleKeyDown(event);

			expect(handled).toBe(true);
			expect(onShowHotkeyHelp).toHaveBeenCalledTimes(1);
		});

		it("triggers help on meta+/ (Mac)", () => {
			const { handleKeyDown } = useMarkdownHotkeys({
				contentRef,
				onShowHotkeyHelp
			});

			const event = createKeyboardEvent({ key: "/", metaKey: true });
			const handled = handleKeyDown(event);

			expect(handled).toBe(true);
			expect(onShowHotkeyHelp).toHaveBeenCalledTimes(1);
		});

		it("handles multiple registered hotkeys", () => {
			const { registerHotkey, handleKeyDown } = useMarkdownHotkeys({
				contentRef,
				onShowHotkeyHelp
			});

			const boldAction = vi.fn() as unknown as () => void;
			const italicAction = vi.fn() as unknown as () => void;

			registerHotkey({
				key: "ctrl+b",
				action: boldAction,
				description: "Bold",
				group: "formatting"
			});

			registerHotkey({
				key: "ctrl+i",
				action: italicAction,
				description: "Italic",
				group: "formatting"
			});

			const boldEvent = createKeyboardEvent({ key: "b", ctrlKey: true });
			handleKeyDown(boldEvent);
			expect(boldAction).toHaveBeenCalledTimes(1);
			expect(italicAction).not.toHaveBeenCalled();

			const italicEvent = createKeyboardEvent({ key: "i", ctrlKey: true });
			handleKeyDown(italicEvent);
			expect(italicAction).toHaveBeenCalledTimes(1);
		});

		it("normalizes hotkey keys to lowercase", () => {
			const { registerHotkey, handleKeyDown } = useMarkdownHotkeys({
				contentRef,
				onShowHotkeyHelp
			});

			const action = vi.fn() as unknown as () => void;
			registerHotkey({
				key: "CTRL+B", // Uppercase input
				action,
				description: "Bold",
				group: "formatting"
			});

			// Event with lowercase key
			const event = createKeyboardEvent({ key: "b", ctrlKey: true });
			const handled = handleKeyDown(event);

			expect(handled).toBe(true);
			expect(action).toHaveBeenCalled();
		});

		describe("bracket hotkey integration", () => {
			it("handles ctrl+shift+[ hotkey registration and execution", () => {
				const { registerHotkey, handleKeyDown } = useMarkdownHotkeys({
					contentRef,
					onShowHotkeyHelp
				});

				const increaseHeadingAction = vi.fn();
				registerHotkey({
					key: "ctrl+shift+[",
					action: increaseHeadingAction,
					description: "Increase heading level",
					group: "headings"
				});

				// Browser reports "{" when Ctrl+Shift+[ is pressed
				const event = createKeyboardEvent({ key: "{", ctrlKey: true, shiftKey: true });
				const handled = handleKeyDown(event);

				expect(handled).toBe(true);
				expect(increaseHeadingAction).toHaveBeenCalledTimes(1);
			});

			it("handles ctrl+shift+] hotkey registration and execution", () => {
				const { registerHotkey, handleKeyDown } = useMarkdownHotkeys({
					contentRef,
					onShowHotkeyHelp
				});

				const decreaseHeadingAction = vi.fn();
				registerHotkey({
					key: "ctrl+shift+]",
					action: decreaseHeadingAction,
					description: "Decrease heading level",
					group: "headings"
				});

				// Browser reports "}" when Ctrl+Shift+] is pressed
				const event = createKeyboardEvent({ key: "}", ctrlKey: true, shiftKey: true });
				const handled = handleKeyDown(event);

				expect(handled).toBe(true);
				expect(decreaseHeadingAction).toHaveBeenCalledTimes(1);
			});
		});
	});
});
