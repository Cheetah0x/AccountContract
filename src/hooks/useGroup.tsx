import { useState } from "react";
import { Group, MemberWallets } from "@/utils/types";

export const useGroup = (
  members: string[],
  memberWallets: MemberWallets
) => {
  const [group, setGroup] = useState<Group | null>(null);
  const [newGroupName, setNewGroupName] = useState("");

  const createGroup = async () => {
    if (newGroupName && members.length > 0) {
      setGroup({ name: newGroupName, members });
      setNewGroupName("");
    }
  };

  return {
    group,
    setGroup,
    newGroupName,
    setNewGroupName,
    createGroup,
  };
};