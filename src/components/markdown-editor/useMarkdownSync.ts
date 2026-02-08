import { onUnmounted, Ref, ref } from "vue";
import { renderMarkdown } from "../../shared/markdown";
import { CodeBlockState } from "./useCodeBlocks";
import { TokenRenderer, TokenState } from "./types";

/**
 * Options for useMarkdownSync composable
 */
export interface UseMarkdownSyncOptions {
	contentRef: Ref<HTMLElement | null>;
	onEmitValue: (markdown: string) => void;
	debounceMs?: number;
	/** Optional function to look up code block state by ID */
	getCodeBlockById?: (id: string) => CodeBlockState | undefined;
	/** Optional function to register a new code block in state */
	registerCodeBlock?: (id: string, content: string, language: string) => void;
	/** Optional array of token renderers for custom inline tokens */
	tokenRenderers?: TokenRenderer[];
	/** Optional function to look up token state by ID */
	getTokenById?: (id: string) => TokenState | undefined;
	/** Optional function to register a new token in state */
	registerToken?: (id: string, rendererId: string, groups: string[]) => void;
}

/**
 * Return type for useMarkdownSync composable
 */
export interface UseMarkdownSyncReturn {
	renderedHtml: Ref<string>;
	isInternalUpdate: Ref<boolean>;
	syncFromMarkdown: (markdown: string) => void;
	syncFromHtml: () => void;
	debouncedSyncFromHtml: () => void;
}

/** Code block state lookup function type */
type CodeBlockLookup = (id: string) => CodeBlockState | undefined;

/** Code block registration function type */
type CodeBlockRegister = (id: string, content: string, language: string) => void;

/** Token state lookup function type */
type TokenLookup = (id: string) => TokenState | undefined;

/** Token registration function type */
type TokenRegister = (id: string, rendererId: string, groups: string[]) => void;

/**
 * Generate a unique ID for code blocks
 */
function generateCodeBlockId(): string {
	return `cb-${crypto.randomUUID()}`;
}

/**
 * Convert <pre><code> elements in HTML string to code block wrapper structure.
 * This allows CodeBlockManager to mount CodeViewer instances.
 */
function convertCodeBlocksToWrappers(html: string, registerCodeBlock?: CodeBlockRegister): string {
	// Parse the HTML
	const temp = document.createElement("div");
	temp.innerHTML = html;

	// Find all <pre> elements (code blocks)
	const preElements = temp.querySelectorAll("pre");

	for (const pre of Array.from(preElements)) {
		// Get the code element inside
		const codeElement = pre.querySelector("code");
		if (!codeElement) continue;

		// Extract content and language
		const content = codeElement.textContent || "";
		const langMatch = codeElement.className.match(/language-(\w+)/);
		const language = langMatch ? langMatch[1]! : "";

		// Generate unique ID
		const id = generateCodeBlockId();

		// Register in state if callback provided
		if (registerCodeBlock) {
			registerCodeBlock(id, content, language);
		}

		// Create wrapper structure
		const wrapper = document.createElement("div");
		wrapper.className = "code-block-wrapper";
		wrapper.setAttribute("contenteditable", "false");
		wrapper.setAttribute("data-code-block-id", id);

		// Create mount point for CodeViewer
		const mountPoint = document.createElement("div");
		mountPoint.className = "code-viewer-mount-point";
		mountPoint.setAttribute("data-content", content);
		mountPoint.setAttribute("data-language", language);
		wrapper.appendChild(mountPoint);

		// Replace the <pre> with the wrapper
		pre.parentNode?.replaceChild(wrapper, pre);
	}

	return temp.innerHTML;
}

/**
 * Generate a unique ID for tokens
 */
function generateTokenId(): string {
	return `tok-${crypto.randomUUID()}`;
}

/**
 * Convert token patterns in HTML string to token wrapper structures.
 * This allows TokenManager to mount custom Vue components for tokens.
 *
 * Tokens are matched against renderer patterns and converted to:
 * <span class="custom-token-wrapper" contenteditable="false"
 *       data-token-id="tok-uuid" data-token-renderer="renderer-id"
 *       data-token-groups='["group1","group2"]'>
 *   <span class="token-mount-point"></span>
 * </span>
 */
function convertTokensToWrappers(
	html: string,
	tokenRenderers?: TokenRenderer[],
	registerToken?: TokenRegister
): string {
	if (!tokenRenderers || tokenRenderers.length === 0) {
		return html;
	}

	let result = html;

	for (const renderer of tokenRenderers) {
		// Reset regex lastIndex since we're using global flag
		renderer.pattern.lastIndex = 0;

		// Create a new regex for each iteration to avoid issues with global flag state
		const pattern = new RegExp(renderer.pattern.source, renderer.pattern.flags);

		result = result.replace(pattern, (_match, ...args) => {
			// Extract captured groups (args before the last two which are offset and full string)
			const groups = args.slice(0, -2).filter(g => g !== undefined) as string[];

			// Generate unique ID for this token instance
			const id = generateTokenId();

			// Register token in state if callback provided
			if (registerToken) {
				registerToken(id, renderer.id, groups);
			}

			// Create wrapper HTML structure
			const groupsJson = JSON.stringify(groups);
			return `<span class="custom-token-wrapper" contenteditable="false" data-token-id="${id}" data-token-renderer="${renderer.id}" data-token-groups='${groupsJson}'><span class="token-mount-point"></span></span>`;
		});
	}

	return result;
}

/**
 * Convert HTML back to markdown
 * This handles the reverse conversion from rendered HTML to markdown source
 */
function htmlToMarkdown(
	html: string,
	getCodeBlockById?: CodeBlockLookup,
	tokenRenderers?: TokenRenderer[],
	getTokenById?: TokenLookup
): string {
	// Create a temporary element to parse the HTML
	const temp = document.createElement("div");
	temp.innerHTML = html;

	return processNode(temp, getCodeBlockById, tokenRenderers, getTokenById);
}

/**
 * Process a DOM node and convert it to markdown
 */
function processNode(
	node: Node,
	getCodeBlockById?: CodeBlockLookup,
	tokenRenderers?: TokenRenderer[],
	getTokenById?: TokenLookup
): string {
	const parts: string[] = [];

	for (const child of Array.from(node.childNodes)) {
		if (child.nodeType === Node.TEXT_NODE) {
			parts.push(child.textContent || "");
		} else if (child.nodeType === Node.ELEMENT_NODE) {
			const element = child as Element;
			const tagName = element.tagName.toLowerCase();

			// Check for code block wrapper (non-editable island)
			const codeBlockId = element.getAttribute("data-code-block-id");
			if (codeBlockId && getCodeBlockById) {
				const state = getCodeBlockById(codeBlockId);
				if (state) {
					const lang = state.language || "";
					const content = state.content || "";
					// Strip any trailing zero-width spaces from content
					const cleanContent = content.replace(/\u200B/g, "");
					parts.push(`\`\`\`${lang}\n${cleanContent}\n\`\`\`\n\n`);
					continue;
				}
			}

			// Check for token wrapper (custom token island)
			const tokenId = element.getAttribute("data-token-id");
			if (tokenId && tokenRenderers && getTokenById) {
				const state = getTokenById(tokenId);
				if (state) {
					const renderer = tokenRenderers.find(r => r.id === state.rendererId);
					if (renderer) {
						// Call the renderer's toMarkdown function
						parts.push(renderer.toMarkdown(element as HTMLElement));
						continue;
					}
				}
			}

			switch (tagName) {
				// Headings
				case "h1":
					parts.push(`# ${getTextContent(element)}\n\n`);
					break;
				case "h2":
					parts.push(`## ${getTextContent(element)}\n\n`);
					break;
				case "h3":
					parts.push(`### ${getTextContent(element)}\n\n`);
					break;
				case "h4":
					parts.push(`#### ${getTextContent(element)}\n\n`);
					break;
				case "h5":
					parts.push(`##### ${getTextContent(element)}\n\n`);
					break;
				case "h6":
					parts.push(`###### ${getTextContent(element)}\n\n`);
					break;

				// Paragraphs
				case "p":
					parts.push(`${processInlineContent(element)}\n\n`);
					break;

				// Line breaks
				case "br":
					parts.push("  \n");
					break;

				// Bold
				case "strong":
				case "b":
					parts.push(`**${processInlineContent(element)}**`);
					break;

				// Italic
				case "em":
				case "i":
					parts.push(`*${processInlineContent(element)}*`);
					break;

				// Inline code
				case "code":
					if (element.parentElement?.tagName.toLowerCase() !== "pre") {
						parts.push(`\`${element.textContent || ""}\``);
					} else {
						parts.push(element.textContent || "");
					}
					break;

				// Code blocks (legacy PRE/CODE structure)
				case "pre": {
					const codeElement = element.querySelector("code");
					const code = codeElement?.textContent || element.textContent || "";
					// Strip zero-width spaces (cursor anchors)
					const cleanCode = code.replace(/\u200B/g, "");
					const langClass = codeElement?.className.match(/language-(\w+)/);
					const lang = langClass ? langClass[1] : "";
					parts.push(`\`\`\`${lang}\n${cleanCode}\n\`\`\`\n\n`);
					break;
				}

				// Blockquotes
				case "blockquote": {
					const content = processNode(element, getCodeBlockById, tokenRenderers, getTokenById).trim();
					const quotedLines = content.split("\n").map(line => `> ${line}`).join("\n");
					parts.push(`${quotedLines}\n\n`);
					break;
				}

				// Unordered lists
				case "ul":
					parts.push(processListItems(element, "-"));
					break;

				// Ordered lists
				case "ol":
					parts.push(processListItems(element, "1."));
					break;

				// List items (handled by processListItems)
				case "li":
					parts.push(processInlineContent(element));
					break;

				// Links
				case "a": {
					const href = element.getAttribute("href") || "";
					const text = processInlineContent(element);
					parts.push(`[${text}](${href})`);
					break;
				}

				// Images
				case "img": {
					const src = element.getAttribute("src") || "";
					const alt = element.getAttribute("alt") || "";
					parts.push(`![${alt}](${src})`);
					break;
				}

				// Horizontal rules
				case "hr":
					parts.push("---\n\n");
					break;

				// Strikethrough
				case "del":
				case "s":
					parts.push(`~~${processInlineContent(element)}~~`);
					break;

				// Highlight
				case "mark":
					parts.push(`==${processInlineContent(element)}==`);
					break;

				// Underline (no markdown equivalent, preserve as HTML)
				case "u":
					parts.push(`<u>${processInlineContent(element)}</u>`);
					break;

				// Superscript
				case "sup":
					parts.push(`^${processInlineContent(element)}^`);
					break;

				// Subscript
				case "sub":
					parts.push(`~${processInlineContent(element)}~`);
					break;

				// Divs - could be code block wrappers or regular divs
				case "div": {
					// Already handled code block wrappers above
					const content = processInlineContent(element);
					// Only add paragraph breaks if div has content
					if (content.trim()) {
						parts.push(`${content}\n\n`);
					}
					break;
				}

				// Spans - inline containers, just process children
				case "span":
					parts.push(processNode(element, getCodeBlockById, tokenRenderers, getTokenById));
					break;

				// Tables
				case "table":
					parts.push(processTable(element));
					break;

				default:
					// Unknown elements - just get text content
					parts.push(processNode(element, getCodeBlockById, tokenRenderers, getTokenById));
			}
		}
	}

	return parts.join("");
}

/**
 * Process inline content (text with inline formatting)
 */
function processInlineContent(element: Element): string {
	const parts: string[] = [];

	for (const child of Array.from(element.childNodes)) {
		if (child.nodeType === Node.TEXT_NODE) {
			parts.push(child.textContent || "");
		} else if (child.nodeType === Node.ELEMENT_NODE) {
			const el = child as Element;
			const tagName = el.tagName.toLowerCase();

			switch (tagName) {
				case "strong":
				case "b":
					parts.push(`**${processInlineContent(el)}**`);
					break;
				case "em":
				case "i":
					parts.push(`*${processInlineContent(el)}*`);
					break;
				case "code":
					parts.push(`\`${el.textContent || ""}\``);
					break;
				case "a": {
					const href = el.getAttribute("href") || "";
					parts.push(`[${processInlineContent(el)}](${href})`);
					break;
				}
				case "img": {
					const src = el.getAttribute("src") || "";
					const alt = el.getAttribute("alt") || "";
					parts.push(`![${alt}](${src})`);
					break;
				}
				case "del":
				case "s":
					parts.push(`~~${processInlineContent(el)}~~`);
					break;
				case "mark":
					parts.push(`==${processInlineContent(el)}==`);
					break;
				case "u":
					parts.push(`<u>${processInlineContent(el)}</u>`);
					break;
				case "sup":
					parts.push(`^${processInlineContent(el)}^`);
					break;
				case "sub":
					parts.push(`~${processInlineContent(el)}~`);
					break;
				case "br":
					parts.push("  \n");
					break;
				default:
					parts.push(processInlineContent(el));
			}
		}
	}

	return parts.join("");
}

/**
 * Process list items
 */
function processListItems(listElement: Element, marker: string): string {
	const items: string[] = [];
	let index = 1;

	for (const child of Array.from(listElement.children)) {
		if (child.tagName.toLowerCase() === "li") {
			const prefix = marker === "1." ? `${index}. ` : `${marker} `;
			const content = processInlineContent(child);

			// Check for nested lists
			const nestedUl = child.querySelector("ul");
			const nestedOl = child.querySelector("ol");

			if (nestedUl || nestedOl) {
				// Get text content before nested list
				const textParts: string[] = [];
				for (const node of Array.from(child.childNodes)) {
					if (node.nodeType === Node.TEXT_NODE) {
						textParts.push(node.textContent || "");
					} else if (node.nodeType === Node.ELEMENT_NODE) {
						const el = node as Element;
						if (el.tagName.toLowerCase() !== "ul" && el.tagName.toLowerCase() !== "ol") {
							textParts.push(processInlineContent(el));
						}
					}
				}
				items.push(`${prefix}${textParts.join("").trim()}`);

				// Process nested list with indentation
				if (nestedUl) {
					const nestedItems = processListItems(nestedUl, "-").split("\n").filter(Boolean);
					items.push(...nestedItems.map(item => `  ${item}`));
				}
				if (nestedOl) {
					const nestedItems = processListItems(nestedOl, "1.").split("\n").filter(Boolean);
					items.push(...nestedItems.map(item => `  ${item}`));
				}
			} else {
				items.push(`${prefix}${content}`);
			}

			index++;
		}
	}

	return items.join("\n") + "\n\n";
}

/**
 * Process table element
 */
function processTable(table: Element): string {
	const rows: string[][] = [];
	const alignments: string[] = [];

	// Process thead
	const thead = table.querySelector("thead");
	if (thead) {
		const headerRow = thead.querySelector("tr");
		if (headerRow) {
			const cells: string[] = [];
			for (const th of Array.from(headerRow.querySelectorAll("th"))) {
				cells.push(processInlineContent(th).trim());
				// Detect alignment from style or class
				const style = th.getAttribute("style") || "";
				if (style.includes("text-align: center")) {
					alignments.push(":---:");
				} else if (style.includes("text-align: right")) {
					alignments.push("---:");
				} else {
					alignments.push("---");
				}
			}
			rows.push(cells);
		}
	}

	// Process tbody
	const tbody = table.querySelector("tbody") || table;
	for (const tr of Array.from(tbody.querySelectorAll("tr"))) {
		if (thead && tr.parentElement === thead) continue;
		const cells: string[] = [];
		for (const td of Array.from(tr.querySelectorAll("td, th"))) {
			cells.push(processInlineContent(td).trim());
		}
		if (cells.length > 0) {
			rows.push(cells);
		}
	}

	if (rows.length === 0) return "";

	// Build markdown table
	const lines: string[] = [];

	// Header row
	if (rows.length > 0) {
		lines.push(`| ${rows[0]!.join(" | ")} |`);
		// Separator with alignments
		if (alignments.length > 0) {
			lines.push(`| ${alignments.join(" | ")} |`);
		} else {
			lines.push(`| ${rows[0]!.map(() => "---").join(" | ")} |`);
		}
	}

	// Data rows
	for (let i = 1; i < rows.length; i++) {
		lines.push(`| ${rows[i]!.join(" | ")} |`);
	}

	return lines.join("\n") + "\n\n";
}

/**
 * Get plain text content of an element
 */
function getTextContent(element: Element): string {
	return element.textContent?.trim() || "";
}

/**
 * Composable for bidirectional markdown <-> HTML synchronization
 */
export function useMarkdownSync(options: UseMarkdownSyncOptions): UseMarkdownSyncReturn {
	const {
		contentRef,
		onEmitValue,
		debounceMs = 300,
		getCodeBlockById,
		registerCodeBlock,
		tokenRenderers,
		getTokenById,
		registerToken
	} = options;

	const renderedHtml = ref("");
	// Flag to track when changes originate from the editor itself (vs external prop changes)
	// This prevents cursor jumping when the watch triggers setMarkdown after internal edits
	const isInternalUpdate = ref(false);
	let syncTimeout: ReturnType<typeof setTimeout> | null = null;

	/**
	 * Convert markdown to HTML and update rendered content.
	 * Code blocks are converted to wrapper structures for CodeViewer mounting.
	 * Token patterns are converted to wrapper structures for TokenManager mounting.
	 */
	function syncFromMarkdown(markdown: string): void {
		let html = renderMarkdown(markdown);
		// Convert <pre><code> to code block wrappers so CodeBlockManager can mount CodeViewer
		html = convertCodeBlocksToWrappers(html, registerCodeBlock);
		// Convert token patterns to wrappers so TokenManager can mount custom components
		html = convertTokensToWrappers(html, tokenRenderers, registerToken);
		renderedHtml.value = html;
	}

	/**
	 * Convert HTML from content element back to markdown and emit
	 */
	function syncFromHtml(): void {
		if (!contentRef.value) return;

		const html = contentRef.value.innerHTML;
		const markdown = htmlToMarkdown(html, getCodeBlockById, tokenRenderers, getTokenById);

		// Clean up extra whitespace
		const cleaned = markdown.replace(/\n{3,}/g, "\n\n").trim();

		// Mark as internal update before emitting to prevent watch from triggering setMarkdown
		isInternalUpdate.value = true;
		onEmitValue(cleaned);
	}

	/**
	 * Debounced version of syncFromHtml for input handling
	 */
	function debouncedSyncFromHtml(): void {
		if (syncTimeout) {
			clearTimeout(syncTimeout);
		}
		syncTimeout = setTimeout(() => {
			syncFromHtml();
		}, debounceMs);
	}

	// Cleanup on unmount
	onUnmounted(() => {
		if (syncTimeout) {
			clearTimeout(syncTimeout);
		}
	});

	return {
		renderedHtml,
		isInternalUpdate,
		syncFromMarkdown,
		syncFromHtml,
		debouncedSyncFromHtml
	};
}
