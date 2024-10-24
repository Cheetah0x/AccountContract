import {
  AccountManager,
  AuthWitness,
  AztecAddress,
  CompleteAddress,
  ContractArtifact,
  Fr,
  GrumpkinScalar,
  PXE,
  Schnorr,
  AccountWalletWithSecretKey,
  Contract,
} from "@aztec/aztec.js";
import { Salt } from "@aztec/aztec.js/account";
import {
  AccountGroupContractArtifact,
  AccountGroupContract,
} from "@/contracts/src/artifacts/AccountGroup";
import { DefaultAccountContract } from "@aztec/accounts/defaults";

export interface Expense {
  id: number;
  description: string;
  amount: number;
  paidBy: string;
  to?: string;
  type: "expense" | "payment" | "balance_set";
}

export interface NewExpense {
  description: string;
  paidBy: string;
  amount: number;
}

export interface Group {
  name: string;
  members: string[];
}

export interface WalletDetails {
  wallet: AccountWalletWithSecretKey;
}

export interface MemberWallets {
  [memberName: string]: WalletDetails;
}

export interface MemberContracts {
  [memberName: string]: { walletInstance: Contract };
}

export interface Balances {
  [member: string]: {
    [otherMember: string]: number;
  };
}

export interface PXEWithUrl {
  pxe: PXE;
  url: string;
}

/**
 * A class extending the DefaultAccountContract to create a contract that supports group
 * functionality. The contract includes a signing private key and an admin address.
 * The admin address is there to have a way to identify the group.
 */
export class AccountGroupContractClass extends DefaultAccountContract {
  private signingPrivateKey: GrumpkinScalar;
  private adminAddress: AztecAddress;

  /**
   * Constructs a new instance of the AccountGroupContractClass.
   * @param signingPrivateKey - The Grumpkin scalar private key used for signing.
   * @param adminAddress - The AztecAddress of the contract administrator.
   */
  constructor(signingPrivateKey: GrumpkinScalar, adminAddress: AztecAddress) {
    super(AccountGroupContractArtifact); // Use the AccountGroup contract artifact.
    this.signingPrivateKey = signingPrivateKey;
    this.adminAddress = adminAddress;
  }

  /**
   * Returns the deployment arguments for the contract.
   * This includes the Schnorr signature public key (x, y) and the admin address.
   * @returns {Array} An array containing the public key components and admin address.
   */
  getDeploymentArgs() {
    const signingPublicKey = new Schnorr().computePublicKey(
      this.signingPrivateKey
    );
    return [signingPublicKey.x, signingPublicKey.y, this.adminAddress];
  }

  /**
   * Provides an authentication witness provider for a given address.
   * @param _address - The complete address (not used in this case).
   * @returns {SchnorrAuthWitnessProvider} An instance of the SchnorrAuthWitnessProvider class.
   */
  getAuthWitnessProvider(_address: CompleteAddress) {
    return new SchnorrAuthWitnessProvider(this.signingPrivateKey);
  }
}

/**
 * A class to create authentication witnesses using Schnorr signatures. This class provides
 * a way to sign messages with a private key, producing valid authentication witnesses.
 */
class SchnorrAuthWitnessProvider {
  private signingPrivateKey: GrumpkinScalar;

  /**
   * Constructs a new instance of the SchnorrAuthWitnessProvider.
   * @param signingPrivateKey - The private key used to create Schnorr signatures.
   */
  constructor(signingPrivateKey: GrumpkinScalar) {
    this.signingPrivateKey = signingPrivateKey;
  }

  /**
   * Creates an authentication witness by signing the given message hash using the Schnorr signature.
   * @param messageHash - The Fr object representing the hash of the message to be signed.
   * @returns {Promise<AuthWitness>} A promise that resolves with an AuthWitness object.
   */
  createAuthWit(messageHash: Fr) {
    const schnorr = new Schnorr();
    const signature = schnorr
      .constructSignature(messageHash.toBuffer(), this.signingPrivateKey)
      .toBuffer();
    return Promise.resolve(new AuthWitness(messageHash, [...signature]));
  }
}

/**
 * A class extending AccountManager to manage group accounts.
 * This manager adds an admin address to the account deployment process.
 */
export class AccountGroupManager extends AccountManager {
  private admin: AztecAddress;

  /**
   * Constructs a new instance of AccountGroupManager.
   * @param pxe - The PXE instance for managing contract execution.
   * @param secretKey - The Fr object representing the secret key of the account.
   * @param accountGroupContract - An instance of the AccountGroupContractClass used for account deployment.
   * @param admin - The admin AztecAddress for the group account.
   * @param salt - Optional salt value for the account (default is undefined).
   */
  constructor(
    pxe: PXE,
    secretKey: Fr,
    accountGroupContract: AccountGroupContractClass,
    admin: AztecAddress,
    salt?: Salt
  ) {
    super(pxe, secretKey, accountGroupContract, salt); // Call the parent class constructor.
    this.admin = admin;
  }
}
