/**
 * React 19 ESM shim for use-sync-external-store.
 *
 * React 19 ships `useSyncExternalStore` natively. Libraries like SWR and Clerk
 * still import from `use-sync-external-store/shim` (a CJS module), which breaks
 * Vite's ESM dev server. This module re-exports the React built-in so the
 * named import works correctly.
 */
import { useSyncExternalStore } from "react";

export { useSyncExternalStore };

// Default export for libraries that use `import X from '...'`
export default { useSyncExternalStore };
