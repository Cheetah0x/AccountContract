import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Group } from "@/utils/types";

interface GroupDetailsCardProps {
  group: Group;
}

/**
 * GroupDetailsCard component displays the details of a group, including its name and list of members.
 *
 * @param {Group} group - The group object containing the group's name and its members.
 *
 * This component performs the following:
 * 1. **Group Name Display**: Shows the name of the group.
 * 2. **Member Count**: Displays the number of members in the group.
 * 3. **Member List**: Lists the members, each displayed as a styled element.
 */

export const GroupDetailsCard: React.FC<GroupDetailsCardProps> = ({ group }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{group.name}</CardTitle>
        <CardDescription>{group.members.length} members</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {group.members.map((member, index) => (
            <div
              key={index}
              className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm"
            >
              {member}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
