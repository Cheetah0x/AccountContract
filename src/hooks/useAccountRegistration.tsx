// import React, { useEffect } from 'react';
// import { useAccountContract } from './useAccountContract';
// import { AccountWalletWithSecretKey, PXE } from '@aztec/aztec.js';
// import { Fr, Fq } from '@aztec/aztec.js';


// export default function AccountRegistration({ 
//     pxe, 
//     adminWallet, 
//     secret, 
//     accountPrivateKey,
//     salt
// }: {
//     pxe: PXE,
//     adminWallet: AccountWalletWithSecretKey,
//     secret: Fr,
//     accountPrivateKey: Fq,
//     salt: Fr
// }) {
//   const { groupContract, groupContractWallet, groupContractAddress, wait } = useAccountContract(pxe, adminWallet, secret, accountPrivateKey, salt);

//   useEffect(() => {
//     // Call the registration function to register the contract
//     const register = async () => {
//       const instance = await registerContract();
//       if (instance) {
//         console.log('Contract instance ready:', instance);
//       }
//     };

//     register();
//   }, [groupContract, groupContractWallet, groupContractAddress]);

//   return (
//     <div>
//       {wait ? <p>Registering contract...</p> : <p>Contract registered and ready to use.</p>}
//       {groupContract && <p>Contract Address: {groupContractAddress?.toString()}</p>}
//     </div>
//   );
// }
