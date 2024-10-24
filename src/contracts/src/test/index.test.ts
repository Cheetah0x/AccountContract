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
  //PXE instances
  let pxe1: PXE;
  let pxe2: PXE;
  let pxe3: PXE;

  //Logger
  let logger: DebugLogger;

  //Wallets
  let adminAccount: AccountWallet;
  let aliceWallet: Wallet;
  let bobWallet: Wallet;
  let charlieWallet: Wallet;

  //Addresses
  let contractAddressPXE1: AztecAddress;
  let admin: AztecAddress;
  let aliceAddress: AztecAddress;
  let bobAddress: AztecAddress;
  let charlieAddress: AztecAddress;

  //Keys
  let accountPrivateKey: GrumpkinScalar;
  let contractAddressPXE2: AztecAddress;
  let contractAddressPXE3: AztecAddress;
  let salt: Fr;
  let secret: Fr;

  //Contract instances and Wallets
  let contractAccountPXE1: Wallet;
  let contractAccountPXE2: Wallet;
  let contractAccountPXE3: Wallet;
  let contractInstancePXE1: AccountGroupContract;
  let contractInstancePXE2: AccountGroupContract;
  let contractInstancePXE3: AccountGroupContract;

  let partialAddress: Fr;

  //Contract Class
  let accountContractPXE1: AccountGroupContractClass;

  //-----------------------------------Setup-----------------------------------

  beforeAll(async () => {
    //Initialiing the Logger
    logger = createDebugLogger("aztec:account-group");

    //Setting up the PXE instances
    pxe1 = await setupSandbox(PXE_URL1);
    pxe2 = await setupSandbox(PXE_URL2);
    pxe3 = await setupSandbox(PXE_URL3);

    //Creating the admin account on PXE1
    adminAccount = await createSchnorrAccount(pxe1);
    admin = adminAccount.getAddress();

    //Creating Alice's account on PXE2
    aliceWallet = await createSchnorrAccount(pxe2);
    aliceAddress = aliceWallet.getAddress();

    //Creating Bob's account on PXE3
    bobWallet = await createSchnorrAccount(pxe3);
    bobAddress = bobWallet.getAddress();

    //Creating Charlie's account on PXE1, (not added to the group)
    charlieWallet = await createSchnorrAccount(pxe1);
    charlieAddress = charlieWallet.getAddress();
  });

  //-----------------------------------Registering accounts on PXEs -----------------------------------

  it("Deploys the AccountGroupContract", async () => {
    //Generate random salt and secret for account deploymnet
    salt = Fr.random();
    secret = Fr.random();

    //Generate public and private keys for the account contract
    const { signingPrivateKey, x, y } = await generatePublicKeys();
    accountPrivateKey = signingPrivateKey;

    //Create an instance of the AccountGroupContractClass with the signing private key and admin address
    accountContractPXE1 = new AccountGroupContractClass(
      signingPrivateKey,
      admin
    );

    // Initialize AccountGroupManager with the contract.
    // The admin is there as a way to distriguish the different group instances.
    const accountManagerPXE1 = new AccountGroupManager(
      pxe1,
      secret,
      accountContractPXE1,
      admin,
      salt
    );

    //Register the account contract in PXE1
    await accountManagerPXE1.register();

    // Deployment options for the account
    const deployOptions: DeployAccountOptions = {
      skipClassRegistration: false,
      skipPublicDeployment: false,
    };

    //Deploy the account and get the wallet instance
    const deployTx = accountManagerPXE1.deploy(deployOptions);
    const walletPXE1 = await deployTx.getWallet();
    contractAccountPXE1 = walletPXE1;
    contractAddressPXE1 = walletPXE1.getAddress();

    //this is not used, just a check
    partialAddress = walletPXE1.getCompleteAddress().partialAddress;
    console.log("partialAddress", partialAddress.toString());

    expect(walletPXE1.getCompleteAddress()).toBeDefined();

    //Delay to ensure sychronization
    await delay(2000);
  });

  it("Registers the AccountGroupContract in Alice's PXE", async () => {
    //This initializes the Account Contract in the Second PXE instance, using the same secret and salt
    //These are the two secrets that need to be known to register the contract in a new PXE instance
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

    //Ensure the contract addresses match across the PXE instances
    expect(walletPXE2.getCompleteAddress().address.toString()).toBe(
      contractAddressPXE1.toString()
    );
    expect(walletPXE2.getCompleteAddress().toString()).toBeDefined();

    //Getting the block number for tracking purposes
    const blockNumber = await pxe1.getBlockNumber();
    console.log("blockNumber", blockNumber);
    await delay(2000);
  });

  it("Registers the AccountGroupContract in Bob's PXE", async () => {
    //Initialize the Account Contract for Bob in PXE3
    const bobManagerPXE3 = new AccountGroupManager(
      pxe3,
      secret,
      accountContractPXE1,
      admin,
      salt
    );

    //Register the contract wallet in Bob's PXE
    await bobManagerPXE3.register();
    const walletPXE3 = await bobManagerPXE3.getWallet();
    contractAccountPXE3 = walletPXE3;
    contractAddressPXE3 = walletPXE3.getAddress();

    //Ensure the contract addresses match across the PXE instances
    expect(walletPXE3.getCompleteAddress().address.toString()).toBe(
      contractAddressPXE1.toString()
    );
  });

  //-----------------------------------Fetching notes from PXEs -----------------------------------

  it("Fetches same notes in all PXEs", async () => {
    //Listening to events to ensure synchronization
    const notesPXE1 = await eventListener(pxe1, "pxe1", contractAddressPXE1);
    const notesPXE2 = await eventListener(pxe2, "pxe2", contractAddressPXE2);
    const notesPXE3 = await eventListener(pxe3, "pxe3", contractAddressPXE3);

    //Expect the notes are the same across all PXEs
    expect(notesPXE1).toEqual(notesPXE2);
    expect(notesPXE1).toEqual(notesPXE3);
  });

  //-----------------------------------Getting the admin address from storage -----------------------------------

  it("Gets the admin address from storage PXE1", async () => {
    //Wait for syncronization
    await eventListener(pxe1, "pxe1", contractAddressPXE1);
    const blockNumber = await pxe1.getBlockNumber();
    console.log("blockNumber", blockNumber);

    //Create an instance of the contract in PXE1
    //Using the account contracts associated wallet to call methods on the contract
    contractInstancePXE1 = await AccountGroupContract.at(
      contractAddressPXE1,
      contractAccountPXE1
    );

    //Get the admin address from the contract storage
    const getAdminPXE1 = await contractInstancePXE1.methods
      .get_admin()
      .simulate();

    expect(getAdminPXE1.toString()).toBe(admin.toString());

    const blockNumber2 = await pxe1.getBlockNumber();
    console.log("blockNumber2", blockNumber2);
    await delay(2000);
  });

  it("Gets the admin address from storage PXE2", async () => {
    await eventListener(pxe2, "pxe2", contractAddressPXE2);

    const blockNumberPXE2 = await pxe2.getBlockNumber();
    console.log("blockNumberPXE2", blockNumberPXE2);

    //Create an instance of the contract in PXE2
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
  });

  it("Gets the admin address from storage PXE3", async () => {
    await eventListener(pxe3, "pxe3", contractAddressPXE3);

    const blockNumberPXE3 = await pxe3.getBlockNumber();
    console.log("blockNumberPXE3", blockNumberPXE3);

    contractInstancePXE3 = await AccountGroupContract.at(
      contractAddressPXE3,
      contractAccountPXE3
    );

    const getAdminPXE3 = await contractInstancePXE3.methods
      .get_admin()
      .simulate();

    expect(getAdminPXE3.toString()).toBe(admin.toString());
  });

  //-----------------------------------Adding a member to the group -----------------------------------
  it("Views admin as group member PXE1", async () => {
    //View the first member of the group (should be the admin)
    const viewMember1PXE1 = await contractInstancePXE1.methods
      .view_member(0)
      .simulate();

    expect(viewMember1PXE1.toString()).toBe(admin.toString());
  });

  it("Adds a member to the group PXE1", async () => {
    //Listening to events to ensure synchronization
    await eventListener(pxe1, "pxe1", contractAddressPXE1);

    //Add Alice to the group
    const addMemberPXE1 = await contractInstancePXE1.methods
      .add_member(aliceAddress)
      .send()
      .wait();
    console.log("addMemberPXE1", addMemberPXE1);

    //View the second member of the group (should be Alice)
    const viewMember1PXE1 = await contractInstancePXE1.methods
      .view_member(1)
      .simulate();
    expect(viewMember1PXE1.toString()).toBe(aliceAddress.toString());
  });

  it("Adds a member to the group PXE2", async () => {
    //Add Bob to the group
    await contractInstancePXE2.methods.add_member(bobAddress).send().wait();

    const viewMember1PXE2 = await contractInstancePXE2.methods
      .view_member(2)
      .simulate();
    console.log("viewMember1PXE2", viewMember1PXE2);
    expect(viewMember1PXE2.toString()).toBe(bobAddress.toString());
  });

  //-----------------------------------Setting the balance and making a payment -----------------------------------

  it("it sets balance and makes payment between two accounts PXE1", async () => {
    await eventListener(pxe1, "pxe1", contractAddressPXE1);

    //Set the balance between the admin and Alice
    const set_balance = await contractInstancePXE1.methods
      .set_balance(admin, aliceAddress, 100)
      .send()
      .wait();

    await delay(2000);

    const balance = await contractInstancePXE1.methods
      .get_balance(admin, aliceAddress)
      .simulate();

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
    const notesPXE3 = await eventListener(pxe3, "pxe3", contractAddressPXE3);
    expect(notesPXE1).toEqual(notesPXE2);
    expect(notesPXE1).toEqual(notesPXE3);
  });

  it("should fail setting balance with admin and charlie", async () => {
    //Expect an error when trying to set the balance with the admin and Charlie
    //Charlie is not a member of the group
    await expect(
      contractInstancePXE1.methods
        .set_balance(admin, charlieAddress, 100)
        .send()
        .wait()
    ).rejects.toThrow("Debtor is not in the group");
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

  it("it sets balance between two accounts PXE3", async () => {
    await eventListener(pxe3, "pxe3", contractAddressPXE3);
    console.log("note PXE3 before set balance");

    await retryWithDelay(async () => {
      await contractInstancePXE3.methods
        .set_balance(admin, aliceAddress, 50)
        .send()
        .wait();
    });

    const blockNumber = await pxe3.getBlockNumber();
    console.log("blockNumber", blockNumber);
    await delay(2000);

    const balance = await contractInstancePXE3.methods
      .get_balance(admin, aliceAddress)
      .simulate();
    console.log("balance", balance);
    expect(balance).toBe(170n);
  });

  it("Makes payment in PXE2", async () => {
    await eventListener(pxe2, "pxe2", contractAddressPXE2);

    const payment = await retryWithDelay(async () => {
      const result = await contractInstancePXE2.methods
        .make_payment(aliceAddress, admin, 10)
        .send()
        .wait();
      return result;
    });
    console.log("payment", payment);

    const balance = await contractInstancePXE2.methods
      .get_balance(admin, aliceAddress)
      .simulate();
    console.log("balance", balance);
    expect(balance).toBe(160n);
  });

  it("Makes payment in PXE3", async () => {
    await eventListener(pxe3, "pxe3", contractAddressPXE3);

    const payment = await retryWithDelay(async () => {
      const result = await contractInstancePXE3.methods
        .make_payment(aliceAddress, admin, 50)
        .send()
        .wait();
      return result;
    });
    console.log("payment", payment);

    const balance = await contractInstancePXE3.methods
      .get_balance(admin, aliceAddress)
      .simulate();
    console.log("balance", balance);
    expect(balance).toBe(110n);
  });

  //---------------Payments between Alice and Bob ---------------//

  it("Makes balance between Alice and Bob PXE1", async () => {
    const set_balance = await contractInstancePXE1.methods
      .set_balance(aliceAddress, bobAddress, 100)
      .send()
      .wait();
    console.log("set_balance", set_balance);

    const balance = await contractInstancePXE1.methods
      .get_balance(aliceAddress, bobAddress)
      .simulate();
    console.log("balance", balance);
    expect(balance).toBe(100n);
  });

  it("Makes balance between Alice and Bob PXE2", async () => {
    const set_balance = await contractInstancePXE2.methods
      .set_balance(aliceAddress, bobAddress, 100)
      .send()
      .wait();
    console.log("set_balance", set_balance);

    const balance = await contractInstancePXE2.methods
      .get_balance(aliceAddress, bobAddress)
      .simulate();
    console.log("balance", balance);
    expect(balance).toBe(200n);
  });

  it("Makes balance between Alice and Bob PXE3", async () => {
    const set_balance = await contractInstancePXE3.methods
      .set_balance(aliceAddress, bobAddress, 100)
      .send()
      .wait();
    console.log("set_balance", set_balance);

    const balance = await contractInstancePXE3.methods
      .get_balance(aliceAddress, bobAddress)
      .simulate();
    console.log("balance", balance);
    expect(balance).toBe(300n);
  });

  it("Makes payment between Alice and Bob PXE1", async () => {
    const payment = await retryWithDelay(async () => {
      const result = await contractInstancePXE1.methods
        .make_payment(bobAddress, aliceAddress, 75)
        .send()
        .wait();
      return result;
    });
    const balance = await contractInstancePXE1.methods
      .get_balance(aliceAddress, bobAddress)
      .simulate();
    console.log("balance", balance);
    expect(balance).toBe(225n);
  });

  it("Makes payment between Alice and Bob PXE3", async () => {
    const payment = await retryWithDelay(async () => {
      const result = await contractInstancePXE3.methods
        .make_payment(bobAddress, aliceAddress, 75)
        .send()
        .wait();
      return result;
    });
    console.log("payment", payment);

    const balance = await contractInstancePXE3.methods
      .get_balance(aliceAddress, bobAddress)
      .simulate();
    console.log("balance", balance);
    expect(balance).toBe(150n);
  });

  //-----------------------------------Setting up group payments -----------------------------------

  it("Sets up group payments PXE1", async () => {
    const current_balance_alice_admin = await contractInstancePXE1.methods
      .get_balance(admin, aliceAddress)
      .simulate();
    console.log("current_balance_alice_admin", current_balance_alice_admin);

    const current_balance_bob_admin = await contractInstancePXE1.methods
      .get_balance(admin, bobAddress)
      .simulate();
    console.log("current_balance_bob_admin", current_balance_bob_admin);

    const set_up_group_payments = await contractInstancePXE1.methods
      .setup_group_payments(admin, [aliceAddress, bobAddress], 150)
      .send()
      .wait();
    console.log("set_up_group_payments", set_up_group_payments);

    const balance_alice_admin = await contractInstancePXE1.methods
      .get_balance(admin, aliceAddress)
      .simulate();
    console.log("balance_alice_admin", balance_alice_admin);
    expect(balance_alice_admin).toBe(current_balance_alice_admin + 50n);

    const balance_bob_admin = await contractInstancePXE1.methods
      .get_balance(admin, bobAddress)
      .simulate();
    console.log("balance_bob_admin", balance_bob_admin);
    expect(balance_bob_admin).toBe(current_balance_bob_admin + 50n);
  });

  it("Sets up group payments PXE2", async () => {
    const current_balance_alice_admin = await contractInstancePXE2.methods
      .get_balance(admin, aliceAddress)
      .simulate();
    console.log("current_balance_alice_admin", current_balance_alice_admin);

    const current_balance_bob_admin = await contractInstancePXE2.methods
      .get_balance(admin, bobAddress)
      .simulate();
    console.log("current_balance_bob_admin", current_balance_bob_admin);

    const set_up_group_payments = await contractInstancePXE2.methods
      .setup_group_payments(admin, [aliceAddress, bobAddress], 150)
      .send()
      .wait();
    console.log("set_up_group_payments", set_up_group_payments);

    const balance_alice_admin = await contractInstancePXE2.methods
      .get_balance(admin, aliceAddress)
      .simulate();
    console.log("balance_alice_admin", balance_alice_admin);
    expect(balance_alice_admin).toBe(current_balance_alice_admin + 50n);

    const balance_bob_admin = await contractInstancePXE2.methods
      .get_balance(admin, bobAddress)
      .simulate();
    expect(balance_bob_admin).toBe(current_balance_bob_admin + 50n);
  });

  it("Sets up group payments PXE3", async () => {
    const current_balance_alice_admin = await contractInstancePXE3.methods
      .get_balance(admin, aliceAddress)
      .simulate();
    console.log("current_balance_alice_admin", current_balance_alice_admin);

    const current_balance_bob_admin = await contractInstancePXE3.methods
      .get_balance(admin, bobAddress)
      .simulate();
    console.log("current_balance_bob_admin", current_balance_bob_admin);

    const set_up_group_payments = await contractInstancePXE3.methods
      .setup_group_payments(admin, [aliceAddress, bobAddress], 150)
      .send()
      .wait();
    console.log("set_up_group_payments", set_up_group_payments);

    const balance_alice_admin = await contractInstancePXE3.methods
      .get_balance(admin, aliceAddress)
      .simulate();
    console.log("balance_alice_admin", balance_alice_admin);
    expect(balance_alice_admin).toBe(current_balance_alice_admin + 50n);

    const balance_bob_admin = await contractInstancePXE3.methods
      .get_balance(admin, bobAddress)
      .simulate();
    expect(balance_bob_admin).toBe(current_balance_bob_admin + 50n);
  });
});
