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
  const PXEInstances = usePXEInstances();

  if(PXEInstances.length === 0) {
    return <div>No PXE Instances Found</div>
  }


  const [newMember, setNewMember] = useState("");
  const [membersData, setMembersData] = useState<ReturnType<typeof useAddMembers> | null>(null);


  const adminPXE = PXEInstances[0].pxe;

  //Account Creation of the Admin with the first PXE Instance
  const { adminWallet, createNewWallet, wait: accountWait } = useAccountCreation(adminPXE);

  //Contract Deployment
  const { accountPrivateKey, secret } = useAccountSecrets();

  const { registerContract, groupContract, groupContractWallet, groupContractAddress, wait: contractWait } = useAccountContract(
    adminPXE,
    adminWallet!,
    secret!,
    accountPrivateKey!
  );

  if (!groupContract) {
    return <div>Loading contract... Please wait.</div>;
  }

  useEffect(() => {
    const onsetup = async () => {
      await createNewWallet();
      console.log("Admin Wallet Created");
      await registerContract();
      console.log("Contract Registered");

      if (secret && groupContract && groupContractWallet && adminWallet) {
        const newMembersData = useAddMembers(
          secret,
          groupContract,
          groupContractWallet,
          adminWallet,
          PXEInstances
        );
        setMembersData(newMembersData);
      }
    };
    onsetup();
  }, []);

  if (!membersData) {
    return <div>Loading members... Please wait.</div>;
  }

  //Members
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
    PXEInstances
  );

  //Group Management
  const {
    group,
    setGroup,
    newGroupName,
    setNewGroupName,
    createGroup,
  } = useGroup(members, memberWallets);


  //Expenses Management
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
      <h1 className="text-3xl font-bold mb-6">SplitWise Clone Dashboard</h1>

      {/* --------------------Create Group-------------------- */}
      <PXEInstancesDisplay PXEInstances={PXEInstances} />

      <div className="grid gap-6 md:grid-cols-2">
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
