import React from 'react';
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
export declare const BalanceSummary: React.FC<BalanceSummaryProps>;
export {};
//# sourceMappingURL=BalanceSummary.d.ts.map