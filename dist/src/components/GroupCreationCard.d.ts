import React from 'react';
import { PXEWithUrl } from '@/utils/types';
interface GroupCreationCardProps {
    newGroupName: string;
    setNewGroupName: (name: string) => void;
    newMember: string;
    setNewMember: (member: string) => void;
    addMember: (name: string, pxeIndex: number) => void;
    members: string[];
    removeMember: (member: string) => void;
    createGroup: () => void;
    PXEInstances: PXEWithUrl[];
}
export declare const GroupCreationCard: React.FC<GroupCreationCardProps>;
export {};
//# sourceMappingURL=GroupCreationCard.d.ts.map