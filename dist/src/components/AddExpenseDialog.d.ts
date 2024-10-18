import React from 'react';
import { Group, NewExpense } from "@/utils/types";
interface AddExpenseDialogProps {
    group: Group;
    newExpense: NewExpense;
    setNewExpense: (expense: NewExpense) => void;
    addExpense: () => void;
}
export declare const AddExpenseDialog: React.FC<AddExpenseDialogProps>;
export {};
//# sourceMappingURL=AddExpenseDialog.d.ts.map