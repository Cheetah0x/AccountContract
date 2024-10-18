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

// Extend the account contract to use necessary configurations
export class AccountGroupContractClass extends DefaultAccountContract {
  private signingPrivateKey: GrumpkinScalar;
  private adminAddress: AztecAddress;

  constructor(signingPrivateKey: GrumpkinScalar, adminAddress: AztecAddress) {
    super(AccountGroupContractArtifact);
    this.signingPrivateKey = signingPrivateKey;
    this.adminAddress = adminAddress;
  }

  getDeploymentArgs() {
    const signingPublicKey = new Schnorr().computePublicKey(
      this.signingPrivateKey
    );
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
    const signature = schnorr
      .constructSignature(messageHash.toBuffer(), this.signingPrivateKey)
      .toBuffer();
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
    admin: AztecAddress,
    salt?: Salt
  ) {
    super(pxe, secretKey, accountGroupContract, salt);
    this.admin = admin;
  }
}
