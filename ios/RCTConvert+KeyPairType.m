//
//  RCTConvert+KeyPairType.m
//  RNVirgilCrypto
//
//  Created by vadim on 8/2/19.
//  Copyright © 2019 Virgil Security, Inc. All rights reserved.
//

#import "RCTConvert+KeyPairType.h"

@implementation RCTConvert (KeyPairType)
RCT_ENUM_CONVERTER(VSMKeyPairType, (@{ @"ED25519": @(VSMKeyPairTypeEd25519),
                                       @"CURVE25519": @(VSMKeyPairTypeCurve25519),
                                       @"SECP256R1": @(VSMKeyPairTypeSecp256r1),
                                       @"RSA2048": @(VSMKeyPairTypeRsa2048),
                                       @"RSA4096": @(VSMKeyPairTypeRsa4096),
                                       @"RSA8192": @(VSMKeyPairTypeRsa8192) }),
                   VSMKeyPairTypeEd25519, integerValue)
@end
