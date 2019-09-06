//
//  RNVirgilBrainKeyCrypto.h
//  RNVirgilCrypto
//
//  Created by vadim on 9/2/19.
//  Copyright © 2019 Virgil Security, Inc. All rights reserved.
//

#ifndef RNVirgilBrainKeyCrypto_h
#define RNVirgilBrainKeyCrypto_h


#endif /* RNVirgilBrainKeyCrypto_h */


#if __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#else
#import <React/RCTBridgeModule.h>
#endif

#if __has_include(<VirgilCryptoPythia/VirgilCryptoPythia-Swift.h>)
#import <VirgilCryptoPythia/VirgilCryptoPythia-Swift.h>
#else
#import "VirgilCryptoPythia-Swift.h"
#endif


#import "NSData+Encodings.h"
#import "NSString+Encodings.h"
#import "ResponseFactory.h"

@interface RNVirgilBrainKeyCrypto : NSObject <RCTBridgeModule>

@end

