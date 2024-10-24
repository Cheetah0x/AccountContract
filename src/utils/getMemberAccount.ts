import { MemberContracts, PXEWithUrl } from "./types";
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
export const getMemberAccount = (
  memberContracts: MemberContracts,
  memberName: string
): Contract => {
  const memberContract = memberContracts[memberName];

  // If no contract instance is found for the specified member, throw an error
  if (!memberContract) {
    console.error(`Error: No contract found for member: ${memberName}`);
    throw new Error(`No contract found for member: ${memberName}`);
  }

  // Return the contract instance associated with the member
  return memberContract.walletInstance;
};
