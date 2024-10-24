import { useState } from "react";
import { Group,  } from "@/utils/types";

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

export const useGroup = (
  members: string[], // Array of member names to be included in the group
) => {
  // State to hold the group object
  const [group, setGroup] = useState<Group | null>(null);

  // State to hold the new group's name
  const [newGroupName, setNewGroupName] = useState("");

  /**
   * Creates a new group with the specified name and members.
   * Clears the group name input after the group is created.
   */
  const createGroup = async () => {
    // Ensure the group name is set and there are members to add
    if (newGroupName && members.length > 0) {
      // Set the group state with the new group name and members
      setGroup({ name: newGroupName, members });
      
      // Reset the group name after creation
      setNewGroupName("");
    }
  };

  // Return the group state and functions for managing group creation
  return {
    group,
    setGroup,            
    newGroupName,        
    setNewGroupName,     
    createGroup,         
  };
};
