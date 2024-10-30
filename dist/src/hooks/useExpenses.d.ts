import { Expense, Group, Balances, MemberContracts, MemberWallets, NewExpense } from "@/utils/types";
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
export declare const useExpenses: (group: Group | null, memberWallets: MemberWallets, memberContracts: MemberContracts) => {
    expenses: Expense[];
    balances: Balances;
    newExpense: NewExpense;
    setNewExpense: import("react").Dispatch<import("react").SetStateAction<NewExpense>>;
    addExpense: () => Promise<void>;
    newPayment: {
        to: string;
        amount: number;
    };
    setNewPayment: import("react").Dispatch<import("react").SetStateAction<{
        to: string;
        amount: number;
    }>>;
    addPayment: () => Promise<void>;
    payer: string;
    setPayer: import("react").Dispatch<import("react").SetStateAction<string>>;
    newBalance: {
        Creditor: string;
        Debtor: string;
        Amount: number;
    };
    setNewBalance: import("react").Dispatch<import("react").SetStateAction<{
        Creditor: string;
        Debtor: string;
        Amount: number;
    }>>;
    setBalanceBetweenMembers: () => Promise<void>;
    fetchBalances: () => Promise<void>;
};
//# sourceMappingURL=useExpenses.d.ts.map