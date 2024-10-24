// useAccountContract.ts

import { useState} from 'react';
import { AccountWalletWithSecretKey, AztecAddress,  DeployAccountOptions, Fq, Fr, PXE, Wallet } from '@aztec/aztec.js';
import { AccountGroupContractClass, AccountGroupManager } from '@/utils/types';
import { AccountGroupContract } from '@/contracts/src/artifacts/AccountGroup';

/**
 * Custom hook to handle the registration and deployment of the AccountGroup contract in Aztec.
 * This hook manages the state of the account contract, including its deployment and interaction.

 * @param pxe - The PXE (Private Execution Environment) instance, required to interact with the Aztec network.
 * @param adminWallet - The admin's wallet, an instance of AccountWalletWithSecretKey, used to manage the contract.
 * @param secret - A `Fr` secret scalar value used during contract registration.
 * @param accountPrivateKey - The private key `Fq` of the account, used to sign and manage the account contract.
 * @param salt - A `Fr` value used as salt during contract deployment.

 * @returns {Object} An object containing the following:
 * - `registerContract`: A function to initialize and register the contract on the PXE.
 * - `groupContract`: The contract instance (or `null` if not deployed yet).
 * - `groupContractWallet`: The wallet associated with the deployed contract.
 * - `groupContractAddress`: The deployed contract's Aztec address.
 * - `wait`: A boolean indicating if the hook is currently processing the contract registration.

 * @throws Will log an error if there is an issue deploying or registering the contract.
 */

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

  /**
   * Registers and deploys the AccountGroupContract on the PXE.
   * This function retrieves the admin address from the wallet, creates the contract instance,
   * and then deploys the contract, storing its wallet and address for future use.
   */
  const registerContract = async () => {
    if (!pxe || !adminWallet || !secret || !accountPrivateKey || !salt) {
      // Not all dependencies are ready, wait
      console.log("Waiting for all dependencies to be ready in useAccountContract");
      return;
    }

    setWait(true); 

    try {
      // Step 1: Get the admin address from the adminWallet.
      const adminAddress = await adminWallet.getAddress();
      console.log("Admin Address", adminAddress);

      // Step 2: Create AccountGroupContract instance using the account private key and admin address.
      const accountContract = new AccountGroupContractClass(
        accountPrivateKey,
        adminAddress
      );
      console.log("Account Contract", accountContract);

      // Step 3: Initialize the AccountGroupManager with the admin address, secret, and salt.
      const accountGroupManager = new AccountGroupManager(
        pxe,
        secret,
        accountContract,
        adminAddress,
        salt
      );
      await accountGroupManager.register();
      console.log("Account Manager", accountGroupManager);

      // Step 4: Define deployment options and deploy the contract.
      const deployOptions: DeployAccountOptions = {
        skipClassRegistration: false,
        skipPublicDeployment: false,
      };
      const deployTx = accountGroupManager.deploy(deployOptions);

      // Step 5: Get the wallet associated with the deployed contract.
      const accountContractWallet = await deployTx.getWallet();
      console.log("Account Contract Wallet", accountContractWallet);

      // Step 6: Retrieve the contract address.
      const accountContractAddress = accountContractWallet.getAddress();
      console.log("Account Contract deployed at:", accountContractAddress);

      // Step 7: Load the account contract artifact and store the contract instance.
      const contractInstance = await AccountGroupContract.at(accountContractAddress, accountContractWallet);
      const contractAddress = contractInstance.address;

      // Update hook state with the contract details.
      setGroupContractWallet(accountContractWallet);
      setGroupContractAddress(contractAddress);
      setGroupContract(accountContract);

      console.log("Contract registered at:", contractAddress);

    } catch (error) {
      console.error("Error deploying contract:", error);
    } finally {
      // Reset the waiting state after the operation is complete.
      setWait(false);
    }
  };

  // Return the relevant contract information and the registration function.
  return { registerContract, groupContract, groupContractWallet, groupContractAddress, wait };
}
