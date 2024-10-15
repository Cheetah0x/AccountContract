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
} from "@aztec/aztec.js";
import { type DeployAccountOptions } from "@aztec/aztec.js";
import {
  AccountGroupContractArtifact,
  AccountGroupContract,
} from "../artifacts/AccountGroup.js";
import { AccountGroupManager, AccountGroupContractClass } from "./types.js";
import {
  createSchnorrAccount,
  generatePublicKeys,
  setupSandbox1,
  setupSandbox2,
} from "./utils.js";
import { eventListener, delay, retryWithDelay } from "./utils.js";

// Test case to deploy the contract
describe("AccountGroup Contract Deployment", () => {
  let pxe1: PXE;
  let pxe2: PXE;
  let logger: DebugLogger;
  let admin: AztecAddress;
  let contractAddressPXE1: AztecAddress;
  let adminAccount: AccountWallet;
  let aliceAddress: AztecAddress;
  let accountPrivateKey: GrumpkinScalar;
  let contractAddressPXE2: AztecAddress;
  let salt: Fr;
  let secret: Fr;
  let contractAccountPXE1: Wallet;
  let contractAccountPXE2: Wallet;
  let contractInstancePXE1: AccountGroupContract;
  let contractInstancePXE2: AccountGroupContract;
  let partialAddress: Fr;
  let accountContractPXE1: AccountGroupContractClass;
  let aliceWallet: Wallet;

  beforeAll(async () => {
    logger = createDebugLogger("aztec:account-group");
    pxe1 = await setupSandbox1();
    pxe2 = await setupSandbox2();

    adminAccount = await createSchnorrAccount(pxe1);
    console.log("admin", adminAccount);
    admin = adminAccount.getAddress();
    console.log("adminAddress", admin);

    aliceWallet = await createSchnorrAccount(pxe2);
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
    accountContractPXE1 = new AccountGroupContractClass(
      signingPrivateKey,
      admin
    );

    // Initialize AccountGroupManager with the admin address
    const accountManagerPXE1 = new AccountGroupManager(
      pxe1,
      secret,
      accountContractPXE1,
      admin,
      salt
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

    await delay(2000);
  });

  it("Registers the AccountGroupContract in Alice's PXE", async () => {
    // Initialize Alice’s AccountGroupManager with admin’s contract details and same salt
    //this should just be registering the same contract again
    const aliceManagerPXE2 = new AccountGroupManager(
      pxe2,
      secret,
      accountContractPXE1,
      admin,
      salt
    );

    // Register contract wallet in Alice’s PXE
    await aliceManagerPXE2.register();
    const walletPXE2 = await aliceManagerPXE2.getWallet();
    contractAccountPXE2 = walletPXE2;
    contractAddressPXE2 = walletPXE2.getAddress();

    console.log(
      "alicePXEAccountContract",
      walletPXE2.getCompleteAddress().toString()
    );

    console.log(
      "Alice registered the contract with address:",
      walletPXE2.getCompleteAddress().toString()
    );
    expect(walletPXE2.getCompleteAddress().address.toString()).toBe(
      contractAddressPXE1.toString()
    );
    // expect(walletPXE2.getCompleteAddress().toString()).toBeDefined();
    const blockNumber = await pxe1.getBlockNumber();
    console.log("blockNumber", blockNumber);
    await delay(2000);
  });

  // it("Registers the AccountGroupContract in Alice's PXE", async () => {
  //   const secretKey = secret;
  //   const contractPXE2 = await pxe2.registerAccount(secretKey, partialAddress);

  //   const contractAccountPXE2 = contractPXE2;
  //   contractAddressPXE2 = contractAccountPXE2.address;
  //   expect(contractAddressPXE2).toBe(contractAddressPXE1);
  // });

  it("Fetches same notes", async () => {
    const notesPXE1 = await eventListener(pxe1, "pxe1", contractAddressPXE1);
    const notesPXE2 = await eventListener(pxe2, "pxe2", contractAddressPXE2);
    expect(notesPXE1).toEqual(notesPXE2);
  });

  // //this is for when the note gets sent to the admin
  // it("Gets admin address from storage", async () => {
  //   await eventListener(pxe1, "pxe1");
  //   const adminInstance = await AccountGroupContract.at(
  //     contractAddressPXE1,
  //     adminAccount
  //   );

  //   const getAdmin = await adminInstance.methods.get_admin().simulate();

  //   console.log("getAdmin", getAdmin.toString());

  //   expect(getAdmin.toString()).toBe(admin.toString());
  // });

  // gets the admin address from storage from perspective of the contract
  it("Gets the admin address from storage PXE1", async () => {
    await eventListener(pxe1, "pxe1", contractAddressPXE1);
    const blockNumber = await pxe1.getBlockNumber();
    console.log("blockNumber", blockNumber);
    contractInstancePXE1 = await AccountGroupContract.at(
      contractAddressPXE1,
      contractAccountPXE1
    );
    console.log("instance PXE1 created, fetching note");
    const getAdminPXE1 = await contractInstancePXE1.methods
      .get_admin()
      .simulate();
    console.log("getAdminPXE1", getAdminPXE1.toString());
    expect(getAdminPXE1.toString()).toBe(admin.toString());
    const blockNumber2 = await pxe1.getBlockNumber();
    console.log("blockNumber2", blockNumber2);
    await delay(2000);
  });

  it("Sets up second pxe", async () => {
    expect(aliceAddress).toBeDefined();
  });

  it("it sets balance and makes payment between two accounts PXE1", async () => {
    await eventListener(pxe1, "pxe1", contractAddressPXE1);

    const set_balance = await contractInstancePXE1.methods
      .set_balance(admin, aliceAddress, 100)
      .send()
      .wait();
    console.log("set_balance", set_balance);

    await delay(2000);

    const balance = await contractInstancePXE1.methods
      .get_balance(admin, aliceAddress)
      .simulate();
    console.log("balance", balance);
    expect(balance).toBe(100n);

    const blockNumber = await pxe1.getBlockNumber();
    console.log("blockNumber", blockNumber);

    const payment = await retryWithDelay(async () => {
      const result = await contractInstancePXE1.methods
        .make_payment(aliceAddress, admin, 10)
        .send()
        .wait();
      return result;
    });
    console.log("payment", payment);

    const blockNumber2 = await pxe1.getBlockNumber();
    console.log("blockNumber2", blockNumber2);
  });

  it("Fetches same notes 2", async () => {
    const notesPXE1 = await eventListener(pxe1, "pxe1", contractAddressPXE1);
    const notesPXE2 = await eventListener(pxe2, "pxe2", contractAddressPXE2);
    expect(notesPXE1).toEqual(notesPXE2);
  });

  it("fetches the balance between two accounts PXE1", async () => {
    let balance;
    balance = await retryWithDelay(async () => {
      const result = await contractInstancePXE1.methods
        .get_balance(admin, aliceAddress)
        .simulate();
      return result;
    });

    expect(balance).toBe(90n);
  });

  it("it sets balance between two accounts PXE2", async () => {
    await eventListener(pxe2, "pxe2", contractAddressPXE2);

    console.log("note PXE2 before set balance");
    contractInstancePXE2 = await AccountGroupContract.at(
      contractAddressPXE2,
      contractAccountPXE2
    );

    console.log("note PXE2 before set balance");

    // Retry the set_balance call with retryWithDelay
    await retryWithDelay(async () => {
      await contractInstancePXE2.methods
        .set_balance(admin, aliceAddress, 30)
        .send()
        .wait();
    });

    const blockNumber = await pxe2.getBlockNumber();
    console.log("blockNumber", blockNumber);
    await delay(2000);

    const balance = await contractInstancePXE2.methods
      .get_balance(admin, aliceAddress)
      .simulate();
    console.log("balance", balance);
    expect(balance).toBe(120n);
  });

  it("Gets the admin address from storage PXE2", async () => {
    await eventListener(pxe2, "pxe2", contractAddressPXE2);
    console.log("note PXE2 before get admin");

    const blockNumberPXE2 = await pxe2.getBlockNumber();
    console.log("blockNumberPXE2", blockNumberPXE2);

    contractInstancePXE2 = await AccountGroupContract.at(
      contractAddressPXE2,
      contractAccountPXE2
    );

    // Retry with extended delay for get_admin
    const getAdminPXE2 = await retryWithDelay(async () => {
      console.log("Attempting get_admin on PXE2...");
      return await contractInstancePXE2.methods.get_admin().simulate();
    });

    console.log("getAdminPXE2", getAdminPXE2.toString());
    expect(getAdminPXE2.toString()).toBe(admin.toString());

    const blockNumberPXE22 = await pxe2.getBlockNumber();
    console.log("blockNumberPXE2", blockNumberPXE22);
    await delay(2000);
  });
});
