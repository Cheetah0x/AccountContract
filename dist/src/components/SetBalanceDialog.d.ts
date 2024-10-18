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
export declare const SetBalanceDialog: React.FC<SetBalanceDialogProps>;
export {};
//# sourceMappingURL=SetBalanceDialog.d.ts.map