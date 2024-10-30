import React from 'react';
import { Group } from "@/utils/types";
interface MakePaymentDialogProps {
    group: Group;
    payer: string;
    setPayer: (payer: string) => void;
    newPayment: {
        to: string;
        amount: number;
    };
    setNewPayment: (payment: {
        to: string;
        amount: number;
    }) => void;
    addPayment: () => void;
}
/**
 * MakePaymentDialog component allows users to select a payer, recipient, and amount to make a payment within a group.
 * The payment details are entered in a dialog (modal) and submitted when the "Make Payment" button is clicked.
 *
 * @param {Group} group - The group object that contains the list of members who can be selected as the payer and recipient.
 * @param {string} payer - The current value of the selected payer.
 * @param {function} setPayer - Function to update the selected payer.
 * @param {{ to: string; amount: number }} newPayment - The current state of the payment details (recipient and amount).
 * @param {function} setNewPayment - Function to update the payment details (recipient and amount).
 * @param {function} addPayment - Function to handle submitting the payment.
 *
 * This component performs the following:
 * 1. **Payer Selection**: Users can select a payer from the group members.
 * 2. **Recipient Selection**: Users can select a recipient (another member) from the group.
 * 3. **Amount Input**: Users can input the amount they want to pay.
 * 4. **Form Submission**: The form is submitted when the "Make Payment" button is clicked, triggering the `addPayment` function.
 */
export declare const MakePaymentDialog: React.FC<MakePaymentDialogProps>;
export {};
//# sourceMappingURL=MakePaymentDialog.d.ts.map