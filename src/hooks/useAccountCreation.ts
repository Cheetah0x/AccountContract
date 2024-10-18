// hooks/useAccountCreation.ts
import { useState } from "react";
import {
  AccountWalletWithSecretKey,
  Fr,
  Fq,
  PXE,
  deriveMasterIncomingViewingSecretKey,
} from "@aztec/aztec.js";
import { generatePublicKeys } from "@/contracts/src/test/utils";
import { AccountManager } from "@aztec/aztec.js";
import { SingleKeyAccountContract } from "@aztec/accounts/single_key";

export const useAccountCreation = (pxe: PXE) => {
  const [adminWallet, setAccountWallet] =
    useState<AccountWalletWithSecretKey | null>(null);
  const [wait, setWait] = useState(false);

  const createNewWallet = async () => {
    setWait(true);
    try {
      // Generate a new secret key for each wallet
      const secretKey = Fr.random();
      const encryptionPrivateKey =
        deriveMasterIncomingViewingSecretKey(secretKey);
      const accountContract = new SingleKeyAccountContract(
        encryptionPrivateKey
      );

      // Create a new AccountManager instance
      const account = new AccountManager(pxe, secretKey, accountContract);

      // Register the account and get the wallet
      const wallet = await account.register(); // Returns AccountWalletWithSecretKey
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

  return { adminWallet, createNewWallet, wait };
};
