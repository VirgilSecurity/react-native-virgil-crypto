//
//  RNVirgilBrainKeyCrypto.m
//  RNVirgilCrypto
//
//  Created by vadim on 9/2/19.
//  Copyright © 2019 Virgil Security, Inc. All rights reserved.
//

#import "RNVirgilBrainKeyCrypto.h"

@implementation RNVirgilBrainKeyCrypto

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

- (instancetype)init
{
    if (self = [super init])
    {
        [VSCPPythia configureAndReturnError: nil];
    }
    
    return self;
}

- (void)dealloc {
    [VSCPPythia cleanup];
}

+ (BOOL)requiresMainQueueSetup
{
    return NO;
}

RCT_EXPORT_MODULE()

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(blind:(NSString*)passwordBase64)
{
    NSError *err;
    VSCPPythiaBlindResult *blindResult = [VSCPPythia blindWithPassword:[passwordBase64 dataUsingBase64] error:&err];
    if (nil == blindResult) {
        return [ResponseFactory fromError:err];
    }
    
    return [ResponseFactory fromResult:@{ @"blindedPassword": [blindResult.blindedPassword stringUsingBase64],
                                          @"blindingSecret": [blindResult.blindingSecret stringUsingBase64]
                                          }];
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(deblind:(NSString*)transformedPasswordBase64 blindingSecret:(NSString*)blindingSecretBase64)
{
    NSError *err;
    NSData *deblindResult = [VSCPPythia deblindWithTransformedPassword:[transformedPasswordBase64 dataUsingBase64]
                                                        blindingSecret:[blindingSecretBase64 dataUsingBase64]
                                                                 error:&err];
    if (nil == deblindResult) {
        return [ResponseFactory fromError:err];
    }
    
    return [ResponseFactory fromResult:[deblindResult stringUsingBase64]];
}

@end
