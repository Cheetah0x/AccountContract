import { AccountWalletWithSecretKey, AztecAddress, Fq, Fr, PXE } from '@aztec/aztec.js';
import { AccountGroupContractClass } from '@/utils/types';
export declare function useAccountContract(pxe: PXE, adminWallet: AccountWalletWithSecretKey, secret: Fr, accountPrivateKey: Fq): {
    registerContract: () => Promise<never[] | AztecAddress>;
    accountContract: AccountGroupContractClass | undefined;
    wait: boolean;
};
//# sourceMappingURL=useAccountContract.d.ts.map