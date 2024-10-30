import { Group } from "@/utils/types";
/**
 * Hook to manage group creation and group state.
 *
 * @param members - An array of member names to be included in the group.
 *
 * @returns {Object} An object containing the following:
 * - `group`: The current group object, or `null` if no group is created yet.
 * - `setGroup`: Function to manually update the group state.
 * - `newGroupName`: The current name for the new group being created.
 * - `setNewGroupName`: Function to update the `newGroupName` state.
 * - `createGroup`: Function to create a new group with the given name and members.
 *
 * 1. **Group Creation**: Allows the user to create a group with a specified name and members.
 * 2. **State Management**: Tracks the group's name and members and allows for manual state updates if necessary.
 */
export declare const useGroup: (members: string[]) => {
    group: Group | null;
    setGroup: import("react").Dispatch<import("react").SetStateAction<Group | null>>;
    newGroupName: string;
    setNewGroupName: import("react").Dispatch<import("react").SetStateAction<string>>;
    createGroup: () => Promise<void>;
};
//# sourceMappingURL=useGroup.d.ts.map