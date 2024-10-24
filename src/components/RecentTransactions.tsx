import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ expenses }) => {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <p className="text-muted-foreground">
            No transactions yet. Add an expense or make a payment!
          </p>
        ) : (
          <ul className="space-y-2">
            {expenses.map((transaction) => (
              <li
                key={transaction.id}
                className="flex justify-between items-center"
              >
                <div>
                  <span className="font-medium">
                    {transaction.description}{" "}
                  </span>
                  {transaction.type === "payment" && (
                    <span className="text-sm text-muted-foreground ml-2">
                      to {transaction.to}{" "}
                    </span>
                  )}
                  {transaction.type === "balance_set" && (
                    <span className="text-sm text-muted-foreground ml-2">
                      between {transaction.paidBy} and {transaction.to}{" "}
                    </span>
                  )}
                </div>
                <div>
                  <span className="font-bold">
                    ${Number(transaction.amount)}
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {transaction.type === "expense"
                      ? "paid by"
                      : transaction.type === "payment"
                      ? "paid by"
                      : "set by"}{" "}
                    {transaction.paidBy}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
