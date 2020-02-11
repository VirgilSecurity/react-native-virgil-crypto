#import "RCTConvert+KeyPairType.h"

@implementation RCTConvert (KeyPairType)

RCT_ENUM_CONVERTER(VSMKeyPairType, [KeyPairType values], VSMKeyPairTypeEd25519, integerValue)

@end
