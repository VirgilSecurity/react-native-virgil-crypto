
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
        VSMVirgilCrypto* vc = [VSMVirgilCrypto alloc];
        NSError* err = nil;
        self.crypto = [vc initWithDefaultKeyType:VSMKeyPairTypeEd25519 useSHA256Fingerprints:NO error:&err];
    }

    return self;
}

 + (BOOL)requiresMainQueueSetup
 {
     return NO;
 }

RCT_EXPORT_MODULE()

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(NSString*, computeHash:(NSString *)str) {
    NSData *result = [self.crypto computeHashFor:([str dataUsingEncoding:NSUTF8StringEncoding]) using:VSMHashAlgorithmSha512];
    return [result base64EncodedStringWithOptions:0];
}

@end
  
