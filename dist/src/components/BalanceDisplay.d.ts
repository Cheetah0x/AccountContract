interface Balances {
    [member: string]: {
        [otherMember: string]: number | BigInt;
    };
}
interface BalanceDisplayProps {
    balances: Balances;
    members: string[];
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
export default function BalanceDisplay({ balances, members }: BalanceDisplayProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=BalanceDisplay.d.ts.map