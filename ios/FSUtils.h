#import <Foundation/Foundation.h>

#import "Constants.h"

@interface FSUtils : NSObject

+ (NSString *_Nonnull)getPathFromUri:(NSString *_Nonnull)uri;
+ (NSString *_Nonnull)getTempFilePath:(NSString *_Nonnull)ext;
+ (BOOL)prepareFileForWriting:(NSString *_Nonnull)path error:(NSError *_Nullable*_Nullable)outError;

@end
