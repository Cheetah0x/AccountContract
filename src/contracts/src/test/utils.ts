import { PXEWithUrl } from "@/utils/types";
import { getSchnorrAccount } from "@aztec/accounts/schnorr";
import {
  AztecAddress,
  createPXEClient,
  Fr,
  GrumpkinScalar,
  PXE,
  Schnorr,
} from "@aztec/aztec.js";
import { waitForPXE } from "@aztec/aztec.js";

/**
 * Sets up a PXE instance at the given URL.
 *
 * @param PXE_URL - The URL of the PXE instance.
 * @returns {Promise<PXE>} A promise that resolves to the PXE instance.
 */
export const setupSandbox = async (PXE_URL: string): Promise<PXE> => {
  const pxe = createPXEClient(PXE_URL);
  await waitForPXE(pxe); // Waits for the PXE to be fully ready.
  return pxe;
};

/**
 * Generates a Schnorr account for testing purposes, creating secret and signing keys.
 *
 * @param pxe - The PXE instance used to create the Schnorr account.
 * @returns {Promise<any>} A promise that resolves to the Schnorr wallet.
 */
export const createSchnorrAccount = async (pxe: PXE) => {
  const secret = Fr.random(); // Generates a random secret.
  console.log("secret", secret);

  const signingPrivateKey = GrumpkinScalar.random(); // Generates a random Schnorr signing private key.
  console.log("signingPrivateKey", signingPrivateKey);

  // Waits for Schnorr account wallet setup.
  const wallet = getSchnorrAccount(pxe, secret, signingPrivateKey).waitSetup();
  console.log("wallet", wallet);
  return wallet;
};

/**
 * Generates Schnorr public keys for a Schnorr account contract.
 *
 * @returns {Promise<{signingPrivateKey: GrumpkinScalar, x: Fr, y: Fr}>}
 * An object containing the signing private key and the public key components (x, y).
 */
export const generatePublicKeys = async () => {
  const signingPrivateKey = GrumpkinScalar.random(); // Generates a random Schnorr signing private key.
  const schnorr = new Schnorr();

  // Computes the Schnorr public key.
  const publicKey = schnorr.computePublicKey(signingPrivateKey);

  // Returns the public key fields (x, y).
  const [x, y] = publicKey.toFields();
  return { signingPrivateKey, x, y };
};

// Variables to track the last processed block for each PXE instance.
let lastBlockPXE1 = 0;
let lastBlockPXE2 = 0;

/**
 * Listens for incoming events from a contract deployed on a specific PXE.
 * It retries until an active note is found or the maximum retries are reached.
 *
 * @param pxe - The PXE instance to listen on.
 * @param pxeName - A label for the PXE instance (used in logs).
 * @param contractAddress - The Aztec address of the contract to monitor.
 * @throws Will throw an error if the contract state is not synchronized after maximum retries.
 */
export async function eventListener(
  pxe: PXE,
  pxeName: string,
  contractAddress: AztecAddress
) {
  const filter = {
    owner: contractAddress, // Filter by contract address (owner).
  };

  let noteFound = false;
  const maxRetries = 10;
  let retries = 0;

  // Loop to retry fetching incoming notes until a note is found or the max retries are reached.
  while (!noteFound && retries < maxRetries) {
    const logs = await pxe.getIncomingNotes(filter); // Fetch incoming notes.
    if (logs.length > 0) {
      noteFound = true;
      console.log(
        `[${pxeName}] Found active note for contract at attempt ${retries + 1}`
      );
    } else {
      console.log(
        `[${pxeName}] Active note not found. Retrying... (${
          retries + 1
        }/${maxRetries})`
      );
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait before retrying.
      retries++;
    }
  }

  // If no note was found after max retries, throw an error.
  if (!noteFound) {
    throw new Error(
      `[${pxeName}] Contract state did not synchronize after ${maxRetries} attempts.`
    );
  }
}

/**
 * Delays execution for a given number of milliseconds.
 *
 * @param ms - The number of milliseconds to delay.
 * @returns {Promise<void>} A promise that resolves after the specified delay.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retries a function with a delay between attempts.
 *
 * @param fn - The function to retry.
 * @param maxRetries - Maximum number of retry attempts (default is 10).
 * @param delayMs - Delay between retries in milliseconds (default is 3000 ms).
 * @returns {Promise<any>} The result of the function, or throws an error after max retries.
 * @throws Will throw an error if the function fails after the specified number of retries.
 */
export async function retryWithDelay(
  fn: () => Promise<any>,
  maxRetries: number = 10,
  delayMs: number = 3000
): Promise<any> {
  let attempt = 0;

  // Retry the function until it succeeds or the max number of attempts is reached.
  while (attempt < maxRetries) {
    try {
      return await fn(); // Attempt to execute the function.
    } catch (error) {
      console.log(`Attempt ${attempt + 1} failed. Retrying...`);
      attempt++;
      await delay(delayMs); // Wait before the next attempt.
    }
  }

  // Throw an error if the function failed after max retries.
  throw new Error(`Failed after ${maxRetries} attempts`);
}
