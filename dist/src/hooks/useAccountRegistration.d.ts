import { AccountWalletWithSecretKey, PXE } from '@aztec/aztec.js';
import { Fr, Fq } from '@aztec/aztec.js';
export default function AccountRegistration({ pxe, adminWallet, secret, accountPrivateKey }: {
    pxe: PXE;
    adminWallet: AccountWalletWithSecretKey;
    secret: Fr;
    accountPrivateKey: Fq;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=useAccountRegistration.d.ts.map