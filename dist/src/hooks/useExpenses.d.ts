import { Expense, Group, Balances, MemberContracts, MemberWallets, NewExpense } from "@/utils/types";
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