import {
  // AccountGroupContract,
  AccountGroupContractArtifact,
} from "../artifacts/AccountGroup.js";
import {
  AccountWallet,
  CompleteAddress,
  ContractDeployer,
  createDebugLogger,
  Fr,
  PXE,
  waitForPXE,
  TxStatus,
  createPXEClient,
  getContractInstanceFromDeployParams,
  DebugLogger,
  GrumpkinScalar,
  Schnorr,
  Contract,
  AccountManager,
  AuthWitness,
} from "@aztec/aztec.js";
import { type DeployAccountOptions } from '@aztec/aztec.js';
import { getInitialTestAccountsWallets } from "@aztec/accounts/testing";

import { DefaultAccountContract } from '@aztec/accounts/defaults';
import { ContractArtifact } from "@aztec/foundation/abi";
import { getSchnorrAccount } from "@aztec/accounts/schnorr";

class AccountGroupContract extends DefaultAccountContract {
  private signingPrivateKey: GrumpkinScalar;

  constructor(signingPrivateKey: GrumpkinScalar) {
      super(AccountGroupContractArtifact);
      this.signingPrivateKey = signingPrivateKey;
  }
  getDeploymentArgs() {
      const signingPublicKey = new Schnorr().computePublicKey(this.signingPrivateKey);
      return [signingPublicKey.x, signingPublicKey.y];
  }
  getAuthWitnessProvider(_address: CompleteAddress) {
      return new SchnorrAuthWitnessProvider(this.signingPrivateKey);
  }
}
/** Creates auth witnesses using Schnorr signatures. */
class SchnorrAuthWitnessProvider {
  private signingPrivateKey: GrumpkinScalar;
  constructor(signingPrivateKey: GrumpkinScalar) {
      this.signingPrivateKey = signingPrivateKey;
  }
  createAuthWit(messageHash: Fr) {
      const schnorr = new Schnorr();
      const signature = schnorr.constructSignature(messageHash.toBuffer(), this.signingPrivateKey).toBuffer();
      return Promise.resolve(new AuthWitness(messageHash, [...signature]));
  }
}

const setupSandbox = async () => {
  const { PXE_URL = "http://localhost:8080" } = process.env;
  const pxe = createPXEClient(PXE_URL);
  await waitForPXE(pxe);
  return pxe;
};

const createSchnorrAccount = async (pxe: PXE) => {
  const secret = Fr.random();
  console.log("secret", secret);
  const signingPrivateKey = GrumpkinScalar.random();
  console.log("signingPrivateKey", signingPrivateKey);
  const wallet = getSchnorrAccount(pxe, secret, signingPrivateKey).waitSetup();
  console.log("wallet", wallet);
  return wallet;
};  

const generatePublicKeys = async () => {
  const signingPrivateKey = GrumpkinScalar.random();
  const schnorr = new Schnorr();
  const publicKey = schnorr.computePublicKey(signingPrivateKey);
  console.log("publicKey", publicKey.toString());

  const [x, y] = publicKey.toFields();
  console.log("x", x);
  console.log("y", y);
  return {signingPrivateKey,x, y};
}

describe("Voting", () => {
  let pxe: PXE;
  let wallets: AccountWallet[] = [];
  let accounts: CompleteAddress[] = [];
  let logger: DebugLogger;
  let addresses: string[] = [];
  let signingPrivateKey: GrumpkinScalar;
  let x: any;
  let y: any;
  beforeAll(async () => {
    logger = createDebugLogger("aztec:account-group");
    logger.info("Account-Group tests running.");

    pxe = await setupSandbox();

  });

  it("Deploys the contract", async () => {
    const salt = Fr.random();
    const secret = Fr.random();

    const  {signingPrivateKey,x, y} = await generatePublicKeys();


    const accountContract = new AccountGroupContract(signingPrivateKey);

    const deploymentArgs = [x, y];

    const accountManager = new AccountManager(pxe, secret, accountContract, salt);

    await accountManager.register();

    const deployOptions: DeployAccountOptions = {
      skipClassRegistration: true,
      skipPublicDeployment: false,
    };

    const deployTx = accountManager.deploy(deployOptions);

    const wallet = await deployTx.getWallet();

    console.log("Schnorr account deployed with address: ", wallet.getCompleteAddress());

    expect(wallet.getCompleteAddress()).toBeDefined();

})
});
