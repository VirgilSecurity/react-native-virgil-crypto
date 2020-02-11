#import <React/RCTUtils.h>

@interface ResponseFactory : NSObject

+ (id)fromResult:(id)result;
+ (id)fromError:(NSError *)error;

@end
