//
//  FSUtils.m
//  RNVirgilCrypto
//
//  Created by vadim on 8/16/19.
//  Copyright © 2019 Virgil Security, Inc. All rights reserved.
//  Some code originally from https://github.com/joltup/rn-fetch-blob/blob/master/ios/RNFetchBlobFS.m
//

#import <Foundation/Foundation.h>
#import "FSUtils.h"
#import "Constants.h"

@implementation FSUtils

+ (NSString *) getPathFromUri:(NSString *)uri
{
    if([uri hasPrefix:RNVC_ASSET_PREFIX])
    {
        uri = [uri stringByReplacingOccurrencesOfString:RNVC_ASSET_PREFIX withString:@""];
        uri = [[NSBundle mainBundle] pathForResource: [uri stringByDeletingPathExtension]
                                              ofType: [uri pathExtension]];
    }
    return uri;
}

+ (NSString *) getTempFilePath:(nullable NSString *)ext
{
    NSString* tempFileName = [[NSUUID UUID] UUIDString];
    if (ext != nil) {
        tempFileName = [tempFileName stringByAppendingString:[NSString stringWithFormat:@".%@", ext]];
    }
    return [NSTemporaryDirectory() stringByAppendingPathComponent:tempFileName];
}

+ (BOOL) prepareFileForWriting:(NSString *)path error:(NSError* __autoreleasing *) outError
{
    NSError* err = nil;
    NSFileManager* fm = [NSFileManager defaultManager];
    NSString* folder = [path stringByDeletingLastPathComponent];
    
    BOOL isDirectory = NO;
    BOOL exists = [fm fileExistsAtPath:path isDirectory:&isDirectory];
    
    if (isDirectory) {
        NSDictionary* userInfo = @{ NSLocalizedDescriptionKey: [NSString
                                                                stringWithFormat:@"Expected path to a file but '%@' is a directory",
                                                                path]
                                    };
        *outError = [NSError errorWithDomain:RNVC_ERROR_DOMAIN code:-1 userInfo:userInfo];
        return NO;
    }
    
    if (!exists) {
        BOOL folderCreated = [fm createDirectoryAtPath:folder withIntermediateDirectories:YES attributes:nil error:&err];
        if (!folderCreated) {
            NSDictionary* userInfo = @{ NSUnderlyingErrorKey: err,
                                        NSLocalizedDescriptionKey: [NSString
                                                                    stringWithFormat:@"Failed to create parent directory of '%@'; error: %@",
                                                                    path,
                                                                    [err description]]
                                        };
            *outError = [NSError errorWithDomain:RNVC_ERROR_DOMAIN code:-2 userInfo:userInfo];
            return NO;
        }
        
        BOOL fileCreated = [fm createFileAtPath:path contents:nil attributes:nil];
        if (!fileCreated) {
            NSDictionary* userInfo = @{ NSLocalizedDescriptionKey: [NSString
                                                                    stringWithFormat:@"File '%@' does not exist and could not be created",
                                                                    path]
                                        };
            *outError = [NSError errorWithDomain:RNVC_ERROR_DOMAIN code:-3 userInfo:userInfo];
            return NO;
        }
    }
    return YES;
}

@end

