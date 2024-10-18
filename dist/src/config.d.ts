import { PXE } from "@aztec/aztec.js";
export declare class PublicEnv {
    private pxeURLs;
    pxeInstances: PXE[];
    constructor(pxeURLs: string[]);
    createNewWalletinPXE(index: number): Promise<import("@aztec/aztec.js").AccountWalletWithSecretKey>;
}
export declare const deployerEnv: PublicEnv;
export declare const filteredInterface: import("@aztec/aztec.js").FunctionArtifact[];
//# sourceMappingURL=config.d.ts.map