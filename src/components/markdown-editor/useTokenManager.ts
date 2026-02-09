import { App, createApp, h, Ref } from "vue";
import { TokenRenderer, TokenState } from "./types";
import { useDomObserver } from "./useDomObserver";

/**
 * Options for useTokenManager composable
 */
export interface UseTokenManagerOptions {
  /** Reference to the contenteditable container */
  contentRef: Ref<HTMLElement | null>;
  /** Array of token renderers defining how to render each token type */
  tokenRenderers: TokenRenderer[];
  /** Reactive map of token states */
  tokens: Map<string, TokenState>;
}

/**
 * Return type for useTokenManager composable
 */
export interface UseTokenManagerReturn {
  /** Mount token components for all unmounted tokens */
  mountAllTokens: () => void;
  /** Unmount a specific token instance */
  unmountToken: (id: string) => void;
  /** Unmount all token instances */
  unmountAllTokens: () => void;
  /** Get mounted instance count */
  getMountedCount: () => number;
}

/**
 * Mounted token instance tracking
 */
interface MountedTokenInstance {
  app: App;
  mountPoint: HTMLElement;
}

/**
 * Composable for managing custom token Vue component instances within the markdown editor.
 * Handles mounting/unmounting Vue apps for token "islands" similar to code blocks.
 *
 * Tokens are identified by:
 * - data-token-id: Unique instance ID (e.g., "tok-abc123")
 * - data-token-renderer: ID of the TokenRenderer that handles this token
 * - data-token-groups: JSON-encoded captured regex groups
 */
export function useTokenManager(options: UseTokenManagerOptions): UseTokenManagerReturn {
  const { contentRef, tokenRenderers, tokens } = options;

  // Track mounted instances by token ID
  const mountedInstances = new Map<string, MountedTokenInstance>();

  /**
   * Find the token renderer by ID
   */
  function getRenderer(rendererId: string): TokenRenderer | undefined {
    return tokenRenderers.find((r) => r.id === rendererId);
  }

  /**
   * Create and mount a token component instance
   */
  function mountToken(wrapper: HTMLElement): void {
    const id = wrapper.getAttribute("data-token-id");
    if (!id) return;

    // Skip if already mounted
    if (mountedInstances.has(id)) return;

    const rendererId = wrapper.getAttribute("data-token-renderer");
    if (!rendererId) return;

    const renderer = getRenderer(rendererId);
    if (!renderer) {
      console.warn(`[useTokenManager] No renderer found for ID: ${rendererId}`);
      return;
    }

    // Get or create token state
    let state = tokens.get(id);
    if (!state) {
      // Try to get groups from data attribute
      const groupsAttr = wrapper.getAttribute("data-token-groups");
      const groups = groupsAttr ? JSON.parse(groupsAttr) : [];
      state = { id, rendererId, groups };
      tokens.set(id, state);
    }

    // Find mount point
    const mountPoint = wrapper.querySelector(".token-mount-point") as HTMLElement;
    if (!mountPoint) {
      console.warn(`[useTokenManager] No mount point found for token: ${id}`);
      return;
    }

    // Get props from renderer
    const props = renderer.getProps(state.groups);

    // Create Vue app for the token component
    const app = createApp({
      setup() {
        return () => h(renderer.component, props);
      },
    });

    // Clear mount point content
    mountPoint.innerHTML = "";

    // Mount the app
    app.mount(mountPoint);

    // Track the instance
    mountedInstances.set(id, { app, mountPoint });
  }

  /**
   * Unmount a specific token instance
   */
  function unmountToken(id: string): void {
    const instance = mountedInstances.get(id);
    if (instance) {
      instance.app.unmount();
      mountedInstances.delete(id);
    }
  }

  /**
   * Unmount all token instances
   */
  function unmountAllTokens(): void {
    for (const [id, instance] of mountedInstances) {
      instance.app.unmount();
      mountedInstances.delete(id);
    }
  }

  /**
   * Mount token components for all unmounted tokens
   */
  function mountAllTokens(): void {
    if (!contentRef.value) return;

    const wrappers = contentRef.value.querySelectorAll("[data-token-id]");
    wrappers.forEach((wrapper) => {
      mountToken(wrapper as HTMLElement);
    });
  }

  /**
   * Get mounted instance count
   */
  function getMountedCount(): number {
    return mountedInstances.size;
  }

  // Set up DOM observer for token wrappers
  useDomObserver({
    contentRef,
    dataAttribute: "data-token-id",
    onNodeAdded: (el) => mountToken(el),
    onNodeRemoved: (el) => {
      const id = el.getAttribute("data-token-id");
      if (id) {
        unmountToken(id);
        tokens.delete(id);
      }
    },
    onCleanup: () => unmountAllTokens(),
    onInitialMount: () => mountAllTokens(),
  });

  return {
    mountAllTokens,
    unmountToken,
    unmountAllTokens,
    getMountedCount,
  };
}
