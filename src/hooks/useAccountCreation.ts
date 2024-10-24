// hooks/useAccountCreation.ts
import { useState } from "react";
import {
  AccountWalletWithSecretKey,
  Fr,
  PXE,
  deriveMasterIncomingViewingSecretKey,
} from "@aztec/aztec.js";
import { AccountManager } from "@aztec/aztec.js";
import { SingleKeyAccountContract } from "@aztec/accounts/single_key";

/**
 * Custom hook to handle the creation of a new Aztec account wallet, to use in the demo.
 * This hook generates a new wallet with a secret key and registers it on the PXE (Private Execution Environment).
 *
 * @param pxe - The PXE instance required to interact with the Aztec network for account creation.
 *
 * @returns {Object} An object containing:
 * - `adminWallet`: The newly created wallet instance (`AccountWalletWithSecretKey`) or `null` if not created yet.
 * - `createNewWallet`: A function to generate a new account wallet and register it on the PXE.
 * - `wait`: A boolean
 *
 * It manages wallet creation, secret key generation, and contract registration.
 */

export const useAccountCreation = (pxe: PXE) => {
  const [adminWallet, setAccountWallet] =
    useState<AccountWalletWithSecretKey | null>(null); // State to store the created wallet.
  const [wait, setWait] = useState(false); // State to manage loading state during wallet creation.

  /**
   * Function to create a new wallet using a newly generated secret key.
   * It generates the necessary encryption keys and account contract, registers the account,
   * and stores the resulting wallet in the state.
   */
  const createNewWallet = async () => {
    setWait(true); // Set loading state to true during wallet creation.
    try {
      // Step 1: Generate a new secret key for the wallet.
      const secretKey = Fr.random();

      // Step 2: Derive the encryption private key using the secret key.
      const encryptionPrivateKey =
        deriveMasterIncomingViewingSecretKey(secretKey);

      // Step 3: Create a new instance of the SingleKeyAccountContract using the encryption key.
      const accountContract = new SingleKeyAccountContract(
        encryptionPrivateKey
      );

      // Step 4: Create a new AccountManager to manage the account creation process.
      const account = new AccountManager(pxe, secretKey, accountContract);

      // Step 5: Register the account on the PXE, which returns a wallet instance.
      const wallet = await account.register(); // Returns AccountWalletWithSecretKey

      // Store the newly created wallet in the state.
      setAccountWallet(wallet);

      console.log(
        `Created new wallet with address: ${await wallet.getAddress()}`
      );
    } catch (error) {
      console.error("Error creating new wallet:", error);
    } finally {
      setWait(false);
    }
  };

  // Return the relevant wallet information and the function to create a new wallet.
  return { adminWallet, createNewWallet, wait };
};
