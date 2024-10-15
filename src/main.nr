//the idea here is that the group contract is just going to be a schnoor account
//will play around with this to see if others can interact with it and get the keys
//if so, they can use the state of the contract to keep shared secrets

//they will have this account contract in their PXEs, so they can get the state of it and interact with it

//joe mentionned something about setting it to a dud so that it cannot do anything,
//need to figure out what he meant and how to do that.

mod notes;
// mod test;

use dep::aztec::macros::aztec;

#[aztec]
contract AccountGroup {

    use dep::aztec::prelude::{Map, AztecAddress, PrivateContext, PrivateImmutable, PublicMutable, PrivateSet};
    use dep::aztec::encrypted_logs::encrypted_note_emission::encode_and_encrypt_note;
    use dep::authwit::{
        entrypoint::{app::AppPayload, fee::FeePayload}, account::AccountActions,
        auth_witness::get_auth_witness, auth::{compute_authwit_nullifier, compute_authwit_message_hash}
    };
    use dep::aztec::{hash::compute_siloed_nullifier, keys::getters::get_public_keys};
    use dep::aztec::oracle::get_nullifier_membership_witness::get_low_nullifier_membership_witness;
    use dep::aztec::macros::{storage::storage, functions::{private, initializer, view, noinitcheck}};
    use value_note::{balance_utils, utils::{increment, decrement}, value_note::ValueNote};
    use std::hash::poseidon2;
    use std::hash::pedersen_hash;
    use aztec::note::note_getter::NoteGetterOptions;

    use crate::notes::{public_key_note::PublicKeyNote, NewAddressNote::NewAddressNote};


    #[storage]
    struct Storage<Context> {
        signing_public_key: PrivateImmutable<PublicKeyNote, Context>,
        admin: PrivateImmutable<NewAddressNote, Context>,
        member_balances : Map<Field, PrivateSet<ValueNote, Context>, Context>
    }

    //for SchnoorAccount contract
    //if we send the notes to the PXEs of the users in the group, then they can use the state of the contract to keep shared secrets
    //that is the idea. 
    #[private]
    #[initializer]
    fn constructor(signing_pub_key_x: Field, signing_pub_key_y: Field, admin: AztecAddress) {
        let this = context.this_address();
        let this_keys = get_public_keys(this);
        //not emitting outgoing for msg_sender here to not have to register keys for the contract through which we deploy this (typically MultiCallEntryPoint).

        let mut pub_key_note = PublicKeyNote::new(signing_pub_key_x, signing_pub_key_y, this_keys.npk_m.hash());
        storage.signing_public_key.initialize(&mut pub_key_note).emit(encode_and_encrypt_note(&mut context, this_keys.ovpk_m, this_keys.ivpk_m, this));

        let admin_keys = get_public_keys(admin);
        let mut admin_address_note = NewAddressNote::new(admin, this_keys.npk_m.hash());
        storage.admin.initialize(&mut admin_address_note).emit(encode_and_encrypt_note(&mut context, this_keys.ovpk_m, this_keys.ivpk_m, admin));
        // storage.group_members.at(admin).write(true);
    }

    // Note: If you globally change the entrypoint signature don't forget to update account_entrypoint.ts
    #[private]
    fn entrypoint(app_payload: AppPayload, fee_payload: FeePayload, cancellable: bool) {
        let actions = AccountActions::init(&mut context, is_valid_impl);
        actions.entrypoint(app_payload, fee_payload, cancellable);
    }

    #[private]
    #[view]
    fn get_admin() -> pub AztecAddress {
        let admin_note = storage.admin.get_note();
        admin_note.address
    }

    #[private]
    fn setup_group_payments(creditor: AztecAddress, debtors: [AztecAddress; 2], amount: Field) {
        let contract_address = context.this_address();
        assert(context.msg_sender() == contract_address, "Only the contract can call this function");

        let shared_amount : u32 = amount as u32 / (debtors.len() + 1);
        for i in 0..2 {
            let debtor = debtors[i];
            let hash_inputs = [creditor.to_field(), debtor.to_field()];
            let key = poseidon2::Poseidon2::hash(hash_inputs, 2);
            // let key = pedersen_hash([creditor.to_field(), debtor.to_field()]);

            let storage_location = storage.member_balances.at(key);
            increment(storage_location, shared_amount.to_field(), contract_address, contract_address);
        }

    }

    #[private]
    fn set_balance(creditor: AztecAddress, debtor: AztecAddress, amount: Field) {
        let contract_address = context.this_address();
        assert(context.msg_sender() == contract_address, "Only the contract can call this function");

        let hash_inputs = [creditor.to_field(), debtor.to_field()];
        let key = poseidon2::Poseidon2::hash(hash_inputs, 2);
        // let key = pedersen_hash([creditor.to_field(), debtor.to_field()]);

        let storage_location = storage.member_balances.at(key);
        increment(storage_location, amount, contract_address, contract_address);
    }

    #[private]
    fn make_payment(debtor: AztecAddress, creditor: AztecAddress, amount: Field) {
        let contract_address = context.this_address();
        assert(context.msg_sender() == contract_address, "Only the contract can call this function");

        let hash_inputs = [creditor.to_field(), debtor.to_field()];
        let new_amount = amount * -1;
        let key = poseidon2::Poseidon2::hash(hash_inputs, 2);
        // let key = pedersen_hash([creditor.to_field(), debtor.to_field()]);

        let storage_location = storage.member_balances.at(key);
        increment(storage_location, new_amount, contract_address, contract_address);
    }

    #[private]
    #[view]
    fn get_balance(creditor: AztecAddress, debtor: AztecAddress) -> Field {
        let contract_address = context.this_address();
        assert(context.msg_sender() == contract_address, "Only the contract can call this function");

        let hash_inputs = [creditor.to_field(), debtor.to_field()];
        let key = poseidon2::Poseidon2::hash(hash_inputs, 2);
        // let key = pedersen_hash([creditor.to_field(), debtor.to_field()]);
        let options = NoteGetterOptions::new();
        let balance_notes: BoundedVec<ValueNote, 16> = storage.member_balances.at(key).get_notes(options);

        let mut total_balance = 0 as Field;
        for i in 0..balance_notes.max_len() {
            if i < balance_notes.len() {
                let note = balance_notes.get_unchecked(i);
                total_balance += note.value;
            }
        }
        total_balance
    }

    //next will be group balances, already this is much more efficient than the other implementation
    //where i am just firing off notes to the users. 
    




    #[private]
    #[view]
    fn verify_private_authwit(inner_hash: Field) -> Field {
        let actions = AccountActions::init(&mut context, is_valid_impl);
        actions.verify_private_authwit(inner_hash)
    }

    #[contract_library_method]
    fn is_valid_impl(context: &mut PrivateContext, outer_hash: Field) -> bool {
        let storage = Storage::init(context);
        let public_key = storage.signing_public_key.get_note();
        // Load auth witness and format as an u8 array
        let witness: [Field; 64] = unsafe {
            get_auth_witness(outer_hash)
        };
        let mut signature: [u8; 64] = [0; 64];
        for i in 0..64 {
            signature[i] = witness[i] as u8;
        }

        // Verify signature using hardcoded public key
        std::schnorr::verify_signature(
            public_key.x,
            public_key.y,
            signature,
            outer_hash.to_be_bytes::<32>()
        )
    }

    /** 
    * @notice Helper function to check validity of private authwitnesses
    * @param consumer The address of the consumer of the message
    * @param message_hash The message hash of the message to check the validity
    * @return True if the message_hash can be consumed, false otherwise
    */
    unconstrained fn lookup_validity(consumer: AztecAddress, inner_hash: Field) -> bool {
        let public_key = storage.signing_public_key.view_note();

        let message_hash = compute_authwit_message_hash(consumer, context.chain_id(), context.version(), inner_hash);

        let witness: [Field; 64] = get_auth_witness(message_hash);

        let mut signature: [u8; 64] = [0; 64];

        for i in 0..64 {
            signature[i] = witness[i] as u8;
        }

        let valid_in_private = std::schnorr::verify_signature(
            public_key.x,
            public_key.y,
            signature,
            message_hash.to_be_bytes::<32>()
        );

        //compute the nullifier and check if is is spent
        //This will BLINDLY TRUST the oracle, but the oracle is us, and 
        //it is not as part of execution of the contract, so we are good. 
        let nullifier = compute_authwit_nullifier(context.this_address(), inner_hash);
        let siloed_nullifier = compute_siloed_nullifier(consumer, nullifier);
        let lower_wit = get_low_nullifier_membership_witness(context.block_number(), siloed_nullifier);
        let is_spent = lower_wit.leaf_preimage.nullifier == siloed_nullifier;

        !is_spent & valid_in_private
    }
}
