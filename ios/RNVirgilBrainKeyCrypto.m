#import "RNVirgilBrainKeyCrypto.h"

@implementation RNVirgilBrainKeyCrypto

RCT_EXPORT_MODULE()

- (instancetype)init {
    if (self = [super init]) {
        [VSCPPythia configureAndReturnError:nil];
    }
    return self;
}

- (void)dealloc {
    [VSCPPythia cleanup];
}

+ (BOOL)requiresMainQueueSetup {
    return NO;
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(blind:(NSString *)passwordBase64) {
    NSError *error;
    VSCPPythiaBlindResult *blindResult = [VSCPPythia blindWithPassword:[passwordBase64 dataUsingBase64] error:&error];
    if (blindResult == nil) {
        return [ResponseFactory fromError:error];
    }
    return [ResponseFactory fromResult:@{
        @"blindedPassword": [blindResult.blindedPassword stringUsingBase64],
        @"blindingSecret": [blindResult.blindingSecret stringUsingBase64]
    }];
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(deblind:(NSString *)transformedPasswordBase64 blindingSecret:(NSString *)blindingSecretBase64) {
    NSError *error;
    NSData *deblindResult = [VSCPPythia deblindWithTransformedPassword:[transformedPasswordBase64 dataUsingBase64] blindingSecret:[blindingSecretBase64 dataUsingBase64] error:&error];
    if (deblindResult == nil) {
        return [ResponseFactory fromError:error];
    }
    return [ResponseFactory fromResult:[deblindResult stringUsingBase64]];
}

@end
