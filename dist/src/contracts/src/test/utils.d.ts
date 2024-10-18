import { PXEWithUrl } from "@/utils/types";
import { AztecAddress, Fr, PXE } from "@aztec/aztec.js";
export declare const setupSandbox: (PXE_URL: string) => Promise<PXE>;
export declare const initializePXEInstances: () => Promise<PXEWithUrl[]>;
export declare const createSchnorrAccount: (pxe: PXE) => Promise<import("@aztec/aztec.js").AccountWalletWithSecretKey>;
export declare const generatePublicKeys: () => Promise<{
    signingPrivateKey: import("@aztec/circuits.js").Fq;
    x: Fr;
    y: Fr;
}>;
export declare function eventListener(pxe: PXE, pxeName: string, contractAddress: AztecAddress): Promise<void>;
export declare function delay(ms: number): Promise<void>;
export declare function retryWithDelay(fn: () => Promise<any>, maxRetries?: number, delayMs?: number): Promise<any>;
//# sourceMappingURL=utils.d.ts.map