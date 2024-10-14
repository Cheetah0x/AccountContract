import {
  AccountWallet,
  CompleteAddress,
  createDebugLogger,
  Fr,
  PXE,
  waitForPXE,
  createPXEClient,
  DebugLogger,
  GrumpkinScalar,
  Schnorr,
  AccountManager,
  AuthWitness,
  ContractInstanceWithAddress,
  getContractInstanceFromDeployParams,
  AztecAddress,
} from "@aztec/aztec.js";
import { type DeployAccountOptions } from '@aztec/aztec.js';
import { DefaultAccountContract } from '@aztec/accounts/defaults';
import { ContractArtifact } from "@aztec/foundation/abi";
import { getSchnorrAccount } from "@aztec/accounts/schnorr";
import { Salt } from "@aztec/aztec.js/account";
import { AccountContract } from "@aztec/aztec.js/account";
import { AccountGroupContractArtifact, AccountGroupContract} from "../artifacts/AccountGroup.js";

// Extend the account contract to use necessary configurations
class AccountGroupContractClass extends DefaultAccountContract {
  private signingPrivateKey: GrumpkinScalar;
  private adminAddress: AztecAddress;

  constructor(signingPrivateKey: GrumpkinScalar, adminAddress: AztecAddress) {
    super(AccountGroupContractArtifact);
    this.signingPrivateKey = signingPrivateKey;
    this.adminAddress = adminAddress;
  }

  getDeploymentArgs() {
    const signingPublicKey = new Schnorr().computePublicKey(this.signingPrivateKey);
    return [signingPublicKey.x, signingPublicKey.y, this.adminAddress];
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

// Extend AccountManager to add an admin parameter and configure deployment
export class AccountGroupManager extends AccountManager {
  private admin: AztecAddress;

  constructor(
    pxe: PXE,
    secretKey: Fr,
    accountGroupContract: AccountGroupContractClass,
    admin: AztecAddress ,
    salt?: Salt
  ) {
    super(pxe, secretKey, accountGroupContract, salt);
    this.admin = admin;
  }
}

// Setup PXE and other utilities for deployment
const setupSandbox = async () => {
  const { PXE_URL = "http://localhost:8080" } = process.env;
  const pxe = createPXEClient(PXE_URL);
  await waitForPXE(pxe);
  return pxe;
};

// Generate keys and Schnorr account for testing
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

  const [x, y] = publicKey.toFields();
  return { signingPrivateKey, x, y };
};

// Test case to deploy the contract
describe("AccountGroup Contract Deployment", () => {
  let pxe: PXE;
  let logger: DebugLogger;
  let admin: AztecAddress;
  let contractAddress: AztecAddress;
  let adminAccount: AccountWallet;

  beforeAll(async () => {
    logger = createDebugLogger("aztec:account-group");
    pxe = await setupSandbox();

    adminAccount = await createSchnorrAccount(pxe);
    console.log("admin", adminAccount);

    admin = adminAccount.getAddress();
    console.log("adminAddress", admin);
  });

  it("Deploys the AccountGroupContract", async () => {
    const salt = Fr.random();
    const secret = Fr.random();

   

    // Generate keys for the contract
    const { signingPrivateKey, x, y } = await generatePublicKeys();

    // Create AccountGroupContract with the signing private key
    const accountContract = new AccountGroupContractClass(signingPrivateKey, admin);


    // Initialize AccountGroupManager with the admin address
    const accountManager = new AccountGroupManager(pxe, secret, accountContract, admin, salt);

    await accountManager.register();

    // Deployment options
    const deployOptions: DeployAccountOptions = {
      skipClassRegistration: false,
      skipPublicDeployment: false,
    };

    const deployTx = accountManager.deploy(deployOptions);
    const wallet = await deployTx.getWallet();

    contractAddress = wallet.getAddress();

    console.log("Account Group Contract deployed with address:", wallet.getCompleteAddress());
    expect(wallet.getCompleteAddress()).toBeDefined();

    
  });

  it("Gets address from storage", async () => {

    const adminInstance = await AccountGroupContract.at(contractAddress, adminAccount)

    const getAdmin = await adminInstance.methods.get_admin().simulate();

    console.log("getAdmin", getAdmin.toString());

    expect(getAdmin.toString()).toBe(admin.toString());

  });
});
