//
//  ResponseFactory.m
//  RNVirgilCrypto
//
//  Created by vadim on 8/5/19.
//  Copyright © 2019 Virgil Security, Inc. All rights reserved.
//

#import "ResponseFactory.h"

@implementation ResponseFactory

+ (id) fromResult:(id)result
{
    NSMutableDictionary* response = [NSMutableDictionary dictionaryWithCapacity:1];
    response[@"result"] = result;
    return response;
}

+ (id) fromError:(NSError *)error
{
    NSMutableDictionary* response = [NSMutableDictionary dictionaryWithCapacity:1];
    response[@"error"] = RCTJSErrorFromNSError(error);
    return response;
}

@end
