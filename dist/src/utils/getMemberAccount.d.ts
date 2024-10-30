import { MemberContracts } from "./types";
import { Contract } from "@aztec/aztec.js";
/**
 * Retrieves the contract instance associated with a specific member.
 *
 * @param {MemberContracts} memberContracts - An object containing contract instances for each member.
 * @param {string} memberName - The name of the member whose contract instance is being retrieved.
 *
 * @returns {Contract} - The contract instance associated with the member.
 *
 * @throws {Error} - Throws an error if no contract is found for the specified member.
 *
 * @example
 * const contract = getMemberAccount(memberContracts, "Alice");
 */
export declare const getMemberAccount: (memberContracts: MemberContracts, memberName: string) => Contract;
//# sourceMappingURL=getMemberAccount.d.ts.map