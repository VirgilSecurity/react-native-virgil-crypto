
#import "RNVirgilCrypto.h"

@implementation RNVirgilCrypto

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

- (instancetype)init
{
    if (self = [super init])
    {
        self.crypto = [[VSMVirgilCrypto alloc] initWithDefaultKeyType:VSMKeyPairTypeEd25519 useSHA256Fingerprints:NO error:nil];
    }

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

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, computeHash:(NSString *)dataUtf8) {
    NSData* result = [self computeHashFor:[dataUtf8 dataUsingUtf8] using:VSMHashAlgorithmSha512];
    return [ResponseFactory fromResult:[result stringUsingBase64]];
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, computeHashWithAlgorithm:(NSString *)dataUtf8 algorithm:(VSMHashAlgorithm) alg) {
    NSData* result = [self computeHashFor:[dataUtf8 dataUsingUtf8] using:alg];
    return [ResponseFactory fromResult:[result stringUsingBase64]];
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, generateKeyPair) {
    NSError* err;
    VSMVirgilKeyPair* keypair = [self.crypto generateKeyPairAndReturnError:&err];
    if (nil == keypair) {
        return [ResponseFactory fromError:err];
    }
    
    NSDictionary* result = [self exportAndEncodeKeyPair:keypair error:&err];
    if (nil == result) {
        return [ResponseFactory fromError:err];
    }
    
    return [ResponseFactory fromResult:result];
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, generateKeyPairOfType: (VSMKeyPairType)type) {
    NSError* err;
    VSMVirgilKeyPair* keypair = [self.crypto generateKeyPairOfType:type error:&err];
    if (nil == keypair) {
        return [ResponseFactory fromError:err];
    }
    
    NSDictionary* result = [self exportAndEncodeKeyPair:keypair error:&err];
    if (nil == result) {
        return [ResponseFactory fromError:err];
    }
    
    return [ResponseFactory fromResult:result];
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, encrypt:(NSString*)str for:(NSArray<NSString*>*)recipientsBase64) {
    NSError* importErr;
    NSArray<VSMVirgilPublicKey*>* publicKeys = [self decodeAndImportPublicKeys:recipientsBase64 error:&importErr];
    if (nil == publicKeys) {
        return [ResponseFactory fromError:importErr];
    }
    
    NSError* encryptErr;
    NSData* encryptedData = [self.crypto encrypt:[str dataUsingUtf8] for:publicKeys error:&encryptErr];
    if (nil == encryptedData) {
        return [ResponseFactory fromError:encryptErr];
    }
    
    return [ResponseFactory fromResult:[encryptedData stringUsingBase64]];
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, decrypt:(NSString*)dataBase64 with:(NSString*)privateKeyBase64) {
    NSError* err;
    VSMVirgilKeyPair* keypair = [self.crypto importPrivateKeyFrom:[privateKeyBase64 dataUsingBase64] error:&err];
    if (nil == keypair) {
        return [ResponseFactory fromError:err];
    }
    NSData* decryptedData = [self.crypto decrypt:[dataBase64 dataUsingBase64] with:keypair.privateKey error:&err];
    if (nil == decryptedData) {
        return [ResponseFactory fromError:err];
    }
    return [ResponseFactory fromResult:[decryptedData stringUsingUtf8]];
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, generateSignature:(NSString*)dataBase64 using:(NSString*)privateKeyBase64)
{
    NSError* err;
    VSMVirgilKeyPair* keypair = [self.crypto importPrivateKeyFrom:[privateKeyBase64 dataUsingBase64] error:&err];
    if (nil == keypair) {
        return [ResponseFactory fromError:err];
    }
    
    NSData* signature = [self.crypto generateSignatureOf:[dataBase64 dataUsingBase64] using:keypair.privateKey error:&err];
    if (nil == signature) {
        return [ResponseFactory fromError:err];
    }
    return [ResponseFactory fromResult:[signature stringUsingBase64]];
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, verifySignature:(NSString*) signatureBase64 of:(NSString*) dataBase64 with: (NSString*) publicKeyBase64)
{
    NSError* err;
    VSMVirgilPublicKey* publicKey = [self.crypto importPublicKeyFrom:[publicKeyBase64 dataUsingBase64] error:&err];
    if (nil == publicKey) {
        return [ResponseFactory fromError:err];
    }
    
    BOOL isValid = [self.crypto verifySignature_objc:[signatureBase64 dataUsingBase64] of:[dataBase64 dataUsingBase64] with:publicKey];
    return [ResponseFactory fromResult:@(isValid)];
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, signAndEncrypt:(NSString*) dataUtf8 with:(NSString*) privateKeyBase64 for:(NSArray<NSString*>*) recipientsBase64)
{
    NSError* err;
    VSMVirgilKeyPair* keypair = [self.crypto importPrivateKeyFrom:[privateKeyBase64 dataUsingBase64] error:&err];
    if (nil == keypair) {
        return [ResponseFactory fromError:err];
    }
    
    NSArray<VSMVirgilPublicKey*>* publicKeys = [self decodeAndImportPublicKeys:recipientsBase64 error:&err];
    if (nil == publicKeys) {
        return [ResponseFactory fromError:err];
    }
    
    NSData* encryptedData = [self.crypto signAndEncrypt:[dataUtf8 dataUsingUtf8] with:keypair.privateKey for:publicKeys error:&err];
    if (nil == encryptedData) {
        return [ResponseFactory fromError:err];
    }
    
    return [ResponseFactory fromResult:[encryptedData stringUsingBase64]];
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, decryptAndVerify:(NSString*) dataBase64 with:(NSString*)privateKeyBase64 usingOneOf:(NSArray<NSString*>*) sendersPublicKeysBase64)
{
    NSError* err;
    VSMVirgilKeyPair* keypair = [self.crypto importPrivateKeyFrom:[privateKeyBase64 dataUsingBase64] error:&err];
    if (nil == keypair) {
        return [ResponseFactory fromError:err];
    }
    
    NSArray<VSMVirgilPublicKey*>* publicKeys = [self decodeAndImportPublicKeys:sendersPublicKeysBase64 error:&err];
    if (nil == publicKeys) {
        return [ResponseFactory fromError:err];
    }
    
    NSData* decryptedData = [self.crypto decryptAndVerify:[dataBase64 dataUsingBase64] with:keypair.privateKey usingOneOf:publicKeys error:&err];
    if (nil == decryptedData) {
        return [ResponseFactory fromError:err];
    }
    
    return [ResponseFactory fromResult:[decryptedData stringUsingUtf8]];
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, extractPublicKey:(NSString*) privateKeyBase64)
{
    NSError* err;
    VSMVirgilKeyPair* keypair = [self.crypto importPrivateKeyFrom:[privateKeyBase64 dataUsingBase64] error:&err];
    if (nil == keypair) {
        return [ResponseFactory fromError:err];
    }
    
    NSData* publicKeyData = [self.crypto exportPublicKey:keypair.publicKey error:&err];
    if (nil == publicKeyData) {
        return [ResponseFactory fromError:err];
    }
    
    return [ResponseFactory fromResult:[publicKeyData stringUsingBase64]];
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, generateRandomData:(NSInteger)size)
{
    NSError* err;
    NSData* randomData = [self.crypto generateRandomDataOfSize:size error:&err];
    if (nil == randomData) {
        return [ResponseFactory fromError:err];
    }
    
    return [ResponseFactory fromResult:[randomData stringUsingBase64]];
}
@end
