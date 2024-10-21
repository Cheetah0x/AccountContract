import { useState } from "react";
import { Expense, Group, Balances, MemberContracts, MemberWallets, NewExpense } from "@/utils/types";
import { getMemberAccount } from "@/utils/getMemberAccount";

export const useExpenses = (
  group: Group | null,
  memberWallets: MemberWallets,
  memberContracts: MemberContracts
) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<Balances>({});
  const [newExpense, setNewExpense] = useState<NewExpense>({
    description: "",
    paidBy: "",
    amount: 0,
  });
  const [newPayment, setNewPayment] = useState({ to: "", amount: 0 });
  const [newBalance, setNewBalance] = useState({
    Creditor: "",
    Debtor: "",
    Amount: 0,
  });
  const [payer, setPayer] = useState("");

  const addExpense = async () => {
    if (newExpense.description && newExpense.amount && newExpense.paidBy) {
      try {
        const payerContractInstance = getMemberAccount(memberContracts, newExpense.paidBy);
        const paidByAddress = memberWallets[newExpense.paidBy].wallet.getAddress();
        const otherMembers =
          group?.members.filter((member) => member !== newExpense.paidBy) || [];
        const otherMemberAddresses = otherMembers.map(
          (member) => memberWallets[member].wallet.getAddress()
        );
        console.log("expense amount", newExpense.amount);

        const tx = await payerContractInstance.methods
          .setup_group_payments(
            paidByAddress,
            otherMemberAddresses,
            newExpense.amount
          )
          .send();

        await tx.wait();

        setExpenses((prevExpenses) => [
          ...prevExpenses,
          { 
            id: prevExpenses.length + 1,
            ...newExpense,
            type: "expense" 
          },
        ]);
        setNewExpense({ description: "", amount: 0, paidBy: "" });
        await fetchBalances();
      } catch (error: any) {
        console.error("Error adding expense:", error);
        alert(`Error: ${error.message}`);
      }
    }
  };

  const addPayment = async () => {
    if (payer && newPayment.to && newPayment.amount) {
      try {
        const payerContractInstance = getMemberAccount(memberContracts, payer);
        const payerAddress = memberWallets[payer].wallet.getAddress();
        const toAddress = memberWallets[newPayment.to].wallet.getAddress();
        console.log("amount", newPayment.amount);

        const tx = await payerContractInstance.methods
          .make_payment(payerAddress, toAddress, newPayment.amount)
          .send().wait();

        console.log("tx", tx);


        setExpenses((prevExpenses) => [
          ...prevExpenses,
          {
            id: prevExpenses.length + 1,
            description: `Payment to ${newPayment.to}`,
            amount: newPayment.amount,
            paidBy: payer,
            to: newPayment.to,
            type: "payment",
          },
        ]);
        setNewPayment({ to: "", amount: 0 });
        setPayer("");
        await fetchBalances();
      } catch (error: any) {
        console.error("Error making payment:", error);
        alert(`Error: ${error.message}`);
      }
    }
  };

  const setBalanceBetweenMembers = async () => {
    if (newBalance.Creditor && newBalance.Debtor && newBalance.Amount) {
      try {
        const memberAInstance = getMemberAccount(memberContracts, newBalance.Creditor);
  
        // Add debugging logs
        console.log("memberContracts", memberContracts);
        console.log("newBalance.Creditor", newBalance.Creditor);
        console.log("memberAInstance", memberAInstance);
  
        if (!memberAInstance) {
          console.error(`No contract instance found for creditor: ${newBalance.Creditor}`);
          alert(`No contract instance found for creditor: ${newBalance.Creditor}`);
          return;
        }
  
        console.log("memberAInstance.methods", memberAInstance.methods);
        console.log("Available methods:", Object.keys(memberAInstance.methods));
  
        if (!memberAInstance.methods.set_balance) {
          console.error("set_balance method not found on contract instance.");
          alert("set_balance method not found on contract instance.");
          return;
        }
  
        const creditorAddress = await memberWallets[newBalance.Creditor].wallet.getAddress();
        console.log("creditorAddress", creditorAddress.toString());
        const debtorAddress = await memberWallets[newBalance.Debtor].wallet.getAddress();
        console.log("debtorAddress", debtorAddress.toString());
        console.log("amount", newBalance.Amount);
  
        const tx = await memberAInstance.methods
          .set_balance(creditorAddress, debtorAddress, newBalance.Amount)
          .send();
  
        await tx.wait();

        setExpenses((prevExpenses) => [
          ...prevExpenses,
          {
            id: prevExpenses.length + 1,
            description: `Balance set between ${newBalance.Creditor} and ${newBalance.Debtor}`,
            amount: newBalance.Amount,
            paidBy: newBalance.Creditor,
            to: newBalance.Debtor,
            type: "balance_set",
          },
        ]);
        setNewBalance({ Creditor: "", Debtor: "", Amount: 0 });
        await fetchBalances();
      } catch (error: any) {
        console.error("Error setting balance:", error);
        alert(`Error: ${error.message}`);
      }
    }
  };

  const fetchBalances = async () => {
    if (group) {
      const updatedBalances: Balances = {};
      console.log("Starting to fetch balances for group:", group.name);

      try {
        await Promise.all(
          group.members.map(async (member) => {
            updatedBalances[member] = {};
            console.log(`Fetching balances for member: ${member}`);

            await Promise.all(
              group.members.map(async (otherMember) => {
                if (member !== otherMember) {
                  console.log(`Fetching balance between ${member} and ${otherMember}`);
                  try {
                    const contractInstance = getMemberAccount(memberContracts, member);
                    const memberAddress = memberWallets[member].wallet.getAddress();
                    console.log(`Member address: ${memberAddress}`);
                    const otherMemberAddress = memberWallets[otherMember].wallet.getAddress();
                    console.log(`Other member address: ${otherMemberAddress}`);

                    // Fetch BigInt values
                    const Result = await contractInstance.methods
                      .get_balance(memberAddress, otherMemberAddress)
                      .simulate();

                    const balance = Result;
                    console.log("balance", balance);

                    updatedBalances[member][otherMember] = balance;

                    console.log(
                      `Balance fetched for ${member} to ${otherMember}: ${balance}`
                    );
                  } catch (error) {
                    console.error(
                      `Error fetching balance for ${member} to ${otherMember}:`,
                      error
                    );
                    updatedBalances[member][otherMember] = 0; // Set a default value in case of error
                  }
                }
              })
            );
          })
        );

        setBalances(updatedBalances);
        console.log("All balances fetched successfully:", updatedBalances);
      } catch (error) {
        console.error("Error fetching balances:", error);
        alert("An error occurred while fetching balances. Please try again.");
      }
    } else {
      console.warn("Attempted to fetch balances without a group");
    }
  };

  return {
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
  };
};
