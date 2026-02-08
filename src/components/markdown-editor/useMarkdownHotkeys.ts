import { Ref, ref } from "vue";

/**
 * Hotkey group categories for organization
 */
export type HotkeyGroup = "headings" | "formatting" | "lists" | "blocks" | "tables" | "other";

/**
 * Definition for a registered hotkey
 */
export interface HotkeyDefinition {
	/** Key combination string, e.g., 'ctrl+1', 'ctrl+shift+b' */
	key: string;
	/** Action to execute when hotkey is triggered */
	action: () => void;
	/** Human-readable description for help display */
	description: string;
	/** Category group for help organization */
	group: HotkeyGroup;
}

/**
 * Options for useMarkdownHotkeys composable
 */
export interface UseMarkdownHotkeysOptions {
	contentRef: Ref<HTMLElement | null>;
	onShowHotkeyHelp: () => void;
}

/**
 * Return type for useMarkdownHotkeys composable
 */
export interface UseMarkdownHotkeysReturn {
	registerHotkey: (def: HotkeyDefinition) => void;
	unregisterHotkey: (key: string) => void;
	handleKeyDown: (event: KeyboardEvent) => boolean;
	getHotkeyDefinitions: () => HotkeyDefinition[];
}

/**
 * Parsed key combination for matching
 */
export interface ParsedKey {
	key: string;
	ctrl: boolean;
	shift: boolean;
	alt: boolean;
	meta: boolean;
}

/**
 * Parse a key combination string into its components
 * Supports: ctrl, shift, alt, meta/cmd
 *
 * Examples:
 * - 'ctrl+1' -> { key: '1', ctrl: true, ... }
 * - 'ctrl+shift+b' -> { key: 'b', ctrl: true, shift: true, ... }
 * - 'cmd+s' -> { key: 's', meta: true, ... } (Mac)
 */
export function parseKeyCombo(combo: string): ParsedKey {
	const parts = combo.toLowerCase().split("+");
	const result: ParsedKey = {
		key: "",
		ctrl: false,
		shift: false,
		alt: false,
		meta: false
	};

	for (const part of parts) {
		switch (part) {
			case "ctrl":
			case "control":
				result.ctrl = true;
				break;
			case "shift":
				result.shift = true;
				break;
			case "alt":
			case "option":
				result.alt = true;
				break;
			case "meta":
			case "cmd":
			case "command":
			case "win":
			case "windows":
				result.meta = true;
				break;
			default:
				// This is the actual key
				result.key = part;
		}
	}

	return result;
}

/**
 * Check if a keyboard event matches a parsed key combination
 * Handles cross-platform modifier differences (Ctrl on Windows/Linux, Cmd on Mac)
 */
export function matchesKeyCombo(event: KeyboardEvent, parsed: ParsedKey): boolean {
	// Normalize the event key
	let eventKey = event.key.toLowerCase();

	// Normalize arrow keys: ArrowUp -> up, ArrowDown -> down, etc.
	if (eventKey.startsWith("arrow")) {
		eventKey = eventKey.replace("arrow", "");
	}

	// Special handling for shifted keys
	// When shift is held, some keys produce different characters
	const shiftedKeys: Record<string, string> = {
		">": ".",
		"<": ",",
		"?": "/",
		"!": "1",
		"@": "2",
		"#": "3",
		"$": "4",
		"%": "5",
		"^": "6",
		"&": "7",
		"*": "8",
		"(": "9",
		")": "0",
		"{": "[",
		"}": "]"
	};

	// If the parsed key expects a shifted character, check if we have the right combination
	if (shiftedKeys[parsed.key]) {
		// User wants to match '>' which is shift+.
		if (eventKey === parsed.key) {
			// Browser reports the shifted character directly
			return matchesModifiers(event, { ...parsed, shift: true });
		}
		// Or check if shift+base key matches
		if (event.shiftKey && eventKey === shiftedKeys[parsed.key]) {
			return matchesModifiers(event, { ...parsed, shift: true });
		}
	}

	// Handle case where browser reports shifted character but hotkey expects base key with shift
	// e.g., hotkey "ctrl+shift+[" but browser reports "{" when Ctrl+Shift+[ is pressed
	if (shiftedKeys[eventKey] && shiftedKeys[eventKey] === parsed.key) {
		// The event key is a shifted character (e.g., "{") that maps to the parsed key (e.g., "[")
		return matchesModifiers(event, parsed);
	}

	// Handle number keys (both main keyboard and numpad)
	if (/^[0-6]$/.test(parsed.key)) {
		if (eventKey !== parsed.key && event.code !== `Digit${parsed.key}` && event.code !== `Numpad${parsed.key}`) {
			return false;
		}
	} else if (eventKey !== parsed.key) {
		return false;
	}

	return matchesModifiers(event, parsed);
}

/**
 * Check if modifier keys match
 * On Mac, treat Cmd (metaKey) as equivalent to Ctrl for cross-platform support
 */
function matchesModifiers(event: KeyboardEvent, parsed: ParsedKey): boolean {
	const isMac = navigator.platform.toLowerCase().includes("mac");

	// For cross-platform support:
	// - If hotkey specifies 'ctrl', match either ctrlKey or metaKey (on Mac)
	// - If hotkey specifies 'meta', match metaKey only
	let ctrlMatch: boolean;
	if (parsed.ctrl) {
		if (isMac) {
			// On Mac, ctrl+key can be either Ctrl+key or Cmd+key
			ctrlMatch = event.ctrlKey || event.metaKey;
		} else {
			ctrlMatch = event.ctrlKey;
		}
	} else if (parsed.meta) {
		ctrlMatch = event.metaKey;
	} else {
		// No modifier required, ensure neither is pressed
		ctrlMatch = !event.ctrlKey && !event.metaKey;
	}

	// Check other modifiers exactly
	const shiftMatch = parsed.shift === event.shiftKey;
	const altMatch = parsed.alt === event.altKey;

	return ctrlMatch && shiftMatch && altMatch;
}

/**
 * Composable for hotkey registration and dispatch in markdown editor
 */
export function useMarkdownHotkeys(options: UseMarkdownHotkeysOptions): UseMarkdownHotkeysReturn {
	const { onShowHotkeyHelp } = options;

	// Registry of all hotkeys
	const hotkeys = ref<Map<string, HotkeyDefinition>>(new Map());

	// Pre-parsed key combinations for performance
	const parsedKeys = new Map<string, ParsedKey>();

	/**
	 * Register a new hotkey
	 */
	function registerHotkey(def: HotkeyDefinition): void {
		const normalizedKey = def.key.toLowerCase();
		hotkeys.value.set(normalizedKey, def);
		parsedKeys.set(normalizedKey, parseKeyCombo(normalizedKey));
	}

	/**
	 * Unregister a hotkey
	 */
	function unregisterHotkey(key: string): void {
		const normalizedKey = key.toLowerCase();
		hotkeys.value.delete(normalizedKey);
		parsedKeys.delete(normalizedKey);
	}

	/**
	 * Get all registered hotkey definitions for help display
	 */
	function getHotkeyDefinitions(): HotkeyDefinition[] {
		return Array.from(hotkeys.value.values());
	}

	/**
	 * Handle a keydown event and dispatch to registered hotkey
	 * Returns true if a hotkey was matched and handled
	 */
	function handleKeyDown(event: KeyboardEvent): boolean {
		// Check for help shortcut first (Ctrl/Cmd + / or Ctrl/Cmd + ?)
		// Supports both Ctrl+/ (without shift) and Ctrl+? (which is Ctrl+Shift+/)
		if ((event.ctrlKey || event.metaKey) && (event.key === "?" || event.key === "/")) {
			event.preventDefault();
			onShowHotkeyHelp();
			return true;
		}

		// Check all registered hotkeys
		for (const [key, def] of hotkeys.value) {
			const parsed = parsedKeys.get(key);

			if (parsed && matchesKeyCombo(event, parsed)) {
				event.preventDefault();
				def.action();
				return true;
			}
		}

		return false;
	}

	return {
		registerHotkey,
		unregisterHotkey,
		handleKeyDown,
		getHotkeyDefinitions
	};
}
