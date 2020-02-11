#import "KeyPairType.h"

@implementation KeyPairType

+ (NSDictionary *)values {
    return @{
        @"ED25519": @(VSMKeyPairTypeEd25519),
        @"CURVE25519": @(VSMKeyPairTypeCurve25519),
        @"SECP256R1": @(VSMKeyPairTypeSecp256r1),
        @"RSA2048": @(VSMKeyPairTypeRsa2048),
        @"RSA4096": @(VSMKeyPairTypeRsa4096),
        @"RSA8192": @(VSMKeyPairTypeRsa8192),
        @"CURVE25519_ED25519": @(VSMKeyPairTypeCurve25519Ed25519),
        @"CURVE25519_ROUND5_ED25519_FALCON": @(VSMKeyPairTypeCurve25519Round5Ed25519Falcon)
    };
}

@end
