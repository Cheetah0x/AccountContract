import { AztecAddress, type AztecAddressLike, type ContractArtifact, ContractBase, ContractFunctionInteraction, type ContractMethod, type ContractStorageLayout, type ContractNotes, DeployMethod, type FieldLike, Fr, type FunctionSelectorLike, type Wallet } from "@aztec/aztec.js";
export declare const AccountGroupContractArtifact: ContractArtifact;
/**
 * Type-safe interface for contract AccountGroup;
 */
export declare class AccountGroupContract extends ContractBase {
    private constructor();
    /**
     * Creates a contract instance.
     * @param address - The deployed contract's address.
     * @param wallet - The wallet to use when interacting with the contract.
     * @returns A promise that resolves to a new Contract instance.
     */
    static at(address: AztecAddress, wallet: Wallet): Promise<AccountGroupContract>;
    /**
     * Creates a tx to deploy a new instance of this contract.
     */
    static deploy(wallet: Wallet, signing_pub_key_x: FieldLike, signing_pub_key_y: FieldLike, admin: AztecAddressLike): DeployMethod<AccountGroupContract>;
    /**
     * Creates a tx to deploy a new instance of this contract using the specified public keys hash to derive the address.
     */
    static deployWithPublicKeysHash(publicKeysHash: Fr, wallet: Wallet, signing_pub_key_x: FieldLike, signing_pub_key_y: FieldLike, admin: AztecAddressLike): DeployMethod<AccountGroupContract>;
    /**
     * Creates a tx to deploy a new instance of this contract using the specified constructor method.
     */
    static deployWithOpts<M extends keyof AccountGroupContract["methods"]>(opts: {
        publicKeysHash?: Fr;
        method?: M;
        wallet: Wallet;
    }, ...args: Parameters<AccountGroupContract["methods"][M]>): DeployMethod<AccountGroupContract>;
    /**
     * Returns this contract's artifact.
     */
    static get artifact(): ContractArtifact;
    static get storage(): ContractStorageLayout<"signing_public_key" | "admin" | "group_members" | "member_balances" | "member_notes">;
    static get notes(): ContractNotes<"ValueNote" | "TokenNote" | "AddressNote" | "TransparentNote" | "PublicKeyNote" | "NewAddressNote">;
    /** Type-safe wrappers for the public methods exposed by the contract. */
    methods: {
        /** add_member(member: struct) */
        add_member: ((member: AztecAddressLike) => ContractFunctionInteraction) & Pick<ContractMethod, "selector">;
        /** compute_note_hash_and_optionally_a_nullifier(contract_address: struct, nonce: field, storage_slot: field, note_type_id: field, compute_nullifier: boolean, serialized_note: array) */
        compute_note_hash_and_optionally_a_nullifier: ((contract_address: AztecAddressLike, nonce: FieldLike, storage_slot: FieldLike, note_type_id: FieldLike, compute_nullifier: boolean, serialized_note: FieldLike[]) => ContractFunctionInteraction) & Pick<ContractMethod, "selector">;
        /** constructor(signing_pub_key_x: field, signing_pub_key_y: field, admin: struct) */
        constructor: ((signing_pub_key_x: FieldLike, signing_pub_key_y: FieldLike, admin: AztecAddressLike) => ContractFunctionInteraction) & Pick<ContractMethod, "selector">;
        /** entrypoint(app_payload: struct, fee_payload: struct, cancellable: boolean) */
        entrypoint: ((app_payload: {
            function_calls: {
                args_hash: FieldLike;
                function_selector: FunctionSelectorLike;
                target_address: AztecAddressLike;
                is_public: boolean;
                is_static: boolean;
            }[];
            nonce: FieldLike;
        }, fee_payload: {
            function_calls: {
                args_hash: FieldLike;
                function_selector: FunctionSelectorLike;
                target_address: AztecAddressLike;
                is_public: boolean;
                is_static: boolean;
            }[];
            nonce: FieldLike;
            is_fee_payer: boolean;
        }, cancellable: boolean) => ContractFunctionInteraction) & Pick<ContractMethod, "selector">;
        /** get_admin() */
        get_admin: (() => ContractFunctionInteraction) & Pick<ContractMethod, "selector">;
        /** get_balance(creditor: struct, debtor: struct) */
        get_balance: ((creditor: AztecAddressLike, debtor: AztecAddressLike) => ContractFunctionInteraction) & Pick<ContractMethod, "selector">;
        /** make_payment(debtor: struct, creditor: struct, amount: field) */
        make_payment: ((debtor: AztecAddressLike, creditor: AztecAddressLike, amount: FieldLike) => ContractFunctionInteraction) & Pick<ContractMethod, "selector">;
        /** set_balance(creditor: struct, debtor: struct, amount: field) */
        set_balance: ((creditor: AztecAddressLike, debtor: AztecAddressLike, amount: FieldLike) => ContractFunctionInteraction) & Pick<ContractMethod, "selector">;
        /** setup_group_payments(creditor: struct, debtors: array, amount: field) */
        setup_group_payments: ((creditor: AztecAddressLike, debtors: AztecAddressLike[], amount: FieldLike) => ContractFunctionInteraction) & Pick<ContractMethod, "selector">;
        /** verify_private_authwit(inner_hash: field) */
        verify_private_authwit: ((inner_hash: FieldLike) => ContractFunctionInteraction) & Pick<ContractMethod, "selector">;
        /** view_member(position: integer) */
        view_member: ((position: bigint | number) => ContractFunctionInteraction) & Pick<ContractMethod, "selector">;
    };
}
//# sourceMappingURL=AccountGroup.d.ts.map