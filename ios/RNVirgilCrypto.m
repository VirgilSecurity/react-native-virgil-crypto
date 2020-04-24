#import "RNVirgilCrypto.h"

@implementation RNVirgilCrypto

RCT_EXPORT_MODULE()

- (instancetype)init {
    self = [super init];
    self.crypto = [[VSMVirgilCrypto alloc] initWithDefaultKeyType:VSMKeyPairTypeEd25519 useSHA256Fingerprints:NO error:nil];
    return self;
}

- (NSDictionary *)constantsToExport {
    return @{
        @"KeyPairType": [KeyPairType values],
        @"HashAlgorithm": [HashAlgorithm values]
    };
}

+ (BOOL)requiresMainQueueSetup {
    return NO;
}

- (NSArray<VSMVirgilPublicKey *> *)importPublicKeys:(NSArray<NSString *> *)publicKeysBase64 error:(NSError **)error {
    NSMutableArray<VSMVirgilPublicKey *> *publicKeys = [NSMutableArray arrayWithCapacity:publicKeysBase64.count];
    for (NSString *publicKeyBase64 in publicKeysBase64) {
        VSMVirgilPublicKey *publicKey = [self.crypto importPublicKeyFrom:[publicKeyBase64 dataUsingBase64] error:error];
        if (publicKey == nil) {
            return nil;
        }
        [publicKeys addObject:publicKey];
    }
    return publicKeys;
}

- (NSDictionary *)exportKeyPair:(VSMVirgilKeyPair *)keyPair error:(NSError **)error {
    NSData *privateKeyData = [self.crypto exportPrivateKey:keyPair.privateKey error:error];
    if (privateKeyData == nil) {
        return nil;
    }
    NSData *publicKeyData = [self.crypto exportPublicKey:keyPair.publicKey error:error];
    if (publicKeyData == nil) {
        return nil;
    }
    return @{
        @"privateKey": [privateKeyData stringUsingBase64],
        @"publicKey": [publicKeyData stringUsingBase64],
        @"identifier": [keyPair.identifier stringUsingBase64]
    };
}

- (NSData *)computeHashFor:(NSData *)data using:(VSMHashAlgorithm)algorithm {
    return [self.crypto computeHashFor:data using:algorithm];
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(computeHash:(NSString *)dataBase64) {
    NSData *digest = [self computeHashFor:[dataBase64 dataUsingBase64] using:VSMHashAlgorithmSha512];
    return [ResponseFactory fromResult:[digest stringUsingBase64]];
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(computeHashWithAlgorithm:(NSString *)dataBase64 algorithm:(VSMHashAlgorithm)algorithm) {
    NSData *digest = [self computeHashFor:[dataBase64 dataUsingBase64] using:algorithm];
    return [ResponseFactory fromResult:[digest stringUsingBase64]];
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(generateKeyPair) {
    NSError *error;
    VSMVirgilKeyPair *keyPair = [self.crypto generateKeyPairAndReturnError:&error];
    if (keyPair == nil) {
        return [ResponseFactory fromError:error];
    }
    NSDictionary *result = [self exportKeyPair:keyPair error:&error];
    if (result == nil) {
        return [ResponseFactory fromError:error];
    }
    return [ResponseFactory fromResult:result];
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(generateKeyPairOfType:(VSMKeyPairType)keyPairType) {
    NSError *error;
    VSMVirgilKeyPair *keyPair = [self.crypto generateKeyPairOfType:keyPairType error:&error];
    if (keyPair == nil) {
        return [ResponseFactory fromError:error];
    }
    NSDictionary *result = [self exportKeyPair:keyPair error:&error];
    if (result == nil) {
        return [ResponseFactory fromError:error];
    }
    return [ResponseFactory fromResult:result];
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(generateKeyPairUsingSeed:(NSString *)seedBase64) {
    NSError *error;
    VSMVirgilKeyPair *keyPair = [self.crypto generateKeyPairUsingSeed:[seedBase64 dataUsingBase64] error:&error];
    if (keyPair == nil) {
        return [ResponseFactory fromError:error];
    }
    NSDictionary *result = [self exportKeyPair:keyPair error:&error];
    if (result == nil) {
        return [ResponseFactory fromError:error];
    }
    return [ResponseFactory fromResult:result];
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(encrypt:(NSString *)dataBase64 for:(NSArray<NSString *> *)publicKeysBase64 enablePadding:(BOOL)enablePadding) {
    NSError *error;
    NSArray<VSMVirgilPublicKey *> *publicKeys = [self importPublicKeys:publicKeysBase64 error:&error];
    if (publicKeys == nil) {
        return [ResponseFactory fromError:error];
    }
    NSData *encryptedData = [self.crypto encrypt:[dataBase64 dataUsingBase64] for:publicKeys enablePadding:enablePadding error:&error];
    if (encryptedData == nil) {
        return [ResponseFactory fromError:error];
    }
    return [ResponseFactory fromResult:[encryptedData stringUsingBase64]];
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(decrypt:(NSString *)dataBase64 with:(NSString *)privateKeyBase64) {
    NSError *error;
    VSMVirgilKeyPair *keyPair = [self.crypto importPrivateKeyFrom:[privateKeyBase64 dataUsingBase64] error:&error];
    if (keyPair == nil) {
        return [ResponseFactory fromError:error];
    }
    NSData *decryptedData = [self.crypto decrypt:[dataBase64 dataUsingBase64] with:keyPair.privateKey error:&error];
    if (decryptedData == nil) {
        return [ResponseFactory fromError:error];
    }
    return [ResponseFactory fromResult:[decryptedData stringUsingBase64]];
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(generateSignature:(NSString *)dataBase64 using:(NSString *)privateKeyBase64) {
    NSError *error;
    VSMVirgilKeyPair *keyPair = [self.crypto importPrivateKeyFrom:[privateKeyBase64 dataUsingBase64] error:&error];
    if (keyPair == nil) {
        return [ResponseFactory fromError:error];
    }
    NSData *signature = [self.crypto generateSignatureOf:[dataBase64 dataUsingBase64] using:keyPair.privateKey error:&error];
    if (signature == nil) {
        return [ResponseFactory fromError:error];
    }
    return [ResponseFactory fromResult:[signature stringUsingBase64]];
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(verifySignature:(NSString *)signatureBase64 of:(NSString *)dataBase64 with:(NSString *)publicKeyBase64) {
    NSError *error;
    VSMVirgilPublicKey *publicKey = [self.crypto importPublicKeyFrom:[publicKeyBase64 dataUsingBase64] error:&error];
    if (publicKey == nil) {
        return [ResponseFactory fromError:error];
    }
    BOOL isValid = [self.crypto verifySignature_objc:[signatureBase64 dataUsingBase64] of:[dataBase64 dataUsingBase64] with:publicKey];
    return [ResponseFactory fromResult:@(isValid)];
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(signAndEncrypt:(NSString *)dataBase64 with:(NSString *)privateKeyBase64 for:(NSArray<NSString *> *)publicKeysBase64 enablePadding:(BOOL)enablePadding) {
    NSError *error;
    VSMVirgilKeyPair *keyPair = [self.crypto importPrivateKeyFrom:[privateKeyBase64 dataUsingBase64] error:&error];
    if (keyPair == nil) {
        return [ResponseFactory fromError:error];
    }
    NSArray<VSMVirgilPublicKey *> *publicKeys = [self importPublicKeys:publicKeysBase64 error:&error];
    if (publicKeys == nil) {
        return [ResponseFactory fromError:error];
    }
    NSData *encryptedData = [self.crypto authEncrypt:[dataBase64 dataUsingBase64] with:keyPair.privateKey for:publicKeys enablePadding:enablePadding error:&error];
    if (encryptedData == nil) {
        return [ResponseFactory fromError: error];
    }
    return [ResponseFactory fromResult:[encryptedData stringUsingBase64]];
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(decryptAndVerify:(NSString *)dataBase64 with:(NSString*)privateKeyBase64 usingOneOf:(NSArray<NSString *> *)publicKeysBase64) {
    NSError *error;
    VSMVirgilKeyPair *keyPair = [self.crypto importPrivateKeyFrom:[privateKeyBase64 dataUsingBase64] error:&error];
    if (keyPair == nil) {
        return [ResponseFactory fromError:error];
    }
    NSArray<VSMVirgilPublicKey *> *publicKeys = [self importPublicKeys:publicKeysBase64 error:&error];
    if (publicKeys == nil) {
        return [ResponseFactory fromError:error];
    }
    NSData *decryptedData = [self.crypto authDecrypt:[dataBase64 dataUsingBase64] with:keyPair.privateKey usingOneOf:publicKeys error:&error];
    if (decryptedData == nil) {
        return [ResponseFactory fromError:error];
    }
    return [ResponseFactory fromResult:[decryptedData stringUsingBase64]];
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(signThenEncrypt:(NSString *)dataBase64 with:(NSString *)privateKeyBase64 for:(NSArray<NSString *> *)publicKeysBase64 enablePadding:(BOOL)enablePadding) {
    NSError *error;
    VSMVirgilKeyPair *keyPair = [self.crypto importPrivateKeyFrom:[privateKeyBase64 dataUsingBase64] error:&error];
    if (keyPair == nil) {
        return [ResponseFactory fromError:error];
    }
    NSArray<VSMVirgilPublicKey *> *publicKeys = [self importPublicKeys:publicKeysBase64 error:&error];
    if (publicKeys == nil) {
        return [ResponseFactory fromError:error];
    }
    NSData *encryptedData = [self.crypto signAndEncrypt:[dataBase64 dataUsingBase64] with:keyPair.privateKey for:publicKeys error:&error];
    if (encryptedData == nil) {
        return [ResponseFactory fromError: error];
    }
    return [ResponseFactory fromResult:[encryptedData stringUsingBase64]];
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(decryptThenVerify:(NSString *)dataBase64 with:(NSString*)privateKeyBase64 usingOneOf:(NSArray<NSString *> *)publicKeysBase64) {
    NSError *error;
    VSMVirgilKeyPair *keyPair = [self.crypto importPrivateKeyFrom:[privateKeyBase64 dataUsingBase64] error:&error];
    if (keyPair == nil) {
        return [ResponseFactory fromError:error];
    }
    NSArray<VSMVirgilPublicKey *> *publicKeys = [self importPublicKeys:publicKeysBase64 error:&error];
    if (publicKeys == nil) {
        return [ResponseFactory fromError:error];
    }
    NSData *decryptedData = [self.crypto decryptAndVerify:[dataBase64 dataUsingBase64] with:keyPair.privateKey usingOneOf:publicKeys error:&error];
    if (decryptedData == nil) {
        return [ResponseFactory fromError:error];
    }
    return [ResponseFactory fromResult:[decryptedData stringUsingBase64]];
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(getPrivateKeyIdentifier:(NSString *)privateKeyBase64) {
    NSError *error;
    VSMVirgilKeyPair *keyPair = [self.crypto importPrivateKeyFrom:[privateKeyBase64 dataUsingBase64] error:&error];
    if (keyPair == nil) {
        return [ResponseFactory fromError:error];
    }
    return [ResponseFactory fromResult:[keyPair.identifier stringUsingBase64]];
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(getPublicKeyIdentifier:(NSString *)publicKeyBase64) {
    NSError *error;
    VSMVirgilPublicKey *publicKey = [self.crypto importPublicKeyFrom:[publicKeyBase64 dataUsingBase64] error:&error];
    if (publicKey == nil) {
        return [ResponseFactory fromError:error];
    }
    return [ResponseFactory fromResult:[publicKey.identifier stringUsingBase64]];
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(extractPublicKey:(NSString *)privateKeyBase64) {
    NSError *error;
    VSMVirgilKeyPair *keyPair = [self.crypto importPrivateKeyFrom:[privateKeyBase64 dataUsingBase64] error:&error];
    if (keyPair == nil) {
        return [ResponseFactory fromError:error];
    }
    NSData *publicKeyData = [self.crypto exportPublicKey:keyPair.publicKey error:&error];
    if (publicKeyData == nil) {
        return [ResponseFactory fromError:error];
    }
    return [ResponseFactory fromResult:@{
        @"publicKey": [publicKeyData stringUsingBase64],
        @"identifier": [keyPair.identifier stringUsingBase64]
    }];
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(generateRandomData:(NSInteger)size) {
    NSError *error;
    NSData *randomData = [self.crypto generateRandomDataOfSize:size error:&error];
    if (randomData == nil) {
        return [ResponseFactory fromError:error];
    }
    return [ResponseFactory fromResult:[randomData stringUsingBase64]];
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(signThenEncryptDetached:(NSString *)dataBase64 with:(NSString *)privateKeyBase64 for:(NSArray<NSString *> *)publicKeysBase64 enablePadding:(BOOL)enablePadding) {
    NSError *error;
    VSMVirgilKeyPair *keyPair = [self.crypto importPrivateKeyFrom:[privateKeyBase64 dataUsingBase64] error:&error];
    if (keyPair == nil) {
        return [ResponseFactory fromError:error];
    }
    NSArray<VSMVirgilPublicKey *> *publicKeys = [self importPublicKeys:publicKeysBase64 error:&error];
    if (publicKeys == nil) {
        return [ResponseFactory fromError:error];
    }
    NSData *signature = [self.crypto generateSignatureOf:[dataBase64 dataUsingBase64] using:keyPair.privateKey error:&error];
    if (signature == nil) {
        return [ResponseFactory fromError:error];
    }
    VSCFAes256Gcm *aesGcm = [[VSCFAes256Gcm alloc] init];
    VSCFRecipientCipher *cipher = [[VSCFRecipientCipher alloc] init];
    [cipher setEncryptionCipherWithEncryptionCipher:aesGcm];
    [cipher setRandomWithRandom:self.crypto.rng];
    for (VSMVirgilPublicKey *publicKey in publicKeys) {
        [cipher addKeyRecipientWithRecipientId:publicKey.identifier publicKey:publicKey.key];
    }
    [[cipher customParams] addDataWithKey:VSMVirgilCrypto.CustomParamKeySignature value:signature];
    [[cipher customParams] addDataWithKey:VSMVirgilCrypto.CustomParamKeySignerId value:keyPair.privateKey.identifier];
    [cipher startEncryptionAndReturnError:&error];
    if (error != nil) {
        return [ResponseFactory fromError:error];
    }
    NSData *metadata = [cipher packMessageInfo];
    NSData *processedData = [cipher processEncryptionWithData:[dataBase64 dataUsingBase64] error:&error];
    if (processedData == nil) {
        return [ResponseFactory fromError:error];
    }
    NSData *finalData = [cipher finishEncryptionAndReturnError:&error];
    if (finalData == nil) {
        return [ResponseFactory fromError:error];
    }
    NSMutableData *encryptedData = [NSMutableData dataWithData:processedData];
    [encryptedData appendData:finalData];
    return [ResponseFactory fromResult:@{
        @"encryptedData": [encryptedData stringUsingBase64],
        @"metadata": [metadata stringUsingBase64],
    }];
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(decryptThenVerifyDetached:(NSString *)dataBase64 withMetadata:(NSString *)metadataBase64 andPrivateKey:(NSString *)privateKeyBase64 usingOneOf:(NSArray<NSString *> *)publicKeysBase64) {
    NSError *error;
    VSMVirgilKeyPair *keyPair = [self.crypto importPrivateKeyFrom:[privateKeyBase64 dataUsingBase64] error:&error];
    if (keyPair == nil) {
        return [ResponseFactory fromError:error];
    }
    NSArray<VSMVirgilPublicKey*> *publicKeys = [self importPublicKeys:publicKeysBase64 error:&error];
    if (publicKeys == nil) {
        return [ResponseFactory fromError:error];
    }
    NSMutableData *combinedData = [NSMutableData dataWithData:[metadataBase64 dataUsingBase64]];
    [combinedData appendData:[dataBase64 dataUsingBase64]];
    NSData *decryptedData = [self.crypto decryptAndVerify:combinedData with:keyPair.privateKey usingOneOf:publicKeys error:&error];
    if (decryptedData == nil) {
        return [ResponseFactory fromError:error];
    }
    return [ResponseFactory fromResult:[decryptedData stringUsingBase64]];
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(generateGroupSession:(NSString *)groupIdBase64) {
    NSError *error;
    NSData *sessionId = [self computeHashFor:[groupIdBase64 dataUsingBase64] using:VSMHashAlgorithmSha512];
    sessionId = [sessionId subdataWithRange:NSMakeRange(0, 32)];
    VSCFGroupSessionTicket *initialEpochTicket = [[VSCFGroupSessionTicket alloc] init];
    [initialEpochTicket setRngWithRng: self.crypto.rng];
    if ([initialEpochTicket setupTicketAsNewWithSessionId:sessionId error:&error] == NO) {
        return [ResponseFactory fromError:error];
    }
    VSCFGroupSessionMessage *initalEpochMessage = [initialEpochTicket getTicketMessage];
    return [ResponseFactory fromResult:@{
        @"sessionId": [sessionId stringUsingBase64],
        @"currentEpochNumber": @([initalEpochMessage getEpoch]),
        @"epochMessages": @[[[initalEpochMessage serialize] stringUsingBase64]]
    }];
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(importGroupSession:(NSArray<NSString *> *)epochMessagesBase64) {
    NSError *error;
    NSMutableArray<VSCFGroupSessionMessage *> *epochMessages = [NSMutableArray arrayWithCapacity:[epochMessagesBase64 count]];
    for (NSString *epochMessageBase64 in epochMessagesBase64) {
        VSCFGroupSessionMessage *epochMessage = [VSCFGroupSessionMessage deserializeWithInput:[epochMessageBase64 dataUsingBase64] error:&error];
        if (epochMessage == nil) {
            return [ResponseFactory fromError:error];
        }
        [epochMessages addObject:epochMessage];
    }
    NSArray<VSCFGroupSessionMessage *> *sortedEpochMessages = [epochMessages sortedArrayUsingComparator:^NSComparisonResult(VSCFGroupSessionMessage *a, VSCFGroupSessionMessage *b) {
        return [a getEpoch] - [b getEpoch];
    }];
    NSMutableArray<NSString *> *sortedSerializedEpochMessages = [NSMutableArray arrayWithCapacity:sortedEpochMessages.count];
    VSCFGroupSession *session = [[VSCFGroupSession alloc] init];
    [session setRngWithRng:self.crypto.rng];
    for (VSCFGroupSessionMessage *epochMessage in sortedEpochMessages) {
        if ([session addEpochWithMessage:epochMessage error:&error] == NO) {
            return [ResponseFactory fromError:error];
        }
        [sortedSerializedEpochMessages addObject:[[epochMessage serialize] stringUsingBase64]];
    }
    return [ResponseFactory fromResult:@{
        @"sessionId": [[session getSessionId] stringUsingBase64],
        @"currentEpochNumber": @([session getCurrentEpoch]),
        @"epochMessages": sortedSerializedEpochMessages
    }];
}

RCT_EXPORT_METHOD(encryptFile:(NSString *)inputUri toFile:(nullable NSString *)outputUri for:(NSArray<NSString *> *)publicKeysBase64 enablePadding:(BOOL)enablePadding resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *inputPath = [FSUtils getPathFromUri:inputUri];
    if ([[NSFileManager defaultManager] fileExistsAtPath:inputPath] == NO) {
        reject(@"invalid_input_file", [NSString stringWithFormat:@"File does not exist at path %@", inputPath], nil);
        return;
    }
    NSString *outputPath = outputUri == nil ? [FSUtils getTempFilePath:nil] : [FSUtils getPathFromUri:outputUri];
    NSError *error;
    BOOL isOutputReady = [FSUtils prepareFileForWriting:outputPath error:&error];
    if (isOutputReady == NO) {
        reject(@"invalid_output_file", error.localizedDescription, error);
    }
    NSArray<VSMVirgilPublicKey*> *publicKeys = [self importPublicKeys:publicKeysBase64 error:&error];
    if (publicKeys == nil) {
        reject(@"invalid_public_key", @"Public keys array contains invalid public keys", error);
        return;
    }
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        NSError *encryptError;
        NSInputStream *inputStream = [NSInputStream inputStreamWithFileAtPath:inputPath];
        NSOutputStream *outputStream = [NSOutputStream outputStreamToFileAtPath:outputPath append:NO];
        [inputStream open];
        [outputStream open];
        BOOL isSuccessful = [self.crypto encrypt:inputStream to:outputStream for:publicKeys enablePadding:enablePadding error:&encryptError];
        [inputStream close];
        [outputStream close];
        if (isSuccessful == NO) {
            reject(@"failed_to_encrypt", [NSString stringWithFormat:@"Could not encrypt file; %@", encryptError.localizedDescription], encryptError);
            return;
        }
        resolve(outputPath);
    });
}

RCT_EXPORT_METHOD(decryptFile:(NSString *)inputUri toFile:(nullable NSString *)outputUri with:(NSString *)privateKeyBase64 resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *inputPath = [FSUtils getPathFromUri:inputUri];
    if ([[NSFileManager defaultManager] fileExistsAtPath:inputPath] == NO) {
        reject(@"invalid_input_file", [NSString stringWithFormat:@"File does not exist at path %@", inputUri], nil);
        return;
    }
    NSString *outputPath = outputUri == nil ? [FSUtils getTempFilePath:[inputPath pathExtension]] : [FSUtils getPathFromUri:outputUri];
    NSError *error;
    BOOL isOutputReady = [FSUtils prepareFileForWriting:outputPath error:&error];
    if (isOutputReady == NO) {
        reject(@"invalid_output_file", error.localizedDescription, error);
        return;
    }
    VSMVirgilKeyPair *keyPair = [self.crypto importPrivateKeyFrom:[privateKeyBase64 dataUsingBase64] error:&error];
    if (keyPair == nil) {
        reject(@"invalid_private_key", @"The given value is not a valid private key", error);
        return;
    }
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        NSError *decryptError;
        NSInputStream *inputStream = [NSInputStream inputStreamWithFileAtPath:inputPath];
        NSOutputStream *outputStream = [NSOutputStream outputStreamToFileAtPath:outputPath append:NO];
        [inputStream open];
        [outputStream open];
        BOOL isSuccessful = [self.crypto decrypt:inputStream to:outputStream with:keyPair.privateKey error:&decryptError];
        [inputStream close];
        [outputStream close];
        if (isSuccessful == NO) {
            reject(@"failed_to_decrypt", [NSString stringWithFormat:@"Could not decrypt file; %@", decryptError.localizedDescription], decryptError);
            return;
        }
        resolve(outputPath);
    });
}

RCT_EXPORT_METHOD(generateFileSignature:(NSString *)inputUri with:(NSString *)privateKeyBase64 resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *inputPath = [FSUtils getPathFromUri:inputUri];
    if ([[NSFileManager defaultManager] fileExistsAtPath:inputPath] == NO) {
        reject(@"invalid_input_file", [NSString stringWithFormat:@"File does not exist at path %@", inputUri], nil);
        return;
    }
    NSError *error;
    VSMVirgilKeyPair *keyPair = [self.crypto importPrivateKeyFrom:[privateKeyBase64 dataUsingBase64] error:&error];
    if (keyPair == nil) {
        reject(@"invalid_private_key", @"The given value is not a valid private key", error);
        return;
    }
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        NSError *signError;
        NSInputStream *inputStream = [NSInputStream inputStreamWithFileAtPath:inputPath];
        [inputStream open];
        NSData *signature = [self.crypto generateStreamSignatureOf:inputStream using:keyPair.privateKey error:&signError];
        [inputStream close];
        if (signature == nil) {
            reject(@"failed_to_sign", [NSString stringWithFormat:@"Could not generate signature of file; %@", signError.localizedDescription], signError);
            return;
        }
        resolve([signature stringUsingBase64]);
    });
}

RCT_EXPORT_METHOD(verifyFileSignature:(NSString *)signatureBase64 ofFile:(NSString *)inputUri with:(NSString *)publicKeyBase64 resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *inputPath = [FSUtils getPathFromUri:inputUri];
    if ([[NSFileManager defaultManager] fileExistsAtPath:inputPath] == NO) {
        reject(@"invalid_input_file", [NSString stringWithFormat:@"File does not exist at path %@", inputPath], nil);
        return;
    }
    NSError *error;
    VSMVirgilPublicKey *publicKey = [self.crypto importPublicKeyFrom:[publicKeyBase64 dataUsingBase64] error:&error];
    if (publicKey == nil) {
        reject(@"invalid_public_key", @"The given value is not a valid public key", error);
        return;
    }
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        NSInputStream *inputStream = [NSInputStream inputStreamWithFileAtPath:inputPath];
        [inputStream open];
        BOOL isValid = [self.crypto verifyStreamSignature_objc:[signatureBase64 dataUsingBase64] of:inputStream with:publicKey];
        [inputStream close];
        resolve(@(isValid));
    });
}

@end
