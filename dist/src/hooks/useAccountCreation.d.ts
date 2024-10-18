import { AccountWalletWithSecretKey, PXE } from "@aztec/aztec.js";
export declare const useAccountCreation: (pxe: PXE) => {
    adminWallet: AccountWalletWithSecretKey | null;
    createNewWallet: () => Promise<void>;
    wait: boolean;
};
//# sourceMappingURL=useAccountCreation.d.ts.map