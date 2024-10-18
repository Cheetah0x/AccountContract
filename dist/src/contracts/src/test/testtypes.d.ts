import { AccountManager, AuthWitness, AztecAddress, CompleteAddress, Fr, GrumpkinScalar, PXE } from "@aztec/aztec.js";
import { DefaultAccountContract } from "@aztec/accounts/defaults";
import { Salt } from "@aztec/aztec.js/account";
export declare class AccountGroupContractClass extends DefaultAccountContract {
    private signingPrivateKey;
    private adminAddress;
    constructor(signingPrivateKey: GrumpkinScalar, adminAddress: AztecAddress);
    getDeploymentArgs(): Fr[];
    getAuthWitnessProvider(_address: CompleteAddress): SchnorrAuthWitnessProvider;
}
/** Creates auth witnesses using Schnorr signatures. */
declare class SchnorrAuthWitnessProvider {
    private signingPrivateKey;
    constructor(signingPrivateKey: GrumpkinScalar);
    createAuthWit(messageHash: Fr): Promise<AuthWitness>;
}
export declare class AccountGroupManager extends AccountManager {
    private admin;
    constructor(pxe: PXE, secretKey: Fr, accountGroupContract: AccountGroupContractClass, admin: AztecAddress, salt?: Salt);
}
export {};
//# sourceMappingURL=testtypes.d.ts.map