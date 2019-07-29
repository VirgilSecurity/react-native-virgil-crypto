
#import "RNVirgilCrypto.h"

NSDictionary<NSString *, id> *CreateResponse(id result, NSError* error)
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
    NSData* result = [self.crypto computeHashFor:([str dataUsingEncoding:NSUTF8StringEncoding]) using:VSMHashAlgorithmSha512];
    return CreateResponse([result base64EncodedStringWithOptions:0], nil);
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, generateKeyPair) {
    NSError* err;
    VSMVirgilKeyPair* keypair = [self.crypto generateKeyPairAndReturnError:&err];
    if (nil == keypair) {
       return CreateResponse(nil, err);
    }
    NSData* privateKeyData = [self.crypto exportPrivateKey:keypair.privateKey error:&err];
    if (nil == privateKeyData) {
       return CreateResponse(nil, err);
    }
    NSData* publicKeyData = [self.crypto exportPublicKey:keypair.publicKey error:&err];
    if (nil == publicKeyData) {
       return CreateResponse(nil, err);
    }

    NSDictionary* result = @{ @"privateKey": [privateKeyData base64EncodedStringWithOptions:0],
                              @"publicKey": [publicKeyData base64EncodedStringWithOptions:0] };

    return CreateResponse(result, nil);
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, encrypt:(NSString*)str for:(NSArray<NSString*>*)recipients) {
    __block NSError* importError;
    NSMutableArray<VSMVirgilPublicKey*>* publicKeys = [NSMutableArray arrayWithCapacity:[recipients count]];
    [recipients enumerateObjectsUsingBlock: ^(NSString* recipient, NSUInteger idx, BOOL *stop) {
        NSData* publicKeyData = [[NSData alloc] initWithBase64EncodedString:recipient options:0];
        VSMVirgilPublicKey* publicKey = [self.crypto importPublicKeyFrom:publicKeyData error:&importError];
        if (nil == publicKey) {
            *stop = YES;
        } else {
            [publicKeys addObject:publicKey];
        }
        
    }];
    
    if ([publicKeys count] < [recipients count]) {
        return CreateResponse(nil, importError);
    }
    
    NSError* encryptErr;
    NSData* encryptedData = [self.crypto encrypt:[str dataUsingEncoding:NSUTF8StringEncoding] for: publicKeys error:&encryptErr];
    return CreateResponse([encryptedData base64EncodedStringWithOptions:0], nil);
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(id, decrypt:(NSString*)dataBase64 with:(NSString*)privateKeyBase64) {
    NSError* err;
    VSMVirgilKeyPair* keypair = [self.crypto importPrivateKeyFrom:[[NSData alloc] initWithBase64EncodedString:privateKeyBase64 options:0] error:&err];
    if (nil == keypair) {
        return CreateResponse(nil, err);
    }
    NSData* decryptedData = [self.crypto decrypt:[[NSData alloc] initWithBase64EncodedString:dataBase64 options:0] with:keypair.privateKey error:&err];
    if (nil == decryptedData) {
        return CreateResponse(nil, err);
    }
    return CreateResponse([[NSString alloc] initWithData:decryptedData encoding:NSUTF8StringEncoding], nil);
}
@end
