import { getSchnorrAccount } from "@aztec/accounts/schnorr";
import {
  createPXEClient,
  Fr,
  GrumpkinScalar,
  PXE,
  Schnorr,
} from "@aztec/aztec.js";

import { waitForPXE } from "@aztec/aztec.js";

// Setup PXE and other utilities for deployment
export const setupSandbox1 = async () => {
  const { PXE_URL = "http://localhost:8080" } = process.env;
  const pxe1 = createPXEClient(PXE_URL);
  await waitForPXE(pxe1);
  return pxe1;
};

export const setupSandbox2 = async () => {
  const { PXE_URL = "http://localhost:8081" } = process.env;
  const pxe2 = createPXEClient(PXE_URL);
  await waitForPXE(pxe2);
  return pxe2;
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
