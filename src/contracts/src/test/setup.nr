//here we are going to test the deployment of the contract and the initialization of the signing public key

use dep::aztec::{

    test::helpers::{cheatcodes, test_environment::TestEnvironment},
    // protocol_types::storage::map::derive_storage_slot_in_map,
    oracle::{execution::{get_block_number, get_contract_address}, random::random, storage::storage_read}
};
use dep::std::{schnorr, embedded_curve_ops::{EmbeddedCurvePoint, EmbeddedCurveScalar}};
use dep::std::println;
use crate::AccountGroup;
use dep::protocol_types::{
    abis::function_selector::FunctionSelector, address::AztecAddress,
    constants::CONTRACT_INSTANCE_LENGTH, contract_instance::ContractInstance
};


//this just does not work, will try using jest. 
//got it deploying in jest, no idea how to do the same thing in the TXE, for deploy u need a wallet to depoly, cannot do that here

unconstrained pub fn setup() -> (&mut TestEnvironment, AztecAddress, AztecAddress) {
    let mut env = TestEnvironment::new();

    // let public_key: EmbeddedCurvePoint = EmbeddedCurvePoint { x: 1, y: 2, is_infinite: false };
    let admin = env.create_account();
    println(f"admin: {admin}");

    let secret = Field::from(123);
    let test_account = cheatcodes::add_account(secret);
    println(f"test_account: {test_account}");
    let x = test_account.keys.ivpk_m.inner.x;
    println(f"x: {x}");
    let y = test_account.keys.ivpk_m.inner.y;
    println(f"y: {y}");

    let contract_address = create_account_contract(&mut env, secret, admin);

    let initializer_call_interface = AccountGroup::interface().constructor(x, y, admin);

    let group_contract = env.deploy_self("AccountGroup").with_private_initializer(initializer_call_interface);
    let contract_address = group_contract.to_address();
    println(f"contract_address: {contract_address}");

    (&mut env, contract_address, admin)

}

#[test]
unconstrained fn test_contract_deployment() {
    let (env, contract_address, admin) = setup();
    println(f"group_account_address: {contract_address}");
    assert(!contract_address.is_zero(), "Contract deployment failed");
}



unconstrained fn create_account_contract( env: &mut TestEnvironment, secret: Field, admin: AztecAddress) -> AztecAddress {
    let test_account = cheatcodes::add_account(secret);
    let address = test_account.address;
    cheatcodes::advance_blocks_by(1);

    let adminField = admin.to_field();
    println(f"sadmin: {adminField}");

    let selector = FunctionSelector::from_signature("constructor(Field,Field,Field)");
  

    let mut context = env.private_at(get_block_number());
    let args = [test_account.keys.ivpk_m.inner.x, test_account.keys.ivpk_m.inner.y, adminField];
    let _ = context.call_private_function(address, selector, args);

    address
}