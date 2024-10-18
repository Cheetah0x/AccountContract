import { useState, useEffect } from "react";
import { Fq, Fr } from "@aztec/aztec.js";
import { generatePublicKeys } from "@/contracts/src/test/utils";

export const useAccountSecrets = () => {
  const [accountPrivateKey, setAccountPrivateKey] = useState<Fq | null>(null);
  const [secret, setSecret] = useState<Fr | null>(null);

  useEffect(() => {
    const getAccountSecrets = async () => {
      const { signingPrivateKey } = await generatePublicKeys();
      const secret = Fr.random();
      setSecret(secret);
      setAccountPrivateKey(signingPrivateKey);
    };
    getAccountSecrets();
  }, []);

  return { accountPrivateKey, secret };
};
