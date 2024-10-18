import {
  Fr,
  PXE,
  createPXEClient,
  deriveMasterIncomingViewingSecretKey,
} from "@aztec/aztec.js";
import { AccountGroupContractArtifact } from "./contracts/src/artifacts/AccountGroup";
import { AccountManager } from "@aztec/aztec.js/account";
import { SingleKeyAccountContract } from "@aztec/accounts/single_key";

export class PublicEnv {
  pxeInstances: PXE[];

  constructor(private pxeURLs: string[]) {
    this.pxeInstances = pxeURLs.map((url) => createPXEClient(url));
  }

  async createNewWalletinPXE(index: number) {
    const pxe = this.pxeInstances[index];

    // Generate a new secret key for each wallet
    const secretKey = Fr.random();
    const encryptionPrivateKey =
      deriveMasterIncomingViewingSecretKey(secretKey);
    const accountContract = new SingleKeyAccountContract(encryptionPrivateKey);

    // Create a new AccountManager instance
    const account = new AccountManager(pxe, secretKey, accountContract);

    // Register the account and get the wallet
    const wallet = await account.register(); // Returns AccountWalletWithSecretKey
    console.log(
      `Created new wallet with address: ${await wallet.getAddress()} on PXE ${index}`
    );

    return wallet; // Returns AccountWalletWithSecretKey
  }
}

export const deployerEnv = new PublicEnv([
  process.env.PXE_URL_1 || "http://localhost:8080",
  process.env.PXE_URL_2 || "http://localhost:8081",
  process.env.PXE_URL_3 || "http://localhost:8082",
]);

const IGNORE_FUNCTIONS = [
  "constructor",
  "compute_note_hash_and_optionally_a_nullifier",
];
export const filteredInterface = AccountGroupContractArtifact.functions.filter(
  (f) => !IGNORE_FUNCTIONS.includes(f.name)
);
