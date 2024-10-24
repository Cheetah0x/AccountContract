import { useState } from "react";
import { Expense, Group, Balances, MemberContracts, MemberWallets, NewExpense } from "@/utils/types";
import { getMemberAccount } from "@/utils/getMemberAccount";

/**
 * Hook manages expenses, payments and balances within the group contract.
 * Handles the state and logic for adding expenses, making payments, setting balances, and fetching balances.
 *
 * @param group - The group object containing information about the group members.
 * @param memberWallets - A dictionary of member names and their associated wallet instances.
 * @param memberContracts - A dictionary of member names and their associated contract instances.
 *
 * @returns {Object} An object containing the following:
 * - `expenses`: The list of expenses or payments made within the group.
 * - `balances`: An object that stores the balances between group members.
 * - `newExpense`: The current new expense being added (description, amount, paidBy).
 * - `setNewExpense`: Function to update the `newExpense` state.
 * - `addExpense`: Function to add a new expense to the group contract.
 * - `newPayment`: The current new payment being processed (to, amount).
 * - `setNewPayment`: Function to update the `newPayment` state.
 * - `addPayment`: Function to add a payment between group members in the contract.
 * - `payer`: The current payer making the payment.
 * - `setPayer`: Function to update the `payer` state.
 * - `newBalance`: The current balance being set between members (Creditor, Debtor, Amount).
 * - `setNewBalance`: Function to update the `newBalance` state.
 * - `setBalanceBetweenMembers`: Function to set a balance between two members in the contract.
 * - `fetchBalances`: Function to fetch the current balances between group members.
 *
 * This hook performs the following operations:
 * 1. Expenses: Handles adding new group expenses where one member pays on behalf of others.
 * 2. Payments: Facilitates payments between group members.
 * 3. Balances: Manages setting and fetching balances between members of the group.
 */

export const useExpenses = (
  group: Group | null,
  memberWallets: MemberWallets,
  memberContracts: MemberContracts
) => {
  // State to store the list of expenses or payments within the group
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // State to store the balances between group members
  const [balances, setBalances] = useState<Balances>({});

  // State to track the new expense being added
  const [newExpense, setNewExpense] = useState<NewExpense>({
    description: "",
    paidBy: "",
    amount: 0,
  });

  // State to track a new payment being made between members
  const [newPayment, setNewPayment] = useState({ to: "", amount: 0 });

  // State to track a new balance being set between members
  const [newBalance, setNewBalance] = useState({
    Creditor: "",
    Debtor: "",
    Amount: 0,
  });

  // State to track the current payer for the payment process
  const [payer, setPayer] = useState("");

  /**
   * Adds a new expense to the group contract, where one member (payer) covers an expense for the others.
   * It calls the `setup_group_payments` method of the contract to register the expense and updates the state.
   */
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

        // Register the group payment in the contract
        const tx = await payerContractInstance.methods
          .setup_group_payments(
            paidByAddress,
            otherMemberAddresses,
            newExpense.amount
          )
          .send();

        await tx.wait();

        // Update state with the new expense
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

  /**
   * Adds a new payment from one member to another in the group contract.
   * It calls the `make_payment` method of the contract and updates the state.
   */
  const addPayment = async () => {
    if (payer && newPayment.to && newPayment.amount) {
      try {
        const payerContractInstance = getMemberAccount(memberContracts, payer);
        const payerAddress = memberWallets[payer].wallet.getAddress();
        const toAddress = memberWallets[newPayment.to].wallet.getAddress();
        console.log("amount", newPayment.amount);

        // Register the payment in the contract
        const tx = await payerContractInstance.methods
          .make_payment(payerAddress, toAddress, newPayment.amount)
          .send().wait();

        console.log("tx", tx);

        // Update state with the new payment
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

  /**
   * Sets a balance between a creditor and a debtor in the group contract.
   * It calls the `set_balance` method of the contract and updates the state.
   */
  const setBalanceBetweenMembers = async () => {
    if (newBalance.Creditor && newBalance.Debtor && newBalance.Amount) {
      try {
        const memberAInstance = getMemberAccount(memberContracts, newBalance.Creditor);
  
        if (!memberAInstance) {
          console.error(`No contract instance found for creditor: ${newBalance.Creditor}`);
          alert(`No contract instance found for creditor: ${newBalance.Creditor}`);
          return;
        }
  
        const creditorAddress = await memberWallets[newBalance.Creditor].wallet.getAddress();
        const debtorAddress = await memberWallets[newBalance.Debtor].wallet.getAddress();
        console.log("amount", newBalance.Amount);
  
        // Set balance in the contract
        const tx = await memberAInstance.methods
          .set_balance(creditorAddress, debtorAddress, newBalance.Amount)
          .send();
  
        await tx.wait();

        // Update state with the balance set operation
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

  /**
   * Fetches the balances between all members of the group by calling the `get_balance` method in the contract.
   * This updates the `balances` state with the retrieved balances.
   */
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

                    // Fetch BigInt values for credit and debt
                    const Credit = await contractInstance.methods
                      .get_balance(memberAddress, otherMemberAddress)
                      .simulate();
                    
                    const Debt = await contractInstance.methods
                      .get_balance(otherMemberAddress, memberAddress)
                      .simulate();

                    const balance = Credit - Debt;
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

  // Return all relevant state and functions for managing expenses and balances
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
