import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Group } from "@/utils/types";

interface GroupDetailsCardProps {
  group: Group;
}

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
