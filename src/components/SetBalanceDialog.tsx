import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign } from "lucide-react";
import { Group } from "@/utils/types";

interface SetBalanceDialogProps {
  group: Group;
  newBalance: { Creditor: string; Debtor: string; Amount: number };
  setNewBalance: (balance: { Creditor: string; Debtor: string; Amount: number }) => void;
  setBalanceBetweenMembers: () => void;
}

/**
 * SetBalanceDialog component allows users to set a balance between two group members.
 * The user selects a creditor, a debtor, and the amount, then submits the form to set the balance.
 *
 * @param {Group} group - The group object containing the list of members.
 * @param {{ Creditor: string; Debtor: string; Amount: number }} newBalance - The current state of the balance details.
 * @param {function} setNewBalance - Function to update the balance details (creditor, debtor, and amount).
 * @param {function} setBalanceBetweenMembers - Function to handle submitting the balance set action.
 
 * This component performs the following:
 * 1. **Creditor and Debtor Selection**: Users can select a creditor and a debtor from the group members.
 * 2. **Amount Input**: Users can input the amount for setting the balance.
 * 3. **Form Submission**: When the "Set Balance" button is clicked, the `setBalanceBetweenMembers` function is triggered to submit the form.
 */

export const SetBalanceDialog: React.FC<SetBalanceDialogProps> = ({
  group,
  newBalance,
  setNewBalance,
  setBalanceBetweenMembers,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">
          <DollarSign className="mr-2 h-4 w-4" /> Set Balance P2P
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Balance Between Members</DialogTitle>
          <DialogDescription>
            Enter the details to set the balance.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Creditor Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="Creditor" className="text-right">
              Creditor
            </Label>
            <Select
              onValueChange={(value) =>
                setNewBalance({ ...newBalance, Creditor: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Creditor" />
              </SelectTrigger>
              <SelectContent>
                {group.members.map((member, index) => (
                  <SelectItem key={index} value={member}>
                    {member}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Debtor Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="Debtor" className="text-right">
              Debtor
            </Label>
            <Select
              onValueChange={(value) =>
                setNewBalance({ ...newBalance, Debtor: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Debtor" />
              </SelectTrigger>
              <SelectContent>
                {group.members
                  .filter((member) => member !== newBalance.Creditor)
                  .map((member, index) => (
                    <SelectItem key={index} value={member}>
                      {member}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Input */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="balanceAmount" className="text-right">
              Amount
            </Label>
            <Input
              id="balanceAmount"
              type="number"
              value={
                newBalance.Amount === 0 ? "" : newBalance.Amount.toString()
              }
              onChange={(e) => {
                const inputValue = e.target.value;
                if (/^\d*$/.test(inputValue)) {
                  setNewBalance({
                    ...newBalance,
                    Amount:
                      inputValue.replace(/^0+/, "") === ""
                        ? 0
                        : parseFloat(inputValue.replace(/^0+/, "")) || 0,
                  });
                }
              }}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={setBalanceBetweenMembers}>Set Balance</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
