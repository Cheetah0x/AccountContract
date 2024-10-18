import { createPXEClient } from "@aztec/aztec.js";
import { useMemo } from "react";

export interface PXEWithUrl {
  pxe: ReturnType<typeof createPXEClient>;
  url: string;
}

export const usePXEInstances = (): PXEWithUrl[] => {
  const pxeUrls = [
    process.env.PXE_URL_0 || 'http://localhost:8080', // Fallback to default if undefined
    process.env.PXE_URL_1 || 'http://localhost:8081',
    process.env.PXE_URL_2 || 'http://localhost:8082',
    // Add more as needed
  ];

  const pxeInstances = useMemo(() => {
    return pxeUrls.map((url) => ({
      pxe: createPXEClient(url),
      url, // Now `url` will always be a string
    }));
  }, [pxeUrls]);

  return pxeInstances;
};
