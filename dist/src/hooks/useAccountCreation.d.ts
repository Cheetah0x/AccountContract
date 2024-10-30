import { AccountWalletWithSecretKey, PXE } from "@aztec/aztec.js";
/**
 * Custom hook to handle the creation of a new Aztec account wallet, to use in the demo.
 * This hook generates a new wallet with a secret key and registers it on the PXE (Private Execution Environment).
 *
 * @param pxe - The PXE instance required to interact with the Aztec network for account creation.
 *
 * @returns {Object} An object containing:
 * - `ownerWallet`: The newly created wallet instance (`AccountWalletWithSecretKey`) or `null` if not created yet.
 * - `createNewWallet`: A function to generate a new account wallet and register it on the PXE.
 * - `wait`: A boolean
 *
 * It manages wallet creation, secret key generation, and contract registration.
 */
export declare const useAccountCreation: (pxe: PXE) => {
    ownerWallet: AccountWalletWithSecretKey | null;
    createNewWallet: () => Promise<void>;
    wait: boolean;
};
//# sourceMappingURL=useAccountCreation.d.ts.map