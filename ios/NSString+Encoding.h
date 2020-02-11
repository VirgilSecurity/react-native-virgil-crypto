#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface NSString (Encoding)

- (NSData *)dataUsingBase64;

@end

NS_ASSUME_NONNULL_END
