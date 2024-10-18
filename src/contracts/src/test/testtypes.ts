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
} from "@aztec/aztec.js";
import {
  AccountGroupContractArtifact,
  AccountGroupContract,
} from "../artifacts/AccountGroup.js";
import { DefaultAccountContract } from "@aztec/accounts/defaults";
import { Salt } from "@aztec/aztec.js/account";

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
