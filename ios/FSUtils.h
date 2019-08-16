//
//  FSUtils.h
//  RNVirgilCrypto
//
//  Created by vadim on 8/16/19.
//  Copyright © 2019 Virgil Security, Inc. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface FSUtils : NSObject

+ (NSString*) getPathFromUri:(NSString* _Nonnull)uri;
+ (NSString*) getTempFilePath:(NSString* _Nullable)ext;
+ (BOOL) prepareFileForWriting:(NSString* _Nonnull)path error:(NSError** _Nullable) outError;

@end
