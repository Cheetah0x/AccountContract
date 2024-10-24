// useAccountSecrets.ts
import { useState, useEffect } from "react";
import { Fq, Fr } from "@aztec/aztec.js";
import { generatePublicKeys } from "@/contracts/src/test/utils";

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

export const useAccountSecrets = () => {
  const [accountPrivateKey, setAccountPrivateKey] = useState<Fq | null>(null); 
  const [secret, setSecret] = useState<Fr | null>(null); 
  const [salt, setSalt] = useState<Fr | null>(null); 

  // Effect to generate secrets when the component is mounted
  useEffect(() => {
    const getAccountSecrets = async () => {
      // Step 1: Generate the signing private key using the utility function
      const { signingPrivateKey } = await generatePublicKeys();

      // Step 2: Generate the secret and salt as Fr values
      const secret = Fr.random();
      const salt = Fr.random();

      // Step 3: Store the generated values in the component state
      setSecret(secret);
      setSalt(salt);
      setAccountPrivateKey(signingPrivateKey);
    };

    // Invoke the function to generate secrets
    getAccountSecrets();
  }, []); // Empty dependency array ensures this runs once when the component is mounted

  // Return the generated secrets
  return { accountPrivateKey, secret, salt };
};
