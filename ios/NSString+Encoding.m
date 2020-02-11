#import "NSString+Encoding.h"

@implementation NSString (Encoding)

- (NSData *)dataUsingBase64 {
    return [[NSData alloc] initWithBase64EncodedString:self options:0];
}

@end
