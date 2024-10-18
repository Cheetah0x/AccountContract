// useContract.js
import { useState } from 'react';
import { AccountWalletWithSecretKey, AztecAddress, Contract, DeployAccountOptions, Fq, Fr, loadContractArtifact, NoirCompiledContract, PXE, Wallet } from '@aztec/aztec.js';
import { toast } from 'react-toastify';
import AccountGroupContractJson from '../contracts/target/account_group-AccountGroup.json' assert { type: 'json' };
import { generatePublicKeys } from '@/contracts/src/test/utils';
import { AccountGroupContractClass, AccountGroupManager } from '@/utils/types';
import { AccountGroupContract } from '@/contracts/src/artifacts/AccountGroup';

export function useAccountContract(
  pxe: PXE, 
  adminWallet: AccountWalletWithSecretKey, 
  secret: Fr, 
  accountPrivateKey: Fq
) {
  const [wait, setWait] = useState(false);
  const [groupContract, setGroupContract] = useState<AccountGroupContractClass | undefined>();
  const [groupContractWallet, setGroupContractWallet] = useState<Wallet | undefined>();
  const [groupContractAddress, setGroupContractAddress] = useState<AztecAddress | undefined>();

  //Registers the account contract in the specified PXE
  const registerContract = async () => {
    if (!adminWallet || !secret || !accountPrivateKey) {
      console.error("Admin wallet or secrets not initialized.");
      return;
    }
    setWait(true);

    try {
      //Step: 1: Get the admin address (from the adminWallet)
      const adminAddress = adminWallet.getAddress();
      console.log("Admin Address", adminAddress);

      //Create AccountGroupContract with the signing private key
      const accountContract = new AccountGroupContractClass(
        accountPrivateKey,
        adminAddress
      );
      console.log("Account Contract", accountContract);
      //Initialise AccountGroupManager with the admin address
      const accountGroupManager = new AccountGroupManager(
        pxe,
        secret,
        accountContract,
        adminAddress
      );

      await accountGroupManager.register();
      console.log("Account Manager", accountGroupManager);

      //Deployment options, deploys the account contract, this only needs to be done once
      const deployOptions: DeployAccountOptions = {
        skipClassRegistration: false,
        skipPublicDeployment: false,
      };
      const deployTx = accountGroupManager.deploy(deployOptions);

      const accountContractWallet = await deployTx.getWallet();
      console.log("Account Contract Wallet", accountContractWallet);

      const accountContractAddress = accountContractWallet.getAddress();
      console.log("Account Contract deployed at:", accountContractAddress);

      //Load the account contract artifact
      const contractInstance = await AccountGroupContract.at(accountContractAddress, accountContractWallet);
      const contractAddress = contractInstance.address;

      //store the instance
      setGroupContractWallet(accountContractWallet);
      setGroupContractAddress(contractAddress);
      setGroupContract(accountContract);

      toast.success(`Contract registered successfully in PXE with address: ${contractAddress}`);
      console.log("Contract registered at:", contractAddress);
  
      return contractAddress;
    } catch (error) {
      console.error("Error deploying contract:", error);
      toast.error("Error deploying contract");
      return [];
    } finally {
      setWait(false);
    }
  };

  return { registerContract, groupContract, groupContractWallet, groupContractAddress, wait};
}