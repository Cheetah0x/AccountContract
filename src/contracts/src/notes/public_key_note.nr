use dep::aztec::prelude::{NoteHeader, NullifiableNote, PrivateContext};
use dep::aztec::{
    note::utils::compute_note_hash_for_nullify, keys::getters::get_nsk_app,
    protocol_types::{constants::GENERATOR_INDEX__NOTE_NULLIFIER, hash::poseidon2_hash_with_separator},
    macros::notes::note
};

//Stores a public key conposed of two fields
//does not have a once yet

#[note]
pub struct PublicKeyNote {
    x: Field,
    y: Field,
    //sote the npk_mhash only to get the secret key to compute the nullifier
    npk_m_hash: Field,
}

impl NullifiableNote for PublicKeyNote {
    fn compute_nullifier(
        self,
        context: &mut PrivateContext,
        note_hash_for_nullify: Field
     ) -> Field {
        let secret = context.request_nsk_app(self.npk_m_hash);
        poseidon2_hash_with_separator(
            [
                note_hash_for_nullify,
                secret
            ],
            GENERATOR_INDEX__NOTE_NULLIFIER as Field
        )
    }

    unconstrained fn compute_nullifier_without_context(self) -> Field {
        let note_hash_for_nullify = compute_note_hash_for_nullify(self);
        let secret = get_nsk_app(self.npk_m_hash);
        poseidon2_hash_with_separator(
            [
                note_hash_for_nullify,
                secret
            ],
            GENERATOR_INDEX__NOTE_NULLIFIER as Field
        )
    }
}

impl PublicKeyNote {
    pub fn new(x: Field, y: Field, npk_m_hash: Field) -> Self {
        PublicKeyNote {
            x,
            y,
            npk_m_hash,
            header: NoteHeader::empty()
        }
    }
}

impl Eq for PublicKeyNote {
    fn eq(self, other: Self) -> bool {
        (self.x == other.x) & (self.y == other.y) & (self.npk_m_hash == other.npk_m_hash)
    }
}
