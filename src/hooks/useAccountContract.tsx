// useContract.js
import { useState, useEffect } from 'react';
import { AccountWalletWithSecretKey, AztecAddress, Contract, DeployAccountOptions, Fq, Fr, loadContractArtifact, NoirCompiledContract, PXE, Wallet } from '@aztec/aztec.js';
import { toast } from 'react-toastify';
import AccountGroupContractJson from '../contracts/target/account_group-AccountGroup.json' assert { type: 'json' };
import { generatePublicKeys } from '@/contracts/src/test/utils';
import { AccountGroupContractClass, AccountGroupManager } from '@/utils/types';
import { AccountGroupContract } from '@/contracts/src/artifacts/AccountGroup';
// useAccountContract.ts

export function useAccountContract(
  pxe: PXE | null,
  adminWallet: AccountWalletWithSecretKey | null,
  secret: Fr | null,
  accountPrivateKey: Fq | null,
  salt: Fr | null
) {
  const [wait, setWait] = useState(false);
  const [groupContract, setGroupContract] = useState<AccountGroupContractClass | null>(null);
  const [groupContractWallet, setGroupContractWallet] = useState<Wallet | null>(null);
  const [groupContractAddress, setGroupContractAddress] = useState<AztecAddress | null>(null);

    const registerContract = async () => {
      if (!pxe || !adminWallet || !secret || !accountPrivateKey || !salt) {
        // Not all dependencies are ready, wait
        console.log("Waiting for all dependencies to be ready in useAccountContract");
        return;
      }
      setWait(true);

      try {
        // Step: 1: Get the admin address (from the adminWallet)
        const adminAddress = await adminWallet.getAddress();
        console.log("Admin Address", adminAddress);

        // Create AccountGroupContract with the signing private key
        const accountContract = new AccountGroupContractClass(
          accountPrivateKey,
          adminAddress
        );
        console.log("Account Contract", accountContract);

        // Initialize AccountGroupManager with the admin address
        const accountGroupManager = new AccountGroupManager(
          pxe,
          secret,
          accountContract,
          adminAddress,
          salt
        );

        await accountGroupManager.register();
        console.log("Account Manager", accountGroupManager);

        // Deployment options, deploys the account contract, this only needs to be done once
        const deployOptions: DeployAccountOptions = {
          skipClassRegistration: false,
          skipPublicDeployment: false,
        };
        const deployTx = accountGroupManager.deploy(deployOptions);

        const accountContractWallet = await deployTx.getWallet();
        console.log("Account Contract Wallet", accountContractWallet);

        const accountContractAddress = accountContractWallet.getAddress();
        console.log("Account Contract deployed at:", accountContractAddress);

        // Load the account contract artifact
        const contractInstance = await AccountGroupContract.at(accountContractAddress, accountContractWallet);
        const contractAddress = contractInstance.address;

        // Store the instance
        setGroupContractWallet(accountContractWallet);
        setGroupContractAddress(contractAddress);
        setGroupContract(accountContract);

        console.log("Contract registered at:", contractAddress);

      } catch (error) {
        console.error("Error deploying contract:", error);
      } finally {
        setWait(false);
      }
    };

  return { registerContract, groupContract, groupContractWallet, groupContractAddress, wait };
}
