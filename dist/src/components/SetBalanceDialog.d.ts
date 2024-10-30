import React from 'react';
import { Group } from "@/utils/types";
interface SetBalanceDialogProps {
    group: Group;
    newBalance: {
        Creditor: string;
        Debtor: string;
        Amount: number;
    };
    setNewBalance: (balance: {
        Creditor: string;
        Debtor: string;
        Amount: number;
    }) => void;
    setBalanceBetweenMembers: () => void;
}
/**
 * SetBalanceDialog component allows users to set a balance between two group members.
 * The user selects a creditor, a debtor, and the amount, then submits the form to set the balance.
 *
 * @param {Group} group - The group object containing the list of members.
 * @param {{ Creditor: string; Debtor: string; Amount: number }} newBalance - The current state of the balance details.
 * @param {function} setNewBalance - Function to update the balance details (creditor, debtor, and amount).
 * @param {function} setBalanceBetweenMembers - Function to handle submitting the balance set action.
 
 * This component performs the following:
 * 1. **Creditor and Debtor Selection**: Users can select a creditor and a debtor from the group members.
 * 2. **Amount Input**: Users can input the amount for setting the balance.
 * 3. **Form Submission**: When the "Set Balance" button is clicked, the `setBalanceBetweenMembers` function is triggered to submit the form.
 */
export declare const SetBalanceDialog: React.FC<SetBalanceDialogProps>;
export {};
//# sourceMappingURL=SetBalanceDialog.d.ts.map