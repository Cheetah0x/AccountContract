import { Fq, Fr } from "@aztec/aztec.js";
/**
 * Hook to generate and manage the secrets required for registering
 * the Aztec account contract in the PXE (Private Execution Environment).
 *
 * This hook generates a private key (`Fq`), a `Fr` secret, and a `Fr` salt upon initialization,
 * and makes them available for use in account contract registration for the members of the group.
 *
 * @returns {Object} An object containing:
 * - `accountPrivateKey`: The generated private key (`Fq`) used to sign and manage the account contract.
 * - `secret`: A `Fr` value used during contract registration as part of the account setup process.
 * - `salt`: A `Fr` value used as a salt for the contract registration to ensure uniqueness.
 */
export declare const useAccountSecrets: () => {
    accountPrivateKey: Fq | null;
    secret: Fr | null;
    salt: Fr | null;
};
//# sourceMappingURL=useAccountSecrets.d.ts.map