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
    return @{ @"result": result };
}

+ (id) fromError:(NSError *)error
{
    return @{ @"error": RCTJSErrorFromNSError(error) };
}

@end
