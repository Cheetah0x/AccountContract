import { Group, MemberWallets } from "@/utils/types";
export declare const useGroup: (members: string[], memberWallets: MemberWallets) => {
    group: Group | null;
    setGroup: import("react").Dispatch<import("react").SetStateAction<Group | null>>;
    newGroupName: string;
    setNewGroupName: import("react").Dispatch<import("react").SetStateAction<string>>;
    createGroup: () => Promise<void>;
};
//# sourceMappingURL=useGroup.d.ts.map