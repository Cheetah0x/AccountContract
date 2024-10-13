//goal is to use an account contract to create the group that people can interact with

use dep::aztec::macros::aztec;

#[aztec]
contract AccountGroup {

    use dep::aztec::prelude::PrivateContext;
    use dep::authwith::{
        entrypoint::{app::AppPayload, fee::FeePayload}, account::AccountActions,
        auth_withness::get_auth_withness,
    };

    use dep::aztec::macros::{functions::{private, view}};

    global public_key_x: Field = 0x16b93f4afae55cab8507baeb8e7ab4de80f5ab1e9e1f5149bf8cd0d375451d90;
    global public_key_y: Field = 0x208d44b36eb6e73b254921134d002da1a90b41131024e3b1d721259182106205;

    #[private]
    fn entrypoint(app_payload: AppPayload, fee_payload: FeePayload, cancellable: bool) {
        let actions = AccountActions::init(&mut context, is_valid_impl);
        actions.entrypoint(app_payload, fee_payload, cancellable);
    }

    #[private]
    #[view]
    fn verify_private_authwith(inner_hash: Field) -> Field {
        let actions = AccountActions::init(&mut context, is_valid_impl);
        actions.verify_private_authwith(inner_hash)
    }

    #[contract_library_method]
    fn is_valid_impl(_context: &mut PrivateContext, outer_hash: Field) -> bool {
        //load auth with and format as an u8 array
        let witness = [Field; 64] = unsafe {
            get_auth_withness(outer_hash)
        };
        let mut signature: [u8; 64] = [0; 64];
        for i in 0..64 {
            signature[i] = witness[i] as u8;
        }

        //verfify sig using harcoded pub key
        std::schnorr::verify_signature(
            public_key_x,
            public_key_y,
            signature,
            outer_hash.to_be_bytes::<32>()
        )
    }
}