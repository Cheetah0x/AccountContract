import {
  AccountWallet,
  createDebugLogger,
  Fr,
  PXE,
  DebugLogger,
  AztecAddress,
  GrumpkinScalar,
} from "@aztec/aztec.js";
import { type DeployAccountOptions } from '@aztec/aztec.js';
import { AccountGroupContractArtifact, AccountGroupContract} from "../artifacts/AccountGroup.js";
import { AccountGroupManager, AccountGroupContractClass } from "./types.js";
import { createSchnorrAccount, generatePublicKeys, setupSandbox1, setupSandbox2 } from "./utils.js";


// Test case to deploy the contract
describe("AccountGroup Contract Deployment", () => {
  let pxe1: PXE;
  let pxe2: PXE;
  let logger: DebugLogger;
  let admin: AztecAddress;
  let contractAddress: AztecAddress;
  let adminAccount: AccountWallet;
  let aliceAddress: AztecAddress;
  let accountPrivateKey: GrumpkinScalar;
  let salt: Fr;
  let secret: Fr;

  beforeAll(async () => {
    logger = createDebugLogger("aztec:account-group");
    pxe1 = await setupSandbox1();
    pxe2 = await setupSandbox2();

    adminAccount = await createSchnorrAccount(pxe1);
    console.log("admin", adminAccount);
    admin = adminAccount.getAddress();
    console.log("adminAddress", admin);

    const aliceWallet = await createSchnorrAccount(pxe2);
    aliceAddress = aliceWallet.getAddress();
    console.log("aliceAddress", aliceAddress);
    
  });

  it("Deploys the AccountGroupContract", async () => {
    //in the future may need to get rid of the salt, otherwise others will need to know it
    salt = Fr.random();
    secret = Fr.random();
    // Generate keys for the contract
    const { signingPrivateKey, x, y } = await generatePublicKeys();
    accountPrivateKey = signingPrivateKey;

    // Create AccountGroupContract with the signing private key
    const accountContract = new AccountGroupContractClass(signingPrivateKey, admin);


    // Initialize AccountGroupManager with the admin address
    const accountManager = new AccountGroupManager(pxe1, secret, accountContract, admin, salt);

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

  it("Registers the AccountGroupContract in Alice's PXE", async () => {

    // Reuse the account contract details in PXE2 with admin’s signing key and contract address
    const accountContract = new AccountGroupContractClass(accountPrivateKey, admin);

    // Initialize Alice’s AccountGroupManager with admin’s contract details and same salt
    const aliceManager = new AccountGroupManager(pxe2, secret, accountContract, admin, salt);

    // Register contract address in Alice’s PXE
    await aliceManager.register();
    const alicePXEAccountContract = await aliceManager.getWallet();

    console.log("alicePXEAccountContract", alicePXEAccountContract.getCompleteAddress().toString());

    console.log("Alice registered the contract with address:", alicePXEAccountContract.getCompleteAddress().toString());
    expect(alicePXEAccountContract.getCompleteAddress().address.toString()).toBe(contractAddress.toString());
  });

  

  it("Gets address from storage", async () => {

    const adminInstance = await AccountGroupContract.at(contractAddress, adminAccount)

    const getAdmin = await adminInstance.methods.get_admin().simulate();

    console.log("getAdmin", getAdmin.toString());

    expect(getAdmin.toString()).toBe(admin.toString());
  });

  // it("Alice can read the admin from the group contract", async () => {
  //   const aliceInstance = await AccountGroupContract.at(contractAddress, adminAccount)

  //   const getAdmin = await aliceInstance.methods.get_admin().simulate();

  //   console.log("getAdmin", getAdmin.toString());

  //   expect(getAdmin.toString()).toBe(admin.toString());
  // })

  it("Sets up second pxe", async () => {
    expect(aliceAddress).toBeDefined();
  })
});


