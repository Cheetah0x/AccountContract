import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { PXEWithUrl } from '@/utils/types';
import { useState } from 'react';

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

export const GroupCreationCard: React.FC<GroupCreationCardProps> = ({
  newGroupName,
  setNewGroupName,
  newMember,
  setNewMember,
  addMember,
  members,
  removeMember,
  createGroup,
  PXEInstances,
}) => {
  // Start with PXEIndex as 1 since 0 is for the admin when deploying the contract
  const [selectedPXEIndex, setSelectedPXEIndex] = useState(1);
  console.log("PXE Instances: ", PXEInstances.length);



  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Group</CardTitle>
        <CardDescription>Create a new group and add members</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder="Group name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <div className="flex space-x-2">
            <Input
              placeholder="Add member"
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
            />
            <Select
              onValueChange={(value) => setSelectedPXEIndex(parseInt(value))}
              value={selectedPXEIndex.toString()}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select PXE" />
              </SelectTrigger>
              <SelectContent>
                {PXEInstances.map((instance, index) => {
                    // Skip the admin instance (index 0) and show the others
                    if (index === 0) return null;

                    return (
                    <SelectItem key={index} value={index.toString()}>
                        {`PXE ${index + 1}`}
                    </SelectItem>
                    );
                })}
                </SelectContent>
            </Select>

            <Button
              onClick={() => {
                addMember(newMember, selectedPXEIndex);
                setNewMember("");
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {members.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {members.map((member, index) => (
                <div
                  key={index}
                  className="flex items-center bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm"
                >
                  {member}
                  {member !== "Admin" && (
                    <button
                      onClick={() => removeMember(member)}
                      className="ml-2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={createGroup} disabled={!newGroupName || members.length === 0}>
          Create Group
        </Button>
      </CardFooter>
    </Card>
  );
};
