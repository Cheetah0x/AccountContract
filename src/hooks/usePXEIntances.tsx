import { createPXEClient } from "@aztec/aztec.js";
import { useMemo } from "react";

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

export const usePXEInstances = (): PXEWithUrl[] => {
  const pxeUrls = [
    process.env.PXE_URL_0 || 'http://localhost:8080', 
    process.env.PXE_URL_1 || 'http://localhost:8081',
    process.env.PXE_URL_2 || 'http://localhost:8082',
    // Add more URLs if needed
  ];

  /**
   * Memoizes the PXE client instances based on the URLs.
   */
  const pxeInstances = useMemo(() => {
    return pxeUrls.map((url) => ({
      pxe: createPXEClient(url),
      url,                       
    }));
  }, [pxeUrls]);

  // Return the array of PXE instances with their corresponding URLs
  return pxeInstances;
};
