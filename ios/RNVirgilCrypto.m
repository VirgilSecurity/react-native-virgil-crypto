
#import "RNVirgilCrypto.h"

@implementation RNVirgilCrypto

- (instancetype)init
{
    self = [super init];
    self.crypto = [[VSMVirgilCrypto alloc] initWithDefaultKeyType:VSMKeyPairTypeEd25519 useSHA256Fingerprints:NO error:nil];
    return self;
}

- (NSDictionary *)constantsToExport
{
    return @{ @"KeyPairType": @{ @"ED25519": @(VSMKeyPairTypeEd25519),
                                 @"CURVE25519": @(VSMKeyPairTypeCurve25519),
                                 @"SECP256R1": @(VSMKeyPairTypeSecp256r1),
                                 @"RSA2048": @(VSMKeyPairTypeRsa2048),
                                 @"RSA4096": @(VSMKeyPairTypeRsa4096),
                                 @"RSA8192": @(VSMKeyPairTypeRsa8192) },
              @"HashAlgorithm": @{ @"SHA224": @(VSMHashAlgorithmSha224),
                                   @"SHA256": @(VSMHashAlgorithmSha256),
                                   @"SHA384": @(VSMHashAlgorithmSha384),
                                   @"SHA512": @(VSMHashAlgorithmSha512) }
              };
};

+ (BOOL)requiresMainQueueSetup
{
    return NO;
}

- (NSArray<VSMVirgilPublicKey*>*) decodeAndImportPublicKeys:(NSArray<NSString*>*) publicKeysBase64 error:(NSError**) error
{
    NSMutableArray<VSMVirgilPublicKey*>* publicKeys = [NSMutableArray arrayWithCapacity:[publicKeysBase64 count]];
    for (NSString* eachString in publicKeysBase64) {
        VSMVirgilPublicKey* publicKey = [self.crypto importPublicKeyFrom:[eachString dataUsingBase64] error:error];
        if (nil == publicKey) {
            break;
        } else {
            [publicKeys addObject:publicKey];
        }
    }
    
    if ([publicKeys count] < [publicKeysBase64 count]) {
        return nil;
    }
    return publicKeys;
}

- (NSDictionary*) exportAndEncodeKeyPair:(VSMVirgilKeyPair*) keypair error:(NSError**) error
{
    NSData* privateKeyData = [self.crypto exportPrivateKey:keypair.privateKey error:error];
    if (nil == privateKeyData) {
        return nil;
    }
    NSData* publicKeyData = [self.crypto exportPublicKey:keypair.publicKey error:error];
    if (nil == publicKeyData) {
        return nil;
    }
    
    NSDictionary* result = @{ @"privateKey": [privateKeyData stringUsingBase64],
                              @"publicKey": [publicKeyData stringUsingBase64] };
    return result;
}

- (NSData*) computeHashFor:(NSData*) data using:(VSMHashAlgorithm) alg
{
    return [self.crypto computeHashFor:data using:alg];
}

RCT_EXPORT_MODULE()

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, computeHash:(NSString *)dataBase64) {
    @autoreleasepool {
        NSData *digest = [self computeHashFor:[dataBase64 dataUsingBase64] using:VSMHashAlgorithmSha512];
        return [ResponseFactory fromResult:[digest stringUsingBase64]];
    }
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, computeHashWithAlgorithm:(NSString *)dataBase64 algorithm:(VSMHashAlgorithm)alg) {
    @autoreleasepool {
        NSData *digest = [self computeHashFor:[dataBase64 dataUsingBase64] using:alg];
        return [ResponseFactory fromResult:[digest stringUsingBase64]];
    }
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, generateKeyPair) {
    @autoreleasepool {
        NSError *err;
        VSMVirgilKeyPair* keypair = [self.crypto generateKeyPairAndReturnError:&err];
        if (nil == keypair) {
            return [ResponseFactory fromError:err];
        }
        
        NSDictionary *exportedKeypair = [self exportAndEncodeKeyPair:keypair error:&err];
        return [ResponseFactory fromResult:exportedKeypair];
    }
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, generateKeyPairOfType:(VSMKeyPairType)type) {
    @autoreleasepool {
        NSError *err;
        VSMVirgilKeyPair* keypair = [self.crypto generateKeyPairOfType:type error:&err];
        if (nil == keypair) {
            return [ResponseFactory fromError:err];
        }
        
        NSDictionary *exportedKeypair = [self exportAndEncodeKeyPair:keypair error:&err];
        return [ResponseFactory fromResult:exportedKeypair];
    }
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, generateKeyPairUsingSeed:(NSString*)seedBase64)
{
    @autoreleasepool {
        NSError* err;
        VSMVirgilKeyPair* keypair = [self.crypto generateKeyPairUsingSeed:[seedBase64 dataUsingBase64] error:&err];
        if (nil == keypair) {
            return [ResponseFactory fromError:err];
        }
        
        NSDictionary* exportedKeyPair = [self exportAndEncodeKeyPair:keypair error:&err];
        if (nil == exportedKeyPair) {
            return [ResponseFactory fromError:err];
        }
        
        return [ResponseFactory fromResult:exportedKeyPair];
    }
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, generateKeyPairWithTypeAndSeed:(VSMKeyPairType)type
                                    seed:(NSString*)seedBase64)
{
    @autoreleasepool {
        NSError* err;
        VSMVirgilKeyPair* keypair = [self.crypto generateKeyPairOfType:type
                                                             usingSeed:[seedBase64 dataUsingBase64]
                                                                 error:&err];
        if (nil == keypair) {
            return [ResponseFactory fromError:err];
        }
        
        NSDictionary* exportedKeyPair = [self exportAndEncodeKeyPair:keypair error:&err];
        if (nil == exportedKeyPair) {
            return [ResponseFactory fromError:err];
        }
        
        return [ResponseFactory fromResult:exportedKeyPair];
    }
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, encrypt:(NSString*)dataBase64 for:(NSArray<NSString*>*)recipientsBase64) {
    @autoreleasepool {
        NSError *err;
        NSArray<VSMVirgilPublicKey*>* publicKeys = [self decodeAndImportPublicKeys:recipientsBase64 error:&err];
        if (nil == publicKeys) {
            return [ResponseFactory fromError:err];
        }
        
        NSData *encryptedData = [self.crypto encrypt:[dataBase64 dataUsingBase64] for:publicKeys error:&err];
        return [ResponseFactory fromResult:[encryptedData stringUsingBase64]];
    }
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, decrypt:(NSString*)dataBase64 with:(NSString*)privateKeyBase64) {
    @autoreleasepool {
        NSError *err;
        VSMVirgilKeyPair *keypair = [self.crypto importPrivateKeyFrom:[privateKeyBase64 dataUsingBase64] error:&err];
        if (nil == keypair) {
            return [ResponseFactory fromError:err];
        }
        
        NSData *decryptedData = [self.crypto decrypt:[dataBase64 dataUsingBase64]
                                                with:keypair.privateKey
                                               error:&err];
        return [ResponseFactory fromResult:[decryptedData stringUsingBase64]];
    }
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, generateSignature:(NSString*)dataBase64
                                    using:(NSString*)privateKeyBase64)
{
    @autoreleasepool {
        NSError *err;
        VSMVirgilKeyPair *keypair = [self.crypto importPrivateKeyFrom:[privateKeyBase64 dataUsingBase64] error:&err];
        if (nil == keypair) {
            return [ResponseFactory fromError:err];
        }
        
        NSData *signature = [self.crypto generateSignatureOf:[dataBase64 dataUsingBase64]
                                                       using:keypair.privateKey
                                                       error:&err];
        return [ResponseFactory fromResult:[signature stringUsingBase64]];
    }
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, verifySignature:(NSString*)signatureBase64
                                    of:(NSString*)dataBase64
                                    with:(NSString*)publicKeyBase64)
{
    @autoreleasepool {
        NSError *err;
        VSMVirgilPublicKey *publicKey = [self.crypto importPublicKeyFrom:[publicKeyBase64 dataUsingBase64] error:&err];
        if (nil == publicKey) {
            return [ResponseFactory fromError:err];
        }
        
        BOOL isValid = [self.crypto verifySignature_objc:[signatureBase64 dataUsingBase64]
                                                      of:[dataBase64 dataUsingBase64]
                                                    with:publicKey];
        return [ResponseFactory fromResult:@(isValid)];
    }
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, signAndEncrypt:(NSString*)dataBase64
                                    with:(NSString*)privateKeyBase64
                                    for:(NSArray<NSString*>*)recipientsBase64)
{
    @autoreleasepool {
        NSError *err;
        VSMVirgilKeyPair *keypair = [self.crypto importPrivateKeyFrom:[privateKeyBase64 dataUsingBase64] error:&err];
        if (nil == keypair) {
            return [ResponseFactory fromError:err];
        }
        
        NSArray<VSMVirgilPublicKey*> *publicKeys = [self decodeAndImportPublicKeys:recipientsBase64 error:&err];
        if (nil == publicKeys) {
            return [ResponseFactory fromError:err];
        }
        
        NSData *encryptedData = [self.crypto signAndEncrypt:[dataBase64 dataUsingBase64]
                                                       with:keypair.privateKey
                                                        for:publicKeys
                                                      error:&err];
        if (nil == encryptedData) {
            return [ResponseFactory fromError:err];
        }
        
        return [ResponseFactory fromResult:[encryptedData stringUsingBase64]];
    }
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, decryptAndVerify:(NSString*)dataBase64
                                    with:(NSString*)privateKeyBase64
                                    usingOneOf:(NSArray<NSString*>*)sendersPublicKeysBase64)
{
    @autoreleasepool {
        NSError *err;
        VSMVirgilKeyPair *keypair = [self.crypto importPrivateKeyFrom:[privateKeyBase64 dataUsingBase64] error:&err];
        if (nil == keypair) {
            return [ResponseFactory fromError:err];
        }
        
        NSArray<VSMVirgilPublicKey*> *publicKeys = [self decodeAndImportPublicKeys:sendersPublicKeysBase64 error:&err];
        if (nil == publicKeys) {
            return [ResponseFactory fromError:err];
        }
        
        NSData *decryptedData = [self.crypto decryptAndVerify:[dataBase64 dataUsingBase64]
                                                         with:keypair.privateKey
                                                   usingOneOf:publicKeys
                                                        error:&err];
        if (nil == decryptedData) {
            return [ResponseFactory fromError:err];
        }
        
        return [ResponseFactory fromResult:[decryptedData stringUsingBase64]];
    }
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, extractPublicKey:(NSString*)privateKeyBase64)
{
    @autoreleasepool {
        NSError *err;
        VSMVirgilKeyPair *keypair = [self.crypto importPrivateKeyFrom:[privateKeyBase64 dataUsingBase64] error:&err];
        if (nil == keypair) {
            return [ResponseFactory fromError:err];
        }
        
        NSData *publicKeyData = [self.crypto exportPublicKey:keypair.publicKey error:&err];
        if (nil == publicKeyData) {
            return [ResponseFactory fromError:err];
        }
        
        return [ResponseFactory fromResult:[publicKeyData stringUsingBase64]];
    }
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, generateRandomData:(NSInteger)size)
{
    @autoreleasepool {
        NSError* err;
        NSData* randomData = [self.crypto generateRandomDataOfSize:size error:&err];
        if (nil == randomData) {
            return [ResponseFactory fromError:err];
        }
        
        return [ResponseFactory fromResult:[randomData stringUsingBase64]];
    }
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, signAndEncryptDetached:(NSString*)dataBase64
                                    with:(NSString*)privateKeyBase64
                                    for:(NSArray<NSString*>*)recipientsBase64)
{
    @autoreleasepool {
        NSError *err;
        VSMVirgilKeyPair *keypair = [self.crypto importPrivateKeyFrom:[privateKeyBase64 dataUsingBase64] error:&err];
        if (nil == keypair) {
            return [ResponseFactory fromError:err];
        }
        
        NSArray<VSMVirgilPublicKey*> *publicKeys = [self decodeAndImportPublicKeys:recipientsBase64 error:&err];
        if (nil == publicKeys) {
            return [ResponseFactory fromError:err];
        }
        
        NSData* signature = [self.crypto generateSignatureOf:[dataBase64 dataUsingBase64] using:keypair.privateKey error:&err];
        if (nil == signature) {
            return [ResponseFactory fromError:err];
        }
        
        VSCFAes256Gcm *aesGcm = [VSCFAes256Gcm new];
        VSCFRecipientCipher *cipher = [VSCFRecipientCipher new];
        
        [cipher setEncryptionCipherWithEncryptionCipher:aesGcm];
        [cipher setRandomWithRandom:self.crypto.rng];
        
        for (VSMVirgilPublicKey *publicKey in publicKeys) {
            [cipher addKeyRecipientWithRecipientId:publicKey.identifier publicKey:publicKey.key];
        }
        
        [[cipher customParams] addDataWithKey:VSMVirgilCrypto.CustomParamKeySignature value:signature];
        [[cipher customParams] addDataWithKey:VSMVirgilCrypto.CustomParamKeySignerId value:keypair.privateKey.identifier];
        
        [cipher startEncryptionAndReturnError:&err];
        if (err) {
            return [ResponseFactory fromError:err];
        }
        
        NSData *meta = [cipher packMessageInfo];
        NSData *processedData = [cipher processEncryptionWithData:[dataBase64 dataUsingBase64] error:&err];
        if (nil == processedData) {
            return [ResponseFactory fromError:err];
        }
        NSData *finalData = [cipher finishEncryptionAndReturnError:&err];
        if (nil == finalData) {
            return [ResponseFactory fromError:err];
        }
        
        NSMutableData *encryptedData = [NSMutableData dataWithData:processedData];
        [encryptedData appendData:finalData];
        
        return [ResponseFactory fromResult:@{ @"encryptedData": [encryptedData stringUsingBase64],
                                              @"metadata": [meta stringUsingBase64] }];
    }
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, decryptAndVerifyDetached:(NSString*)dataBase64
                                    withMetadata:(NSString*)metaBase64
                                    andPrivateKey:(NSString*)privateKeyBase64
                                    usingOneOf:(NSArray<NSString*>*)sendersPublicKeysBase64)
{
    @autoreleasepool {
        NSError *err;
        VSMVirgilKeyPair *keypair = [self.crypto importPrivateKeyFrom:[privateKeyBase64 dataUsingBase64] error:&err];
        if (nil == keypair) {
            return [ResponseFactory fromError:err];
        }
        
        NSArray<VSMVirgilPublicKey*> *publicKeys = [self decodeAndImportPublicKeys:sendersPublicKeysBase64 error:&err];
        if (nil == publicKeys) {
            return [ResponseFactory fromError:err];
        }
        
        NSMutableData *combinedData = [NSMutableData dataWithData:[metaBase64 dataUsingBase64]];
        [combinedData appendData:[dataBase64 dataUsingBase64]];
        
        NSData *decryptedData = [self.crypto decryptAndVerify:combinedData with:keypair.privateKey usingOneOf:publicKeys error:&err];
        if (nil == decryptedData) {
            return [ResponseFactory fromError:err];
        }
        
        return [ResponseFactory fromResult:[decryptedData stringUsingBase64]];
    }
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(generateGroupSession:(NSString*)groupIdBase64)
{
    @autoreleasepool {
        NSError *err;
        NSData *sessionId = [self computeHashFor:[groupIdBase64 dataUsingBase64] using:VSMHashAlgorithmSha512];
        sessionId = [sessionId subdataWithRange:NSMakeRange(0, 32)];
        VSCFGroupSessionTicket *initialEpochTicket = [VSCFGroupSessionTicket new];
        [initialEpochTicket setRngWithRng: self.crypto.rng];
        if ([initialEpochTicket setupTicketAsNewWithSessionId:sessionId error:&err] == NO) {
            return [ResponseFactory fromError:err];
        }
        
        VSCFGroupSessionMessage *initalEpochMessage = [initialEpochTicket getTicketMessage];
        NSNumber *epochNumber = @([initalEpochMessage getEpoch]);
        NSData *data = [initalEpochMessage serialize];
        return [ResponseFactory fromResult:@{ @"sessionId": [sessionId stringUsingBase64],
                                              @"currentEpochNumber": epochNumber,
                                              @"epochMessages": @[[data stringUsingBase64]] }];
    }
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(importGroupSession:(NSArray<NSString*>*) epochMessagesBase64)
{
    @autoreleasepool {
        NSError *err;
        NSMutableArray<VSCFGroupSessionMessage*> *epochMessages = [NSMutableArray arrayWithCapacity:[epochMessagesBase64 count]];
        for (NSString *epochMessageBase64 in epochMessagesBase64) {
            VSCFGroupSessionMessage *epochMessage = [VSCFGroupSessionMessage deserializeWithInput:[epochMessageBase64 dataUsingBase64]
                                                                                            error:&err];
            if (nil == epochMessage) {
                return [ResponseFactory fromError:err];
            }
            [epochMessages addObject:epochMessage];
        }
        NSArray<VSCFGroupSessionMessage*> *sortedEpochMessages = [epochMessages sortedArrayUsingComparator:^NSComparisonResult(VSCFGroupSessionMessage* a, VSCFGroupSessionMessage* b) {
            uint32_t aEpoch = [a getEpoch];
            uint32_t bEpoch = [b getEpoch];
            return aEpoch - bEpoch;
        }];
        
        NSMutableArray<NSString *> *sortedSerializedEpochMessages = [NSMutableArray arrayWithCapacity:[sortedEpochMessages count]];
        
        VSCFGroupSession *session = [VSCFGroupSession new];
        [session setRngWithRng:self.crypto.rng];
        for (VSCFGroupSessionMessage* epochMessage in sortedEpochMessages) {
            if ([session addEpochWithMessage:epochMessage error:&err] == NO) {
                return [ResponseFactory fromError:err];
            }
            [sortedSerializedEpochMessages addObject:[[epochMessage serialize] stringUsingBase64]];
        }
        NSData *sessionId = [session getSessionId];
        NSNumber *epochNumber = @([session getCurrentEpoch]);
        
        return [ResponseFactory fromResult:@{ @"sessionId": sessionId,
                                              @"currentEpochNumber": epochNumber,
                                              @"epochMessages": sortedSerializedEpochMessages }];
    }
}

RCT_EXPORT_METHOD(encryptFile:(NSString*)inputUri
                  toFile:(nullable NSString*)outputUri
                  for:(NSArray<NSString*>*)recipientPublicKeysBase64
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSString* inputPath = [FSUtils getPathFromUri:inputUri];
    if ([[NSFileManager defaultManager] fileExistsAtPath:inputPath] == NO) {
        reject(@"invalid_input_file", [NSString stringWithFormat:@"File does not exist at path %@", inputPath], nil);
        return;
    }
    
    NSString* outputPath = outputUri == nil
    ? [FSUtils getTempFilePath:nil]
    : [FSUtils getPathFromUri:outputUri];
    
    NSError* err = nil;
    BOOL isOutputReady = [FSUtils prepareFileForWriting:outputPath error:&err];
    if (!isOutputReady) {
        reject(@"invalid_output_file", [err description], err);
    }
    
    NSArray<VSMVirgilPublicKey*>* publicKeys = [self decodeAndImportPublicKeys:recipientPublicKeysBase64 error:&err];
    if (nil == publicKeys) {
        reject(@"invalid_public_key", @"Public keys array contains invalid public keys", err);
        return;
    }
    
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        NSError *encryptErr;
        NSInputStream *inStream = [NSInputStream inputStreamWithFileAtPath:inputPath];
        NSOutputStream *outStream = [NSOutputStream outputStreamToFileAtPath:outputPath append:NO];
        
        [inStream open];
        [outStream open];
        
        BOOL isSuccessful = [self.crypto encrypt:inStream
                                              to:outStream
                                             for:publicKeys
                                           error:&encryptErr];
        
        [inStream close];
        [outStream close];
        
        if (!isSuccessful) {
            reject(
                   @"failed_to_encrypt",
                   [NSString stringWithFormat:@"Could not encrypt file; %@", [encryptErr localizedDescription]],
                   encryptErr
                   );
            return;
        }
        
        resolve(outputPath);
    });
}

RCT_EXPORT_METHOD(decryptFile:(NSString*)inputUri
                  toFile:(nullable NSString*)outputUri
                  with:(NSString*)privateKeyBase64
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSString* inputPath = [FSUtils getPathFromUri:inputUri];
    if ([[NSFileManager defaultManager] fileExistsAtPath:inputPath] == NO) {
        reject(@"invalid_input_file", [NSString stringWithFormat:@"File does not exist at path %@", inputUri], nil);
        return;
    }
    
    NSString* outputPath = outputUri == nil
    ? [FSUtils getTempFilePath:[inputPath pathExtension]]
    : [FSUtils getPathFromUri:outputUri];
    
    NSError* err = nil;
    BOOL isOutputReady = [FSUtils prepareFileForWriting:outputPath error:&err];
    if (!isOutputReady) {
        reject(@"invalid_output_file", [err description], err);
    }
    
    VSMVirgilKeyPair* keypair = [self.crypto importPrivateKeyFrom:[privateKeyBase64 dataUsingBase64] error:&err];
    if (nil == keypair) {
        reject(@"invalid_private_key", @"The given value is not a valid private key", err);
        return;
    }
    
    VSMVirgilPrivateKey* privateKey = keypair.privateKey;
    
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        NSError *decryptErr;
        NSInputStream *inputStream = [NSInputStream inputStreamWithFileAtPath:inputPath];
        NSOutputStream *outputStream = [NSOutputStream outputStreamToFileAtPath:outputPath append:NO];
        
        [inputStream open];
        [outputStream open];
        
        BOOL isSuccessful = [self.crypto decrypt:inputStream
                                              to:outputStream
                                            with:privateKey
                                           error:&decryptErr];
        
        [inputStream close];
        [outputStream close];
        
        if (!isSuccessful) {
            reject(
                   @"failed_to_decrypt",
                   [NSString stringWithFormat:@"Could not decrypt file; %@", [decryptErr localizedDescription]],
                   decryptErr
                   );
            return;
        }
        
        resolve(outputPath);
    });
}

RCT_EXPORT_METHOD(generateFileSignature:(NSString*)inputUri
                  with:(NSString*)privateKeyBase64
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSString* inputPath = [FSUtils getPathFromUri:inputUri];
    if ([[NSFileManager defaultManager] fileExistsAtPath:inputPath] == NO) {
        reject(@"invalid_input_file", [NSString stringWithFormat:@"File does not exist at path %@", inputUri], nil);
        return;
    }
    
    NSError* err = nil;
    VSMVirgilKeyPair* keypair = [self.crypto importPrivateKeyFrom:[privateKeyBase64 dataUsingBase64] error:&err];
    if (nil == keypair) {
        reject(@"invalid_private_key", @"The given value is not a valid private key", err);
        return;
    }
    
    VSMVirgilPrivateKey* privateKey = keypair.privateKey;
    
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        NSError *signErr;
        NSInputStream *inputStream = [NSInputStream inputStreamWithFileAtPath:inputPath];
        
        [inputStream open];
        NSData* signature = [self.crypto generateStreamSignatureOf:inputStream using:privateKey error:&signErr];
        [inputStream close];
        
        if (nil == signature) {
            reject(
                   @"failed_to_sign",
                   [NSString stringWithFormat:@"Could not generate signature of file; %@", [signErr localizedDescription]],
                   signErr
                   );
            return;
        }
        
        resolve([signature stringUsingBase64]);
    });
}

RCT_EXPORT_METHOD(verifyFileSignature:(NSString*)signatureBase64
                  ofFile:(NSString*)inputUri
                  with:(NSString*)publicKeyBase64
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSString* inputPath = [FSUtils getPathFromUri:inputUri];
    if ([[NSFileManager defaultManager] fileExistsAtPath:inputPath] == NO) {
        reject(@"invalid_input_file", [NSString stringWithFormat:@"File does not exist at path %@", inputPath], nil);
        return;
    }
    
    NSError* err = nil;
    VSMVirgilPublicKey* publicKey = [self.crypto importPublicKeyFrom:[publicKeyBase64 dataUsingBase64] error:&err];
    if (nil == publicKey) {
        reject(@"invalid_public_key", @"The given value is not a valid public key", err);
        return;
    }
    
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        NSInputStream *inStream = [NSInputStream inputStreamWithFileAtPath:inputPath];
        [inStream open];
        BOOL isValid = [self.crypto verifyStreamSignature_objc:[signatureBase64 dataUsingBase64] of:inStream with:publicKey];
        [inStream close];
        resolve(@(isValid));
    });
}
@end
