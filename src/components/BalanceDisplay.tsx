import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownLeft, ArrowUpRight } from "lucide-react"

interface Balances {
  [member: string]: {
    [otherMember: string]: number | BigInt
  }
}

interface BalanceDisplayProps {
  balances: Balances
  members: string[]
}

/**
 * BalanceDisplay component shows a summary of balances between group members.
 * For each member, it lists their balances with every other member, indicating whether the balance is positive or negative.
 *
 * @param {Balances} balances - A nested object representing the balances between members.
 *    The format is: { member: { otherMember: number | BigInt } }.
 *    - `member`: The primary member whose balances with others are displayed.
 *    - `otherMember`: The balance between the primary member and the other member (can be positive or negative).
 * @param {string[]} members - An array of group members whose balances are to be displayed.
 *
 * @returns {JSX.Element} The rendered balance summary as a grid of cards.
 *
 * This component performs the following:
 * 1. **Balance Display**: For each member, it shows the balance they have with every other member.
 * 2. **Positive/Negative Indicator**: If the balance is positive, it shows an upward green arrow; if negative, a downward red arrow.
 * 3. **Formatting**: Balances are displayed as fixed decimals for numbers or as strings for BigInts.
 */

export default function BalanceDisplay({ balances, members }: BalanceDisplayProps) {
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
              {members.filter(otherMember => otherMember !== member).map(otherMember => {
                  let balance = balances[member]?.[otherMember] || 0;
                  let displayBalance: string;

                  if (typeof balance === 'bigint') {
                    displayBalance = balance.toString();
                  } else {
                    displayBalance = Number(balance).toFixed(2);
                  }

                  const isPositive = Number(balance) > 0;
                  return (
                    <div key={otherMember} className="flex justify-between items-center py-2">
                      <span className="flex items-center">
                        {isPositive ? (
                          <ArrowUpRight className="mr-2 h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownLeft className="mr-2 h-4 w-4 text-red-500" />
                        )}
                        {otherMember}
                      </span>
                      <span className={`font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? '+' : ''}{displayBalance}
                      </span>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
