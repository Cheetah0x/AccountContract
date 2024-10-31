import { AztecAddress, Fr, PXE } from "@aztec/aztec.js";
/**
 * Sets up a PXE instance at the given URL.
 *
 * @param PXE_URL - The URL of the PXE instance.
 * @returns {Promise<PXE>} A promise that resolves to the PXE instance.
 */
export declare const setupSandbox: (PXE_URL: string) => Promise<PXE>;
/**
 * Generates a Schnorr account for testing purposes, creating secret and signing keys.
 *
 * @param pxe - The PXE instance used to create the Schnorr account.
 * @returns {Promise<any>} A promise that resolves to the Schnorr wallet.
 */
export declare const createSchnorrAccount: (pxe: PXE) => Promise<import("@aztec/aztec.js").AccountWalletWithSecretKey>;
/**
 * Generates Schnorr public keys for a Schnorr account contract.
 *
 * @returns {Promise<{signingPrivateKey: GrumpkinScalar, x: Fr, y: Fr}>}
 * An object containing the signing private key and the public key components (x, y).
 */
export declare const generatePublicKeys: () => Promise<{
    signingPrivateKey: import("@aztec/circuits.js").Fq;
    x: Fr;
    y: Fr;
}>;
/**
 * Listens for incoming events from a contract deployed on a specific PXE.
 * It retries until an active note is found or the maximum retries are reached.
 *
 * @param pxe - The PXE instance to listen on.
 * @param pxeName - A label for the PXE instance (used in logs).
 * @param contractAddress - The Aztec address of the contract to monitor.
 * @throws Will throw an error if the contract state is not synchronized after maximum retries.
 */
export declare function eventListener(pxe: PXE, pxeName: string, contractAddress: AztecAddress): Promise<void>;
/**
 * Delays execution for a given number of milliseconds.
 *
 * @param ms - The number of milliseconds to delay.
 * @returns {Promise<void>} A promise that resolves after the specified delay.
 */
export declare function delay(ms: number): Promise<void>;
/**
 * Retries a function with a delay between attempts.
 *
 * @param fn - The function to retry.
 * @param maxRetries - Maximum number of retry attempts (default is 10).
 * @param delayMs - Delay between retries in milliseconds (default is 3000 ms).
 * @returns {Promise<any>} The result of the function, or throws an error after max retries.
 * @throws Will throw an error if the function fails after the specified number of retries.
 */
export declare function retryWithDelay(fn: () => Promise<any>, maxRetries?: number, delayMs?: number): Promise<any>;
//# sourceMappingURL=utils.d.ts.map