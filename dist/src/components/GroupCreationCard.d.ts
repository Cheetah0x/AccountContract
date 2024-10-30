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
/**
 * GroupCreationCard component provides a form to create a new group and add members to it.
 * It allows users to input a group name, add members by name, select PXE instances for each member, and manage the list of members.
 *
 * @param {string} newGroupName - The current value of the new group's name.
 * @param {function} setNewGroupName - Function to update the new group name.
 * @param {string} newMember - The current value of the member being added.
 * @param {function} setNewMember - Function to update the member input value.
 * @param {function} addMember - Function to add a new member with a selected PXE index.
 * @param {string[]} members - An array of member names currently in the group.
 * @param {function} removeMember - Function to remove a member from the group.
 * @param {function} createGroup - Function to create the group with the provided name and members.
 * @param {PXEWithUrl[]} PXEInstances - An array of PXE instances, used to assign each member a specific PXE.
 *
 * This component performs the following:
 * 1. **Group Creation**: Allows users to input a group name and create a group.
 * 2. **Add Members**: Users can add members to the group by specifying a name and selecting a PXE instance.
 * 3. **Member Management**: Displays a list of added members and allows users to remove any member.
 * 4. **Validation**: The "Create Group" button is disabled until a group name and at least one member are added.
 */
export declare const GroupCreationCard: React.FC<GroupCreationCardProps>;
export {};
//# sourceMappingURL=GroupCreationCard.d.ts.map