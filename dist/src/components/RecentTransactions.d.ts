import React from 'react';
import { Expense } from "@/utils/types";
interface RecentTransactionsProps {
    expenses: Expense[];
}
/**
 * RecentTransactions component displays a list of recent transactions, such as expenses, payments, or balance adjustments.
 * It shows the description, amount, and who paid for or set the transaction.
 *
 * @param {Expense[]} expenses - An array of transactions (expenses, payments, or balance sets) to display.

 * This component performs the following:
 * 1. **Expense Display**: Displays the list of recent expenses or payments with their description and amount.
 * 2. **Empty State Handling**: If there are no expenses, it shows a message encouraging the user to add one.
 * 3. **Transaction Types**: It handles different transaction types: expenses, payments, and balance sets, showing different information for each.
 */
export declare const RecentTransactions: React.FC<RecentTransactionsProps>;
export {};
//# sourceMappingURL=RecentTransactions.d.ts.map