#import "NSData+Encoding.h"

@implementation NSData (Encoding)

- (NSString *)stringUsingBase64 {
    return [self base64EncodedStringWithOptions:0];
}

@end
