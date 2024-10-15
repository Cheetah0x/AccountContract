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

// Setup PXE and other utilities for deployment
export const setupSandbox = async (PXE_URL: string) => {
  const pxe = createPXEClient(PXE_URL);
  await waitForPXE(pxe);
  return pxe;
};

// Generate keys and Schnorr account for testing
export const createSchnorrAccount = async (pxe: PXE) => {
  const secret = Fr.random();
  console.log("secret", secret);
  const signingPrivateKey = GrumpkinScalar.random();
  console.log("signingPrivateKey", signingPrivateKey);
  const wallet = getSchnorrAccount(pxe, secret, signingPrivateKey).waitSetup();
  console.log("wallet", wallet);
  return wallet;
};

//generate public keys for the schnorr account contract
export const generatePublicKeys = async () => {
  const signingPrivateKey = GrumpkinScalar.random();
  const schnorr = new Schnorr();
  const publicKey = schnorr.computePublicKey(signingPrivateKey);

  const [x, y] = publicKey.toFields();
  return { signingPrivateKey, x, y };
};

let lastBlockPXE1 = 0;
let lastBlockPXE2 = 0;

export async function eventListener(
  pxe: PXE,
  pxeName: string,
  contractAddress: AztecAddress
) {
  const filter = {
    owner: contractAddress,
  };
  // Fetch and listen for logs
  let noteFound = false;
  const maxRetries = 10;
  let retries = 0;

  while (!noteFound && retries < maxRetries) {
    const logs = await pxe.getIncomingNotes(filter);
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
      await new Promise((resolve) => setTimeout(resolve, 3000));
      retries++;
    }
  }

  if (!noteFound) {
    throw new Error(
      `[${pxeName}] Contract state did not synchronize after ${maxRetries} attempts.`
    );
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retryWithDelay(
  fn: () => Promise<any>,
  maxRetries: number = 10,
  delayMs: number = 3000
): Promise<any> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      console.log(`Attempt ${attempt + 1} failed. Retrying...`);
      attempt++;
      await delay(delayMs);
    }
  }
  throw new Error(`Failed after ${maxRetries} attempts`);
}
