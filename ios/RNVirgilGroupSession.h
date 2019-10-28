//
//  RNVirgilGroupSession.h
//  RNVirgilCrypto
//
//  Created by vadim on 9/19/19.
//  Copyright © 2019 Virgil Security, Inc. All rights reserved.
//

#ifndef RNVirgilGroupSession_h
#define RNVirgilGroupSession_h


#endif /* RNVirgilGroupSession_h */

#if __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#else
#import <React/RCTBridgeModule.h>
#endif

#if __has_include(<VirgilCryptoFoundation/VirgilCryptoFoundation-Swift.h>)
#import <VirgilCryptoFoundation/VirgilCryptoFoundation-Swift.h>
#else
#import "VirgilCryptoFoundation-Swift.h"
#endif


#import "NSData+Encodings.h"
#import "NSString+Encodings.h"
#import "ResponseFactory.h"

@interface RNVirgilGroupSession : NSObject <RCTBridgeModule>

@property (nonatomic, retain) VSCFCtrDrbg *rng;
@property (nonatomic, retain) VSCFKeyProvider *keyProvider;

@end
