//
//  RCTConvert+KeyPairType.h
//  RNVirgilCrypto
//
//  Created by vadim on 8/2/19.
//  Copyright © 2019 Virgil Security, Inc. All rights reserved.
//

#if __has_include("RCTConvert.h")
#import "RCTConvert.h"
#else
#import <React/RCTConvert.h>
#endif

#if __has_include(<VirgilCrypto/VirgilCrypto-Swift.h>)
#import <VirgilCrypto/VirgilCrypto-Swift.h>
#else
#import "VirgilCrypto-Swift.h"
#endif

NS_ASSUME_NONNULL_BEGIN

@interface RCTConvert (KeyPairType)

@end

NS_ASSUME_NONNULL_END
