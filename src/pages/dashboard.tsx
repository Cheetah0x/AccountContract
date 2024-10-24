"use client";

import { useAccountContract } from "@/hooks/useAccountContract";
import { GroupCreationCard } from "@/components/GroupCreationCard";
import { PXEInstancesDisplay } from "@/components/PXEInstancesDisplay";
import { GroupDetailsCard } from "@/components/GroupDetailsCard";
import { BalanceSummary } from "@/components/BalanceSummary";
import { RecentTransactions } from "@/components/RecentTransactions";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { MakePaymentDialog } from "@/components/MakePaymentDialog";
import { SetBalanceDialog } from "@/components/SetBalanceDialog";
import { usePXEInstances } from "@/hooks/usePXEIntances";
import { useAccountSecrets } from "@/hooks/useAccountSecrets";
import { useGroup } from "@/hooks/useGroup";
import { useAddMembers } from "@/hooks/useAddMembers";
import { useExpenses } from "@/hooks/useExpenses";
import { useAccountCreation } from "@/hooks/useAccountCreation";
import { useEffect, useState } from "react";

export default function Dashboard() {

  //Get the PXE instances
  const PXEInstances = usePXEInstances();

  if(PXEInstances.length === 0) {
    return <div>No PXE Instances Found</div>
  }

  //States for managing members, use member data
  const [newMember, setNewMember] = useState("");
  const [membersData, setMembersData] = useState<ReturnType<typeof useAddMembers> | null>(null);

  //The admin is always the first PXE Instance, created by default when making the group
  const adminPXE = PXEInstances[0].pxe;

   //Contract Deployment
   const { accountPrivateKey, secret, salt } = useAccountSecrets();

  //Account Creation of the Admin with the first PXE Instance
  const { adminWallet, createNewWallet, wait: accountWait } = useAccountCreation(adminPXE);

  // Initialize admin wallet when secrets are ready
  useEffect(() => {
    const setup = async () => {

      //If all secrets are ready but the admin wallet is not created, create it
      if (accountPrivateKey && secret && salt && !adminWallet) {
        await createNewWallet();
        console.log("Admin Wallet Created");
      }

      //Once the admin wallet is ready, register the account contract
      if (adminWallet) {
        await registerContract();
        console.log("Contract Registered");
      }

      //If all components are ready, initialize the group and members
      if (secret && groupContract && groupContractWallet && adminWallet) {
              const newMembersData = useAddMembers(
                secret,
                groupContract,
                groupContractWallet,
                adminWallet,
                PXEInstances,
                salt!
          );
          setMembersData(newMembersData);
          console.log("Members Added");
        }
    };
    setup();
  }, [accountPrivateKey, secret, salt, adminWallet]);

 //Set up the account contract registration and group creation
  const { registerContract, groupContract, groupContractWallet, groupContractAddress, wait: contractWait } = useAccountContract(
    adminPXE,
    adminWallet!,
    secret!,
    accountPrivateKey!,
    salt!
  );


  //Member hooks for adding/removing members
  const {
    members,
    memberWallets,
    memberContracts,
    addMember,
    removeMember,
    
  } = useAddMembers(
    secret!, 
    groupContract!, 
    groupContractWallet!, 
    adminWallet!,
    PXEInstances,
    salt!,
  );

  //Group Management for creating and managing group
  const {
    group,
    setGroup,
    newGroupName,
    setNewGroupName,
    createGroup,
  } = useGroup(members);


  //Expenses Management hooks for adding expenses, payments and fetching balances
  const {
    expenses,
    balances,
    newExpense,
    setNewExpense,
    addExpense,
    newPayment,
    setNewPayment,
    addPayment,
    payer,
    setPayer,
    newBalance,
    setNewBalance,
    setBalanceBetweenMembers,
    fetchBalances,
  } = useExpenses(group, memberWallets, memberContracts);




  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">SplitWise Aztec Group Account Contract</h1>

      {/* --------------------Create Group-------------------- */}
      {/* Display PXE Instances connected to the current session */}
      <PXEInstancesDisplay PXEInstances={PXEInstances} />

      {/* Main Dashboard Grid Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* If no group is created, show the group creation card */}
        {!group && (
          <GroupCreationCard 
            newGroupName={newGroupName}
            setNewGroupName={setNewGroupName}
            newMember={newMember}
            setNewMember={setNewMember}
            addMember={addMember}
            members={members}
            removeMember={removeMember}
            createGroup={createGroup}
            PXEInstances={PXEInstances}
          />
        )}
        {/* ----------------------Once Group is Created Show the Group Details--------------------  */}

        {group && (
          <GroupDetailsCard group={group} />
        )}

        {/* ------------------------------Balance Summary of the Members-------------------- */}

        {group && <BalanceSummary members={group.members} balances={balances} />}

        {/* ------------------------------Recent Transactions-------------------- */}

        {group && <RecentTransactions expenses={expenses} />}

        {/* ------------------------ Dialog Components for Adding Expenses and Payments ------------------------ */}
        {group && (
          <>
            <AddExpenseDialog
              group={group}
              newExpense={newExpense}
              setNewExpense={setNewExpense}
              addExpense={addExpense}
            />

            {/* -------------------------------- Make a Payment Dialog -------------------------------- */}

            <MakePaymentDialog
              group={group}
              newPayment={newPayment}
              setNewPayment={setNewPayment}
              addPayment={addPayment}
              payer={payer}
              setPayer={setPayer}
            />

            {/*  ------------------------------ Set Balance Between Members Dialog -------------------------------- */}
            <SetBalanceDialog
              group={group}
              newBalance={newBalance}
              setNewBalance={setNewBalance}
              setBalanceBetweenMembers={setBalanceBetweenMembers}
            />
          </>
        )}
      </div>
    </div>
  );
}
