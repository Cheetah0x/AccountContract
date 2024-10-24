import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Balances } from "@/utils/types";

interface BalanceSummaryProps {
  members: string[];
  balances: Balances;
}

/**
 * BalanceSummary component shows a detailed summary of balances between members in a group.
 * It displays the balance of each member with all other members, indicating whether the balance is positive or negative.
 *
 * @param {string[]} members - An array of group members.
 * @param {Balances} balances - A nested object representing balances between members.
 *    The format is: { member: { otherMember: number | BigInt } }.
 *    - `member`: The primary member whose balances are displayed.
 *    - `otherMember`: The balance between the primary member and the other member (can be positive or negative).
 *
 * This component performs the following:
 * 1. **Balance Display**: For each member, it shows their balance with every other member.
 * 2. **Positive/Negative Indicator**: If the balance is positive, it shows a green upward arrow; if negative, a red downward arrow.
 * 3. **Formatting**: Balances are displayed as two decimal numbers, even if they are BigInts or regular numbers.
 */

export const BalanceSummary: React.FC<BalanceSummaryProps> = ({ members, balances }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <Card key={member} className="overflow-hidden">
              <CardHeader className="bg-muted">
                <CardTitle className="text-lg">{member}</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {members
                  .filter((otherMember) => otherMember !== member)
                  .map((otherMember) => {
                    let balance: number | string | bigint = balances[member]?.[otherMember] ?? 0;

                    if (typeof balance === 'bigint') {
                      balance = Number(balance).toFixed(2);
                    } else if (typeof balance === 'number') {
                      balance = Number(balance).toFixed(2);
                    }

                    const balanceNumber = parseFloat(balance.toString());

                    const isPositive = balanceNumber > 0;

                    return (
                      <div
                        key={otherMember}
                        className="flex justify-between items-center py-2"
                      >
                        <span className="flex items-center">
                          {isPositive ? (
                            <ArrowUpRight className="mr-2 h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowDownLeft className="mr-2 h-4 w-4 text-red-500" />
                          )}
                          {otherMember}
                        </span>
                        <span
                          className={`font-bold ${
                            isPositive ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {isPositive ? "+" : ""}
                          {balanceNumber.toFixed(2)} {/* Ensure it's displayed with two decimals */}
                        </span>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
