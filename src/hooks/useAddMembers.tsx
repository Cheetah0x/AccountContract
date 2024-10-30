import { useEffect, useState } from "react";
import { AccountWalletWithSecretKey, PXE, Fr, Fq, deriveMasterIncomingViewingSecretKey, AztecAddress, Wallet } from "@aztec/aztec.js";
import { MemberWallets, MemberContracts, PXEWithUrl } from "@/utils/types";
import { AccountManager } from "@aztec/aztec.js";
import { AccountGroupContract} from "@/contracts/src/artifacts/AccountGroup";
import { AccountGroupContractClass, AccountGroupManager } from "@/utils/types";
import { SingleKeyAccountContract } from "@aztec/accounts/single_key";


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

export const useAddMembers = (
  secret: Fr,
  accountContract: AccountGroupContractClass,
  groupContractWallet: Wallet,
  ownerWallet: AccountWalletWithSecretKey,
  PXEInstances: PXEWithUrl[],
  salt: Fr
) => {
  // State for managing the list of members, their wallets, and their contract instances
  const [members, setMembers] = useState<string[]>([]);
  const [memberWallets, setMemberWallets] = useState<MemberWallets>({});
  const [memberContracts, setMemberContracts] = useState<MemberContracts>({});
  const [ownerMemberAdded, setOwnerMemberAdded] = useState<boolean>(false);
  const [contractInstanceWithWalletOwner, setContractInstanceWithWalletOwner] = useState<AccountGroupContract>();

  // Automatically add the owner member to the group when the component mounts and the dependencies are ready
  useEffect(() => {
    const addOwnerMember = async () => {
      if (
        secret &&
        accountContract &&
        groupContractWallet &&
        ownerWallet &&
        !ownerMemberAdded
      ) {
        const ownerName = "Owner";
  
        // Step 1: Retrieve the contract address from the group contract's wallet
        const contractAddress = await groupContractWallet.getAddress();
        console.log("contractAddress", contractAddress);
  
        // Step 2: Create the contract instance using the owner's wallet
        const contractInstanceWithWallet = await AccountGroupContract.at(
          contractAddress,
          groupContractWallet
        );

        // Step 3: Check if the owner is already a member by viewing the first member in the contract
        const member = await contractInstanceWithWallet.methods.view_member(0).simulate();
        const member0: AztecAddress = member;
        console.log("members", member0.toString());

        // Step 4: Add the owner to the member list and store their wallet/contract instance
        setMembers((prevMembers) => [...prevMembers, ownerName]);
        setMemberWallets((prev) => ({
          ...prev,
          [ownerName]: { wallet: ownerWallet },
        }));
        setMemberContracts((prev) => ({
          ...prev,
          [ownerName]: { walletInstance: contractInstanceWithWallet },
        }));
        setContractInstanceWithWalletOwner(contractInstanceWithWallet);
        setOwnerMemberAdded(true); // Mark the owner as added
      }
    };
  
    addOwnerMember();
  }, [secret, accountContract, groupContractWallet, ownerWallet, ownerMemberAdded]);

  /**
   * Adds a new member to the group contract.
   * 
   * @param name - The name of the member to add.
   * @param pxeIndex - The index of the PXE instance to which the member will be added.
   */
  const addMember = async (name: string, pxeIndex: number) => {
    if (!accountContract) {
      console.error("accountContract is undefined");
      alert("Contract is not ready yet. Please try again in a moment.");
      return;
    }

    // Ensure the member is not already added
    if (name && !members.includes(name)) {
      if (pxeIndex < 0 || pxeIndex >= PXEInstances.length) {
        console.error("Invalid PXE index");
        return;
      }

      const memberPXE = PXEInstances[pxeIndex].pxe;
      console.log("memberPXE", pxeIndex);

      try {
        // Step 1: Generate a new secret for the member's account
        const memberSecret = Fr.random();
        const memberEncryptionPrivateKey = deriveMasterIncomingViewingSecretKey(memberSecret);
        const memberContract = new SingleKeyAccountContract(memberEncryptionPrivateKey);

        // Step 2: Create a new AccountManager for the member
        const memberAccountManager = new AccountManager(memberPXE, memberSecret, memberContract);

        // Step 3: Register the member's account and retrieve the wallet
        const memberWallet = await memberAccountManager.register();
        console.log("memberWallet", memberWallet);

        // Step 4: Register the group contract in the member's PXE
        const ownerAddress = await ownerWallet.getAddress();
        const accountGroupManager = new AccountGroupManager(
          memberPXE,
          secret,
          accountContract,
          ownerAddress,
          salt
        );
        await accountGroupManager.register();

        // Step 5: Retrieve the contract wallet and create an instance with it
        const contractWallet = await accountGroupManager.getWallet();
        const contractAddress = await contractWallet.getAddress();
        const contractInstanceWithWallet = await AccountGroupContract.at(
          contractAddress,
          contractWallet
        );
        console.log("contractInstanceWithWallet", contractInstanceWithWallet);

        // Step 6: Add the member to the group contract via the owner's contract instance
        const memberAddress = await memberWallet.getAddress();
        console.log("memberAddress", memberAddress.toString());

        if (contractInstanceWithWalletOwner) {
          console.log("adding member", memberAddress.toString());
          const tx = await contractInstanceWithWalletOwner.methods.add_member(memberAddress).send().wait();
          console.log("member added to group contract", tx);

          //  Check that the member was added correctly, for testing purposes
          const viewMember = await contractInstanceWithWalletOwner.methods.view_member(0).simulate();
          const member0: AztecAddress = viewMember;
          console.log("viewMember 0 ", member0.toString());
          const viewMember2 = await contractInstanceWithWalletOwner.methods.view_member(1).simulate();
          const member1: AztecAddress = viewMember2;
          console.log("viewMember 1 ", member1.toString());
          const viewMember3 = await contractInstanceWithWalletOwner.methods.view_member(2).simulate();
          const member2: AztecAddress = viewMember3;
          console.log("viewMember 2 ", member2.toString());
        }

        // Step 7: Store the new member's wallet and contract instance
        setMembers((prevMembers) => [...prevMembers, name]);
        setMemberWallets((prev) => ({
          ...prev,
          [name]: { wallet: memberWallet },
        }));
        setMemberContracts((prev) => ({
          ...prev,
          [name]: { walletInstance: contractInstanceWithWallet },
        }));
      } catch (error) {
        console.error("Error adding member:", error);
      }
    }
  };

  /**
   * Removes a member from the group contract.
   * 
   * @param name - The name of the member to remove.
   */
  const removeMember = (name: string) => {
    setMembers((prevMembers) => prevMembers.filter((member) => member !== name));
    setMemberWallets((prev) => {
      const updatedWallets = { ...prev };
      delete updatedWallets[name];
      return updatedWallets;
    });
    setMemberContracts((prev) => {
      const updatedContracts = { ...prev };
      delete updatedContracts[name];
      return updatedContracts;
    });
  };

  // Return relevant state and functions for managing members
  return {
    members,
    memberWallets,
    memberContracts,
    addMember,
    removeMember,
    contractInstanceWithWalletOwner
  };
};
