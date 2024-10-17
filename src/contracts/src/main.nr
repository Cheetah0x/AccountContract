//the idea here is that the group contract is just going to be a schnoor account
//will play around with this to see if others can interact with it and get the keys
//if so, they can use the state of the contract to keep shared secrets

//they will have this account contract in their PXEs, so they can get the state of it and interact with it

//TODO: Make the account dud so i cannot do anything
//TODO: Have access gating so that only the group members can do things
//TODO: Make it easy so anyone can deploy the account
//TODO: Make the process of people adding the account to their PXEs easy, this will be front end
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

    global ZERO_ADDRESS: AztecAddress = AztecAddress::from_field(0x0000000000000000000000000000000000000000000000000000000000000000);


    #[storage]
    struct Storage<Context> {
        signing_public_key: PrivateImmutable<PublicKeyNote, Context>,
        admin: PrivateImmutable<NewAddressNote, Context>,
        group_members: PrivateSet<NewAddressNote, Context>,
        member_balances : Map<Field, PrivateSet<ValueNote, Context>, Context>
    }

    #[private]
    #[initializer]
    fn constructor(signing_pub_key_x: Field, signing_pub_key_y: Field, admin: AztecAddress) {
        let this = context.this_address();
        let this_keys = get_public_keys(this);
        //not emitting outgoing for msg_sender here to not have to register keys for the contract through which we deploy this (typically MultiCallEntryPoint).

        let mut pub_key_note = PublicKeyNote::new(signing_pub_key_x, signing_pub_key_y, this_keys.npk_m.hash());
        storage.signing_public_key.initialize(&mut pub_key_note).emit(encode_and_encrypt_note(&mut context, this_keys.ovpk_m, this_keys.ivpk_m, this));

        //add admin to the group
        let admin_keys = get_public_keys(admin);
        let mut admin_address_note = NewAddressNote::new(admin, this_keys.npk_m.hash());
        storage.admin.initialize(&mut admin_address_note).emit(encode_and_encrypt_note(&mut context, this_keys.ovpk_m, this_keys.ivpk_m, admin));

        // add admin to the group members
        let mut admin_member_note = NewAddressNote::new(admin, this_keys.npk_m.hash());
        storage.group_members.insert(&mut admin_member_note).emit(
            encode_and_encrypt_note(
                &mut context,
                this_keys.ovpk_m,
                this_keys.ivpk_m,
                admin
            )
        );
    }

    //how i can make the entrypoint as barebones as possible for what i need
    #[private]
    fn entrypoint(app_payload: AppPayload, fee_payload: FeePayload, cancellable: bool) {
        let actions = AccountActions::init(&mut context, is_valid_impl);
        actions.entrypoint(app_payload, fee_payload, cancellable);

        // let mut is_member = false;
        // let caller = context.msg_sender();
        // if caller == context.this_address() {
        //     is_member = true;
        // } else {
        //     let caller_keys = get_public_keys(caller);
        //     let options = NoteGetterOptions::new();
        //     let members_notes: BoundedVec<NewAddressNote, 16> = storage.group_members.get_notes(options);

        //     for i in 0..members_notes.max_len() {
        //         if i < members_notes.len() {
        //             let note = members_notes.get_unchecked(i);
        //             if note.address == caller {
        //                 is_member = true;
        //             }
        //         }
        //     }
        //     assert(is_member, "Caller is not a group member");
        // }
    }

    #[private]
    #[view]
    fn get_admin() -> pub AztecAddress {
        let admin_note = storage.admin.get_note();
        admin_note.address
    }

    #[private]
    fn add_member(member: AztecAddress) {
        let contract_address = context.this_address();
        assert(context.msg_sender() == contract_address, "Only the contract can call this function");
        let contract_address_keys = get_public_keys(contract_address);
        let mut member_address_note = NewAddressNote::new(member, contract_address_keys.npk_m.hash());
        storage.group_members.insert(&mut member_address_note).emit(
            encode_and_encrypt_note(
                &mut context,
                contract_address_keys.ovpk_m,
                contract_address_keys.ivpk_m,
                member
            )
        );
    }

    //cannot return a vector/bounded vec of addresses as there is no serialization/deserialization of them
    //this is a workaround, get the members in each position of storage and return them
    #[private]
    #[view]
    fn view_member(position:u32) -> AztecAddress {
        let contract_address = context.this_address();
        let contract_address_keys = get_public_keys(contract_address);
        let options = NoteGetterOptions::new();
        let members_notes: BoundedVec<NewAddressNote, 16> = storage.group_members.get_notes(options);

        if position < members_notes.len() as u32 {
            let note = members_notes.get_unchecked(position as u32);
            note.address
        } else {
            ZERO_ADDRESS
        };
    }


    #[private]
    fn setup_group_payments(creditor: AztecAddress, debtors: [AztecAddress; 2], amount: Field) {
        let contract_address = context.this_address();
        assert(context.msg_sender() == contract_address, "Only the contract can call this function");

        //check if the credior and group members are in the group
        let mut creditor_in_group = false;
        let mut debtor1_in_group = false;
        let mut debtor2_in_group = false;
        let contract_address_keys = get_public_keys(contract_address);
        let options = NoteGetterOptions::new();
        let members_notes: BoundedVec<NewAddressNote, 16> = storage.group_members.get_notes(options);
        for i in 0..members_notes.max_len() {
            if i < members_notes.len() {
                let note = members_notes.get_unchecked(i);
                if note.address == creditor {
                    creditor_in_group = true;
                }
                if note.address == debtors[0] {
                    debtor1_in_group = true;
                }
                if note.address == debtors[1] {
                    debtor2_in_group = true;
                }
            }
        }
        assert(creditor_in_group, "Creditor is not in the group");
        assert(debtor1_in_group, "Debtor 1 is not in the group");
        assert(debtor2_in_group, "Debtor 2 is not in the group");
        
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

        //check if the creditor and debtor are in the group
        let mut creditor_in_group = false;
        let mut debtor_in_group = false;
        let contract_address_keys = get_public_keys(contract_address);
        let options = NoteGetterOptions::new();
        let members_notes: BoundedVec<NewAddressNote, 16> = storage.group_members.get_notes(options);
        for i in 0..members_notes.max_len() {
            if i < members_notes.len() {
                let note = members_notes.get_unchecked(i);
                if note.address == creditor {
                    creditor_in_group = true;
                }
                if note.address == debtor {
                    debtor_in_group = true;
                }
            }
        }
        assert(creditor_in_group, "Creditor is not in the group");
        assert(debtor_in_group, "Debtor is not in the group");
        
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

        //check if the creditor and debtor are in the group
        let mut creditor_in_group = false;
        let mut debtor_in_group = false;
        let contract_address_keys = get_public_keys(contract_address);
        let options = NoteGetterOptions::new();
        let members_notes: BoundedVec<NewAddressNote, 16> = storage.group_members.get_notes(options);
        for i in 0..members_notes.max_len() {
            if i < members_notes.len() {
                let note = members_notes.get_unchecked(i);
                if note.address == creditor {
                    creditor_in_group = true;
                }
                if note.address == debtor {
                    debtor_in_group = true;
                }
            }
        }
        assert(creditor_in_group, "Creditor is not in the group");
        assert(debtor_in_group, "Debtor is not in the group");
        

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

        //  //check if the creditor and debtor are in the group, have to type it out
        //  //cannot get private functions calling other private functions
        let mut creditor_in_group = false;
        let mut debtor_in_group = false;
        let contract_address_keys = get_public_keys(contract_address);
        let options = NoteGetterOptions::new();
        let members_notes: BoundedVec<NewAddressNote, 16> = storage.group_members.get_notes(options);
        for i in 0..members_notes.max_len() {
            if i < members_notes.len() {
                let note = members_notes.get_unchecked(i);
                if note.address == creditor {
                    creditor_in_group = true;
                }
                if note.address == debtor {
                    debtor_in_group = true;
                }
            }
        }
        assert(creditor_in_group, "Creditor is not in the group");
        assert(debtor_in_group, "Debtor is not in the group");


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
        let mut is_member = false;

        // Verify signature using hardcoded public key
        std::schnorr::verify_signature(
            public_key.x,
            public_key.y,
            signature,
            outer_hash.to_be_bytes::<32>()
        )
    }
}
