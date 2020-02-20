import {
    ICrypto as ICryptoBase,
    IBrainKeyCrypto,
    NodeBuffer,
    IPublicKey,
    IPrivateKey
} from "@virgilsecurity/crypto-types";

export type EncryptFileParams = {
    inputPath: string;
    publicKeys: IPublicKey | IPublicKey[];
    outputPath?: string;
    enablePadding?: boolean;
};

export type DecryptFileParams = {
    inputPath: string;
    privateKey: IPrivateKey;
    outputPath?: string;
};

export type GenerateFileSignatureParams = {
    inputPath: string;
    privateKey: IPrivateKey;
};

export type VerifyFileSignatureParams = {
    inputPath: string;
    signature: string;
    publicKey: IPublicKey;
};

interface ICrypto extends ICryptoBase {
    encryptFile(params: EncryptFileParams): Promise<string>;
    decryptFile(params: DecryptFileParams): Promise<string>;
    generateFileSignature(params: GenerateFileSignatureParams): Promise<NodeBuffer>;
    verifyFileSignature(params: VerifyFileSignatureParams): Promise<boolean>;
}

export const Buffer: NodeBuffer;
export const virgilCrypto: ICrypto;
export const virgilBrainKeyCrypto: IBrainKeyCrypto;
export enum KeyPairType {
    ED25519,
    CURVE25519,
    SECP256R1,
    RSA_2048,
    RSA_4096,
    RSA_8192,
    CURVE25519_ED25519,
    CURVE25519_ROUND5_ED25519_FALCON
}
export enum HashAlgorithm {
    SHA224,
    SHA256,
    SHA384,
    SHA512
}

export { IKeyPair } from "@virgilsecurity/crypto-types";
