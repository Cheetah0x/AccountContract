import {
  AccountWallet,
  createDebugLogger,
  Fr,
  PXE,
  DebugLogger,
  AztecAddress,
  GrumpkinScalar,
  Wallet,
  PartialAddress,
  Contract,
} from "@aztec/aztec.js";
import { type DeployAccountOptions } from "@aztec/aztec.js";
import {
  AccountGroupContractArtifact,
  AccountGroupContract,
} from "../artifacts/AccountGroup.js";
import { AccountGroupManager, AccountGroupContractClass } from "./testtypes.js";
import {
  createSchnorrAccount,
  generatePublicKeys,
  setupSandbox,
} from "./utils.js";
import { eventListener, delay, retryWithDelay } from "./utils.js";

const { PXE_URL1 = "http://localhost:8080" } = process.env;
const { PXE_URL2 = "http://localhost:8081" } = process.env;
const { PXE_URL3 = "http://localhost:8082" } = process.env;

// Test case to deploy the contract
describe("AccountGroup Contract Deployment", () => {
  let pxe1: PXE;
  let pxe2: PXE;
  let pxe3: PXE;
  let logger: DebugLogger;
  let contractAddressPXE1: AztecAddress;
  let adminAccount: AccountWallet;
  let aliceWallet: Wallet;
  let bobWallet: Wallet;
  let charlieWallet: Wallet;
  let admin: AztecAddress;
  let aliceAddress: AztecAddress;
  let bobAddress: AztecAddress;
  let charlieAddress: AztecAddress;
  let accountPrivateKey: GrumpkinScalar;
  let contractAddressPXE2: AztecAddress;
  let contractAddressPXE3: AztecAddress;
  let salt: Fr;
  let secret: Fr;
  let contractAccountPXE1: Wallet;
  let contractAccountPXE2: Wallet;
  let contractAccountPXE3: Wallet;
  let contractInstancePXE1: AccountGroupContract;
  let contractInstancePXE2: AccountGroupContract;
  let contractInstancePXE3: AccountGroupContract;
  let partialAddress: Fr;
  let accountContractPXE1: AccountGroupContractClass;

  beforeAll(async () => {
    logger = createDebugLogger("aztec:account-group");
    pxe1 = await setupSandbox(PXE_URL1);
    pxe2 = await setupSandbox(PXE_URL2);
    pxe3 = await setupSandbox(PXE_URL3);

    adminAccount = await createSchnorrAccount(pxe1);
    console.log("admin", adminAccount);
    admin = adminAccount.getAddress();
    console.log("adminAddress", admin);

    charlieWallet = await createSchnorrAccount(pxe1);
    charlieAddress = charlieWallet.getAddress();
    console.log("charlieAddress", charlieAddress);

    aliceWallet = await createSchnorrAccount(pxe2);
    aliceAddress = aliceWallet.getAddress();
    console.log("aliceAddress", aliceAddress);

    bobWallet = await createSchnorrAccount(pxe3);
    bobAddress = bobWallet.getAddress();
    console.log("bobAddress", bobAddress);
  });

  it("Deploys the AccountGroupContract", async () => {
    //in the future may need to get rid of the salt, otherwise others will need to know it
    salt = Fr.random();
    secret = Fr.random();
    // Generate keys for the contract
    const { signingPrivateKey, x, y } = await generatePublicKeys();
    accountPrivateKey = signingPrivateKey;

    // Create AccountGroupContract with the signing private key
    accountContractPXE1 = new AccountGroupContractClass(
      signingPrivateKey,
      admin
    );

    // Initialize AccountGroupManager with the admin address
    const accountManagerPXE1 = new AccountGroupManager(
      pxe1,
      secret,
      accountContractPXE1,
      admin
    );

    await accountManagerPXE1.register();

    // Deployment options
    const deployOptions: DeployAccountOptions = {
      skipClassRegistration: false,
      skipPublicDeployment: false,
    };

    const deployTx = accountManagerPXE1.deploy(deployOptions);
    const walletPXE1 = await deployTx.getWallet();
    contractAccountPXE1 = walletPXE1;
    contractAddressPXE1 = walletPXE1.getAddress();

    partialAddress = walletPXE1.getCompleteAddress().partialAddress;
    console.log("partialAddress", partialAddress.toString());

    console.log(
      "Account Group Contract deployed with address:",
      walletPXE1.getCompleteAddress()
    );
    expect(walletPXE1.getCompleteAddress()).toBeDefined();
    delay(2000);
  });

  it("Adds a member to the group PXE1", async () => {
    await eventListener(pxe1, "pxe1", contractAddressPXE1);
    delay(2000);
    contractInstancePXE1 = await AccountGroupContract.at(
      contractAddressPXE1,
      contractAccountPXE1
    );
    const addMemberPXE1 = await contractInstancePXE1.methods
      .add_member(admin)
      .send()
      .wait();
    console.log("addMemberPXE1", addMemberPXE1);

    const viewMember1PXE1 = await contractInstancePXE1.methods
      .view_member(1)
      .simulate();
    console.log("viewMember1PXE1", viewMember1PXE1);
    expect(viewMember1PXE1.toString()).toBe(admin.toString());
  });

  it("Gets the admin note for alice", async () => {
    const filter = {
      owner: aliceAddress,
    };
    const aliceNotes = await pxe2.getIncomingNotes(filter);
    console.log("aliceNotes", aliceNotes);
    console.log("note contents 0", aliceNotes[0].note.items);
    console.log("note contents 1", aliceNotes[1].note.items);
    console.log("note contents 2", aliceNotes[2].note.items);
  });
});
