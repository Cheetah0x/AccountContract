import { MemberContracts, PXEWithUrl } from "./types";
import { Contract } from "@aztec/aztec.js";

export const getMemberAccount = (
  memberContracts: MemberContracts,
  memberName: string
): Contract => {
  const memberContract = memberContracts[memberName];
  if (!memberContract) {
    console.error(`Error: No contract found for member: ${memberName}`);
    throw new Error(`No contract found for member: ${memberName}`);
  }
  return memberContract.walletInstance;
};
