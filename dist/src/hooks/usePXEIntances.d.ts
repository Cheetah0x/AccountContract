import { createPXEClient } from "@aztec/aztec.js";
export interface PXEWithUrl {
    pxe: ReturnType<typeof createPXEClient>;
    url: string;
}
/**
 * Hook to create and manage multiple PXE (Private Execution Environment) instances.
 *
 * @returns {PXEWithUrl[]} An array of PXEWithUrl objects where each object contains:
 * - `pxe`: The PXE client instance created using the `createPXEClient` function.
 * - `url`: The URL corresponding to the PXE instance.
 *
 *
 * This hook performs the following:
 * 1. Initializes PXE clients.
 * 2. Uses `useMemo` to ensure that the PXE instances are only created once and memoized.
 * 3. Returns an array of PXE clients along with their corresponding URLs.
 */
export declare const usePXEInstances: () => PXEWithUrl[];
//# sourceMappingURL=usePXEIntances.d.ts.map