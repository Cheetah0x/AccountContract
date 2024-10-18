import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign } from "lucide-react";
import { Group, Expense, NewExpense } from "@/utils/types";

interface AddExpenseDialogProps {
  group: Group;
  newExpense: NewExpense;
  setNewExpense: (expense: NewExpense) => void;
  addExpense: () => void;
}

export const AddExpenseDialog: React.FC<AddExpenseDialogProps> = ({
  group,
  newExpense,
  setNewExpense,
  addExpense,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">
          <DollarSign className="mr-2 h-4 w-4" /> Add New Expense
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Enter the details of the new expense.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              value={newExpense.description}
              onChange={(e) =>
                setNewExpense({
                  ...newExpense,
                  description: e.target.value,
                })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              value={
                newExpense.amount === 0 ? "" : newExpense.amount.toString()
              }
              placeholder="Enter the amount"
              onChange={(e) => {
                const inputValue = e.target.value;
                if (/^\d*$/.test(inputValue)) {
                  setNewExpense({
                    ...newExpense,
                    amount:
                      inputValue.replace(/^0+/, "") === ""
                        ? 0
                        : parseFloat(inputValue.replace(/^0+/, "")) || 0,
                  });
                }
              }}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="paidBy" className="text-right">
              Paid By
            </Label>
            <Select
              onValueChange={(value) =>
                setNewExpense({ ...newExpense, paidBy: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a member" />
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
        </div>
        <DialogFooter>
          <Button onClick={addExpense}>Add Expense</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
