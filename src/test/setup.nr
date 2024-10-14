//here we are going to test the deployment of the contract and the initialization of the signing public key

use dep::aztec::{
     prelude::AztecAddress,
    test::helpers::{cheatcodes, test_environment::TestEnvironment},
    // protocol_types::storage::map::derive_storage_slot_in_map,
    oracle::{execution::{get_block_number, get_contract_address}, random::random, storage::storage_read}
};
use dep::std::{schnorr, embedded_curve_ops::{EmbeddedCurvePoint, EmbeddedCurveScalar}};
use dep::std::println;
use crate::AccountGroup;


//this just does not work, will try using jest. 

unconstrained pub fn setup() -> (&mut TestEnvironment, AztecAddress, Field, Field) {
    let mut env = TestEnvironment::new();

    // let public_key: EmbeddedCurvePoint = EmbeddedCurvePoint { x: 1, y: 2, is_infinite: false };

    let signing_pub_key_x: Field = 0x16b93f4afae55cab8507baeb8e7ab4de80f5ab1e9e1f5149bf8cd0d375451d90;
    let signing_pub_key_y: Field = 0x208d44b36eb6e73b254921134d002da1a90b41131024e3b1d721259182106205;

    let account = env.create_account();

    println("initializing contract");
    let initializer_call_interface = AccountGroup::interface().constructor(signing_pub_key_x, signing_pub_key_y);

    println("deploying contract");
    let account_group = env.deploy_self("AccountGroup").with_private_initializer(initializer_call_interface);

    println("contract deployed");
    env.advance_block_by(1);

    let group_account_address = account_group.to_address();
    println(f"group_account_address: {group_account_address}");

    (&mut env, group_account_address, signing_pub_key_x, signing_pub_key_y)
    //we need a pub key on the x and y axis for the constuctor
    //is this the grumpkin curve things
}

#[test]
unconstrained fn test_contract_deployment() {
    let (env, group_account_address, signing_pub_key_x, signing_pub_key_y) = setup();
    println(f"group_account_address: {group_account_address}");
    assert(!group_account_address.is_zero(), "Contract deployment failed");
}

