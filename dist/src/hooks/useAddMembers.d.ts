import { AccountWalletWithSecretKey, Fr, Wallet } from "@aztec/aztec.js";
import { MemberWallets, MemberContracts, PXEWithUrl } from "@/utils/types";
import { AccountGroupContract } from "@/circuits/src/artifacts/AccountGroup";
import { AccountGroupContractClass } from "@/utils/types";
/**
 * Hook to manage the addition of members to the group contract.
 *
 * @param secret - The Fr secret value used for contract registration.
 * @param accountContract - The AccountGroupContractClass instance used to manage the account contract.
 * @param groupContractWallet - The Wallet instance of the deployed group contract.
 * @param ownerWallet - The owner's wallet, an instance of AccountWalletWithSecretKey.
 * @param PXEInstances - An array of PXEWithUrl instances, which represent different PXEs that members may be added to.
 * @param salt - The salt value (Fr) used for contract registration.
 *
 * @returns {Object} An object containing the following:
 * - `members`: An array of member names that have been added to the group.
 * - `memberWallets`: An object that maps member names to their corresponding wallets.
 * - `memberContracts`: An object that maps member names to their corresponding contract instances.
 * - `addMember`: A function to add a new member to the group contract.
 * - `removeMember`: A function to remove a member from the group contract.
 * - `contractInstanceWithWalletOwner`: The contract instance associated with the owner's wallet.
 *
 * This hook performs the following steps:
 * 1. Initializes the owner member when the component is first mounted.
 * 2. Allows additional members to be added by creating their wallets, registering them, and adding them to the contract.
 * 3. Allows members to be removed from the group contract and their wallets/contracts to be cleaned up.
 */
export declare const useAddMembers: (secret: Fr, accountContract: AccountGroupContractClass, groupContractWallet: Wallet, ownerWallet: AccountWalletWithSecretKey, PXEInstances: PXEWithUrl[], salt: Fr) => {
    members: string[];
    memberWallets: MemberWallets;
    memberContracts: MemberContracts;
    addMember: (name: string, pxeIndex: number) => Promise<void>;
    removeMember: (name: string) => void;
    contractInstanceWithWalletOwner: AccountGroupContract | undefined;
};
//# sourceMappingURL=useAddMembers.d.ts.map