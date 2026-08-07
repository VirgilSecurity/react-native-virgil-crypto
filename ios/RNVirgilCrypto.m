#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNVirgilCrypto, NSObject)

// Hashing
RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(computeHash:(NSString *)dataBase64)
RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(computeHashWithAlgorithm:(NSString *)dataBase64
                                        algorithm:(NSInteger)algorithm)

// Key generation
RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(generateKeyPair)
RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(generateKeyPairOfType:(NSInteger)keyPairType)
RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(generateKeyPairUsingSeed:(NSString *)seedBase64)
RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(generateKeyPairWithTypeAndSeed:(NSInteger)keyPairType
                                        seed:(NSString *)seedBase64)

// Encryption
RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(encrypt:(NSString *)dataBase64
                                        for:(NSArray<NSString *> *)publicKeysBase64
                                        enablePadding:(BOOL)enablePadding)
RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(decrypt:(NSString *)dataBase64
                                        with:(NSString *)privateKeyBase64)

// Signatures
RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(generateSignature:(NSString *)dataBase64
                                        using:(NSString *)privateKeyBase64)
RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(verifySignature:(NSString *)signatureBase64
                                        of:(NSString *)dataBase64
                                        with:(NSString *)publicKeyBase64)

// Authenticated encryption
RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(signAndEncrypt:(NSString *)dataBase64
                                        with:(NSString *)privateKeyBase64
                                        for:(NSArray<NSString *> *)publicKeysBase64
                                        enablePadding:(BOOL)enablePadding)
RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(decryptAndVerify:(NSString *)dataBase64
                                        with:(NSString *)privateKeyBase64
                                        usingOneOf:(NSArray<NSString *> *)publicKeysBase64)
RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(signThenEncrypt:(NSString *)dataBase64
                                        with:(NSString *)privateKeyBase64
                                        for:(NSArray<NSString *> *)publicKeysBase64
                                        enablePadding:(BOOL)enablePadding)
RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(decryptThenVerify:(NSString *)dataBase64
                                        with:(NSString *)privateKeyBase64
                                        usingOneOf:(NSArray<NSString *> *)publicKeysBase64)

// Key inspection
RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(getPrivateKeyIdentifier:(NSString *)privateKeyBase64)
RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(getPublicKeyIdentifier:(NSString *)publicKeyBase64)
RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(extractPublicKey:(NSString *)privateKeyBase64)
RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(generateRandomData:(NSInteger)size)

// Detached signatures
RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(signThenEncryptDetached:(NSString *)dataBase64
                                        with:(NSString *)privateKeyBase64
                                        for:(NSArray<NSString *> *)publicKeysBase64
                                        enablePadding:(BOOL)enablePadding)
RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(decryptThenVerifyDetached:(NSString *)dataBase64
                                        withMetadata:(NSString *)metadataBase64
                                        andPrivateKey:(NSString *)privateKeyBase64
                                        usingOneOf:(NSArray<NSString *> *)publicKeysBase64)

// Group sessions
RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(generateGroupSession:(NSString *)groupIdBase64)
RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(importGroupSession:(NSArray<NSString *> *)epochMessagesBase64)

// File operations
RCT_EXTERN_METHOD(encryptFile:(NSString *)inputUri
                  toFile:(nullable NSString *)outputUri
                  for:(NSArray<NSString *> *)publicKeysBase64
                  enablePadding:(BOOL)enablePadding
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(decryptFile:(NSString *)inputUri
                  toFile:(nullable NSString *)outputUri
                  with:(NSString *)privateKeyBase64
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(generateFileSignature:(NSString *)inputUri
                  with:(NSString *)privateKeyBase64
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(verifyFileSignature:(NSString *)signatureBase64
                  ofFile:(NSString *)inputUri
                  with:(NSString *)publicKeyBase64
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
