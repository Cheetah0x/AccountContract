import { AccountWalletWithSecretKey, Fr } from "@aztec/aztec.js";
import { MemberWallets, MemberContracts, PXEWithUrl } from "@/utils/types";
import { AccountGroupContractClass } from "@/utils/types";
export declare const useAddMembers: (secret: Fr, accountContract: AccountGroupContractClass, adminWallet: AccountWalletWithSecretKey, PXEInstances: PXEWithUrl[]) => {
    members: string[];
    memberWallets: MemberWallets;
    memberContracts: MemberContracts;
    addMember: (name: string, pxeIndex: number) => Promise<void>;
    removeMember: (name: string) => void;
};
//# sourceMappingURL=useAddMembers.d.ts.map