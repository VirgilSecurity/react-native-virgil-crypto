//
//  RCTConvert+HashAlgorithm.m
//  RNVirgilCrypto
//
//  Created by vadim on 8/5/19.
//  Copyright © 2019 Virgil Security, Inc. All rights reserved.
//

#import "RCTConvert+HashAlgorithm.h"

@implementation RCTConvert (HashAlgorithm)

RCT_ENUM_CONVERTER(VSMHashAlgorithm, (@{ @"SHA224": @(VSMHashAlgorithmSha224),
                                         @"SHA256": @(VSMHashAlgorithmSha256),
                                         @"SHA384": @(VSMHashAlgorithmSha384),
                                         @"SHA512": @(VSMHashAlgorithmSha512) }),
                   VSMHashAlgorithmSha512, integerValue)

@end
