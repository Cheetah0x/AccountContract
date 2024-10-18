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
export declare const MakePaymentDialog: React.FC<MakePaymentDialogProps>;
export {};
//# sourceMappingURL=MakePaymentDialog.d.ts.map