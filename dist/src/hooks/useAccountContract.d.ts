import { AccountWalletWithSecretKey, AztecAddress, Fq, Fr, PXE, Wallet } from '@aztec/aztec.js';
import { AccountGroupContractClass } from '@/utils/types';
/**
 * Custom hook to handle the registration and deployment of the AccountGroup contract in Aztec.
 * This hook manages the state of the account contract, including its deployment and interaction.

 * @param pxe - The PXE (Private Execution Environment) instance, required to interact with the Aztec network.
 * @param ownerWallet - The owner's wallet, an instance of AccountWalletWithSecretKey, used to manage the contract.
 * @param secret - A `Fr` secret scalar value used during contract registration.
 * @param accountPrivateKey - The private key `Fq` of the account, used to sign and manage the account contract.
 * @param salt - A `Fr` value used as salt during contract deployment.

 * @returns {Object} An object containing the following:
 * - `registerContract`: A function to initialize and register the contract on the PXE.
 * - `groupContract`: The contract instance (or `null` if not deployed yet).
 * - `groupContractWallet`: The wallet associated with the deployed contract.
 * - `groupContractAddress`: The deployed contract's Aztec address.
 * - `wait`: A boolean indicating if the hook is currently processing the contract registration.

 * @throws Will log an error if there is an issue deploying or registering the contract.
 */
export declare function useAccountContract(pxe: PXE | null, ownerWallet: AccountWalletWithSecretKey | null, secret: Fr | null, accountPrivateKey: Fq | null, salt: Fr | null): {
    registerContract: () => Promise<void>;
    groupContract: AccountGroupContractClass | null;
    groupContractWallet: Wallet | null;
    groupContractAddress: AztecAddress | null;
    wait: boolean;
};
//# sourceMappingURL=useAccountContract.d.ts.map