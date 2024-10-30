import React from 'react';
import { Group, NewExpense } from "@/utils/types";
interface AddExpenseDialogProps {
    group: Group;
    newExpense: NewExpense;
    setNewExpense: (expense: NewExpense) => void;
    addExpense: () => Promise<void>;
}
/**
 * AddExpenseDialog component allows users to add a new expense to the specified group.
 * It opens a modal (dialog) where users can enter the description, amount, and payer of the expense.
 *
 * @param {Group} group - The group object that contains the list of members. Used to select the payer of the expense.
 * @param {NewExpense} newExpense - The current state of the new expense being added.
 * @param {function} setNewExpense - Function to update the newExpense state with new input values.
 * @param {function} addExpense - Function to submit the new expense and add it to the group's expenses.
 *
 */
export declare const AddExpenseDialog: React.FC<AddExpenseDialogProps>;
export {};
//# sourceMappingURL=AddExpenseDialog.d.ts.map