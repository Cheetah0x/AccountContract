import { AccountManager, AuthWitness, AztecAddress, CompleteAddress, Fr, GrumpkinScalar, PXE } from "@aztec/aztec.js";
import { DefaultAccountContract } from "@aztec/accounts/defaults";
import { Salt } from "@aztec/aztec.js/account";
/**
 * A class extending the DefaultAccountContract to create a contract that supports group
 * functionality. The contract includes a signing private key and an owner address.
 * The owner address is there to have a way to identify the group.
 */
export declare class AccountGroupContractClass extends DefaultAccountContract {
    private signingPrivateKey;
    private ownerAddress;
    /**
     * Constructs a new instance of the AccountGroupContractClass.
     * @param signingPrivateKey - The Grumpkin scalar private key used for signing.
     * @param ownerAddress - The AztecAddress of the contract owner.
     */
    constructor(signingPrivateKey: GrumpkinScalar, ownerAddress: AztecAddress);
    /**
     * Returns the deployment arguments for the contract.
     * This includes the Schnorr signature public key (x, y) and the owner address.
     * @returns {Array} An array containing the public key components and owner address.
     */
    getDeploymentArgs(): Fr[];
    /**
     * Provides an authentication witness provider for a given address.
     * @param _address - The complete address (not used in this case).
     * @returns {SchnorrAuthWitnessProvider} An instance of the SchnorrAuthWitnessProvider class.
     */
    getAuthWitnessProvider(_address: CompleteAddress): SchnorrAuthWitnessProvider;
}
/**
 * A class to create authentication witnesses using Schnorr signatures. This class provides
 * a way to sign messages with a private key, producing valid authentication witnesses.
 */
declare class SchnorrAuthWitnessProvider {
    private signingPrivateKey;
    /**
     * Constructs a new instance of the SchnorrAuthWitnessProvider.
     * @param signingPrivateKey - The private key used to create Schnorr signatures.
     */
    constructor(signingPrivateKey: GrumpkinScalar);
    /**
     * Creates an authentication witness by signing the given message hash using the Schnorr signature.
     * @param messageHash - The Fr object representing the hash of the message to be signed.
     * @returns {Promise<AuthWitness>} A promise that resolves with an AuthWitness object.
     */
    createAuthWit(messageHash: Fr): Promise<AuthWitness>;
}
/**
 * A class extending AccountManager to manage group accounts.
 * This manager adds an owner address to the account deployment process.
 */
export declare class AccountGroupManager extends AccountManager {
    private owner;
    /**
     * Constructs a new instance of AccountGroupManager.
     * @param pxe - The PXE instance for managing contract execution.
     * @param secretKey - The Fr object representing the secret key of the account.
     * @param accountGroupContract - An instance of the AccountGroupContractClass used for account deployment.
     * @param owner - The owner AztecAddress for the group account.
     * @param salt - Optional salt value for the account (default is undefined).
     */
    constructor(pxe: PXE, secretKey: Fr, accountGroupContract: AccountGroupContractClass, owner: AztecAddress, salt?: Salt);
}
export {};
//# sourceMappingURL=testtypes.d.ts.map