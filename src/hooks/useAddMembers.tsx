import { useEffect, useState } from "react";
import { AccountWalletWithSecretKey, PXE, Fr, Fq, deriveMasterIncomingViewingSecretKey, AztecAddress, Wallet } from "@aztec/aztec.js";
import { MemberWallets, MemberContracts, PXEWithUrl } from "@/utils/types";
import { AccountManager } from "@aztec/aztec.js";
import { AccountGroupContract} from "@/contracts/src/artifacts/AccountGroup";
import { AccountGroupContractClass, AccountGroupManager } from "@/utils/types";
import { SingleKeyAccountContract } from "@aztec/accounts/single_key";


export const useAddMembers = (
    secret:Fr,
    accountContract:AccountGroupContractClass,
    groupContractWallet:Wallet,
    adminWallet:AccountWalletWithSecretKey,
    PXEInstances: PXEWithUrl[]
) => {
  const [members, setMembers] = useState<string[]>([]);
  const [memberWallets, setMemberWallets] = useState<MemberWallets>({});
  const [memberContracts, setMemberContracts] = useState<MemberContracts>({});
  const [adminMemberAdded, setAdminMemberAdded] = useState<boolean>(false);

    // Use useEffect to add the admin to the members list once it's ready
    useEffect(() => {
      const addAdminMember = async () => {
        if (
          secret &&
          accountContract &&
          groupContractWallet &&
          adminWallet &&
          !adminMemberAdded
        ) {
          const adminName = "Admin";
  
          const contractAddress = await groupContractWallet.getAddress();
          console.log("contractAddress", contractAddress);
  
          // Create contract instance using AccountGroupContract.at with contractWallet
          const contractInstanceWithWallet = await AccountGroupContract.at(
            contractAddress,
            groupContractWallet
          );
  
          // Store the admin's wallet and contract instance
          setMembers((prevMembers) => [...prevMembers, adminName]);
          setMemberWallets((prev) => ({
            ...prev,
            [adminName]: { wallet: adminWallet },
          }));
          setMemberContracts((prev) => ({
            ...prev,
            [adminName]: { walletInstance: contractInstanceWithWallet },
          }));
          setAdminMemberAdded(true);
        }
      };
  
      addAdminMember();
    }, [secret, accountContract, groupContractWallet, adminWallet, adminMemberAdded]);
  

  const addMember = async (name: string, pxeIndex: number) => {
      if (!accountContract) {
        console.error("accountContract is undefined");
        alert("Contract is not ready yet. Please try again in a moment.");
        return;
      }
    if (name && !members.includes(name)) {
      if (pxeIndex < 0 || pxeIndex >= PXEInstances.length) {
        console.error("Invalid PXE index");
        return;
      }

      const memberPXE = PXEInstances[pxeIndex].pxe;
      console.log("memberPXE", memberPXE);

      try{
        //Generate a new secret for the member's account
        const memberSecret = Fr.random();
        const memberEncryptionPrivateKey = deriveMasterIncomingViewingSecretKey(memberSecret);
        const memberContract = new SingleKeyAccountContract(memberEncryptionPrivateKey);

        //Create a new AccountMAnager instance for the member
        const memberAccountManager = new AccountManager(memberPXE, memberSecret, memberContract);

        //Register the member's account and get the wallet
        const memberWallet = await memberAccountManager.register();
        console.log("memberWallet", memberWallet);


        //Use the secret and private key for the AccountGroupContract to register it in the member's PXE
        const adminAddress = await adminWallet.getAddress();
        const accountGroupManager = new AccountGroupManager(
          memberPXE,
          secret,
          accountContract,
          adminAddress,
        );
        console.log("accountGroupManager", accountGroupManager);
        await accountGroupManager.register();

        const contractWallet = await accountGroupManager.getWallet();
        const contractAddress = await contractWallet.getAddress();

        const contractInstanceWithWallet = await AccountGroupContract.at(
          contractAddress,
          contractWallet
        )
        console.log("contractInstanceWithWallet", contractInstanceWithWallet);

        const memberAddress = await memberWallet.getAddress();
        const tx = await contractInstanceWithWallet.methods.add_member(memberAddress);
        console.log("member added to group contract", tx);

        const viewMember = await contractInstanceWithWallet.methods.view_member(0);
        console.log("viewMember", viewMember);
        const viewMember2 = await contractInstanceWithWallet.methods.view_member(1);

        //Store the member's wallet and contract instance
        setMembers((prevMembers) => [...prevMembers, name]);
        setMemberWallets((prev) => ({
          ...prev,
          [name]: { wallet: memberWallet },
        }));
        setMemberContracts((prev) => ({
          ...prev,
          [name]: { walletInstance: contractInstanceWithWallet },
        }));



      }
      catch(error){
        console.error("Error adding member:", error);
      }
    }
  };


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


  return {
    members,
    memberWallets,
    memberContracts,
    addMember,
    removeMember,
  };
};
