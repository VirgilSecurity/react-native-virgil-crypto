#import "HashAlgorithm.h"

@implementation HashAlgorithm

+ (NSDictionary *)values {
    return @{
        @"SHA224": @(VSMHashAlgorithmSha224),
        @"SHA256": @(VSMHashAlgorithmSha256),
        @"SHA384": @(VSMHashAlgorithmSha384),
        @"SHA512": @(VSMHashAlgorithmSha512)
    };
}

@end
