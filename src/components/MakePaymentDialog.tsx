import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard } from "lucide-react";
import { Group } from "@/utils/types";

interface MakePaymentDialogProps {
  group: Group;
  payer: string;
  setPayer: (payer: string) => void;
  newPayment: { to: string; amount: number };
  setNewPayment: (payment: { to: string; amount: number }) => void;
  addPayment: () => void;
}

/**
 * MakePaymentDialog component allows users to select a payer, recipient, and amount to make a payment within a group.
 * The payment details are entered in a dialog (modal) and submitted when the "Make Payment" button is clicked.
 *
 * @param {Group} group - The group object that contains the list of members who can be selected as the payer and recipient.
 * @param {string} payer - The current value of the selected payer.
 * @param {function} setPayer - Function to update the selected payer.
 * @param {{ to: string; amount: number }} newPayment - The current state of the payment details (recipient and amount).
 * @param {function} setNewPayment - Function to update the payment details (recipient and amount).
 * @param {function} addPayment - Function to handle submitting the payment.
 * 
 * This component performs the following:
 * 1. **Payer Selection**: Users can select a payer from the group members.
 * 2. **Recipient Selection**: Users can select a recipient (another member) from the group.
 * 3. **Amount Input**: Users can input the amount they want to pay.
 * 4. **Form Submission**: The form is submitted when the "Make Payment" button is clicked, triggering the `addPayment` function.
 */

export const MakePaymentDialog: React.FC<MakePaymentDialogProps> = ({
  group,
  payer,
  setPayer,
  newPayment,
  setNewPayment,
  addPayment,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">
          <CreditCard className="mr-2 h-4 w-4" /> Make a Payment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Make a Payment</DialogTitle>
          <DialogDescription>
            Enter the payment details.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          
          {/* Payer Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payer" className="text-right">
              Payer
            </Label>
            <Select onValueChange={(value) => setPayer(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a payer" />
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

          {/* Pay To Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payTo" className="text-right">
              Pay To
            </Label>
            <Select
              onValueChange={(value) =>
                setNewPayment({ ...newPayment, to: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a member" />
              </SelectTrigger>
              <SelectContent>
                {group.members
                  .filter((member) => member !== payer)
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
            <Label htmlFor="paymentAmount" className="text-right">
              Amount
            </Label>
            <Input
              id="paymentAmount"
              type="number"
              value={
                newPayment.amount === 0 ? "" : newPayment.amount.toString()
              }
              onChange={(e) => {
                const inputValue = e.target.value;
                if (/^\d*$/.test(inputValue)) {
                  setNewPayment({
                    ...newPayment,
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
        </div>
        <DialogFooter>
          <Button onClick={addPayment}>Make Payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
