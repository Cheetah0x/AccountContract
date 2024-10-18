import { AccountManager, AuthWitness, AztecAddress, CompleteAddress, Fr, GrumpkinScalar, PXE, AccountWalletWithSecretKey, Contract } from "@aztec/aztec.js";
import { Salt } from "@aztec/aztec.js/account";
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
    [memberName: string]: {
        walletInstance: Contract;
    };
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
//# sourceMappingURL=types.d.ts.map