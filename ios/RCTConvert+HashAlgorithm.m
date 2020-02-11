#import "RCTConvert+HashAlgorithm.h"

@implementation RCTConvert (HashAlgorithm)

RCT_ENUM_CONVERTER(VSMHashAlgorithm, [HashAlgorithm values], VSMHashAlgorithmSha512, integerValue)

@end
