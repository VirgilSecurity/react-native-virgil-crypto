
#import "RNVirgilCrypto.h"

NSDictionary<NSString *, id>* CreateResponse(NSError* error, id result)
{
    NSMutableDictionary* response = [NSMutableDictionary dictionaryWithCapacity:1];
    if (nil != result) {
        response[@"result"] = result;
    } else if (nil != error) {
        response[@"error"] = RCTJSErrorFromNSError(error);
    } else {
        @throw [NSException exceptionWithName:NSInvalidArgumentException reason:@"Either result or error argument must be provided" userInfo:nil];
    }
    return response;
}

NSData* DecodeBase64(NSString* str)
{
    return [[NSData alloc] initWithBase64EncodedString:str options:0];
}

NSString* EncodeBase64(NSData* data)
{
    return [data base64EncodedStringWithOptions:0];
}

NSData* DecodeUtf8(NSString* str)
{
    return [str dataUsingEncoding:NSUTF8StringEncoding];
}

NSString* EncodeUtf8(NSData* data)
{
    return [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
}

@implementation RNVirgilCrypto

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

- (instancetype)init
{
    if (self = [super init])
    {
        VSMVirgilCrypto* vc = [VSMVirgilCrypto alloc];
        self.crypto = [vc initWithDefaultKeyType:VSMKeyPairTypeEd25519 useSHA256Fingerprints:NO error:nil];
    }

    return self;
}

 + (BOOL)requiresMainQueueSetup
 {
     return NO;
 }

RCT_EXPORT_MODULE()

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, computeHash:(NSString *)str) {
    NSData* result = [self.crypto computeHashFor:DecodeUtf8(str) using:VSMHashAlgorithmSha512];
    return CreateResponse(nil, EncodeBase64(result));
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, generateKeyPair) {
    NSError* err;
    VSMVirgilKeyPair* keypair = [self.crypto generateKeyPairAndReturnError:&err];
    if (nil == keypair) {
       return CreateResponse(err, nil);
    }
    NSData* privateKeyData = [self.crypto exportPrivateKey:keypair.privateKey error:&err];
    if (nil == privateKeyData) {
       return CreateResponse(err, nil);
    }
    NSData* publicKeyData = [self.crypto exportPublicKey:keypair.publicKey error:&err];
    if (nil == publicKeyData) {
       return CreateResponse(err, nil);
    }

    NSDictionary* result = @{ @"privateKey": EncodeBase64(privateKeyData),
                              @"publicKey": EncodeBase64(publicKeyData) };

    return CreateResponse(nil, result);
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, encrypt:(NSString*)str for:(NSArray<NSString*>*)recipients) {
    __block NSError* importErr;
    NSMutableArray<VSMVirgilPublicKey*>* publicKeys = [NSMutableArray arrayWithCapacity:[recipients count]];
    [recipients enumerateObjectsUsingBlock: ^(NSString* recipient, NSUInteger idx, BOOL *stop) {
        VSMVirgilPublicKey* publicKey = [self.crypto importPublicKeyFrom:DecodeBase64(recipient) error:&importErr];
        if (nil == publicKey) {
            *stop = YES;
        } else {
            [publicKeys addObject:publicKey];
        }
        
    }];
    
    if ([publicKeys count] < [recipients count]) {
        return CreateResponse(importErr, nil);
    }
    
    NSError* encryptErr;
    NSData* encryptedData = [self.crypto encrypt:DecodeUtf8(str) for:publicKeys error:&encryptErr];
    if (nil == encryptedData) {
        return CreateResponse(encryptErr, nil);
    }
    
    return CreateResponse(nil, EncodeBase64(encryptedData));
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, decrypt:(NSString*)dataBase64 with:(NSString*)privateKeyBase64) {
    NSError* err;
    VSMVirgilKeyPair* keypair = [self.crypto importPrivateKeyFrom:DecodeBase64(privateKeyBase64) error:&err];
    if (nil == keypair) {
        return CreateResponse(err, nil);
    }
    NSData* decryptedData = [self.crypto decrypt:DecodeBase64(dataBase64) with:keypair.privateKey error:&err];
    if (nil == decryptedData) {
        return CreateResponse(err, nil);
    }
    return CreateResponse(nil, EncodeUtf8(decryptedData));
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, generateSignature:(NSString*)dataBase64 using:(NSString*)privateKeyBase64)
{
    NSError* err;
    VSMVirgilKeyPair* keypair = [self.crypto importPrivateKeyFrom:DecodeBase64(privateKeyBase64) error:&err];
    if (nil == keypair) {
        return CreateResponse(err, nil);
    }
    
    NSData* signature = [self.crypto generateSignatureOf:DecodeBase64(dataBase64) using:keypair.privateKey error:&err];
    if (nil == signature) {
        return CreateResponse(err, nil);
    }
    return CreateResponse(nil, EncodeBase64(signature));
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, verifySignature:(NSString*) signatureBase64 of:(NSString*) dataBase64 with: (NSString*) publicKeyBase64)
{
    NSError* err;
    VSMVirgilPublicKey* publicKey = [self.crypto importPublicKeyFrom:DecodeBase64(publicKeyBase64) error:&err];
    if (nil == publicKey) {
        return CreateResponse(err, nil);
    }
    
    BOOL isValid = [self.crypto verifySignature_objc:DecodeBase64(signatureBase64) of:DecodeBase64(dataBase64) with:publicKey];
    return CreateResponse(nil, @(isValid));
}
@end
