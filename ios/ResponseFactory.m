#import "ResponseFactory.h"

@implementation ResponseFactory

+ (id)fromResult:(id)result {
    return @{ @"result": result };
}

+ (id)fromError:(NSError *)error {
    return @{ @"error": RCTJSErrorFromNSError(error) };
}

@end
