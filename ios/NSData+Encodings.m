//
//  NSData+Encodings.m
//  RNVirgilCrypto
//
//  Created by vadim on 8/5/19.
//  Copyright © 2019 Virgil Security, Inc. All rights reserved.
//

#import "NSData+Encodings.h"

@implementation NSData (Encodings)

- (NSString*) stringUsingBase64
{
    return [self base64EncodedStringWithOptions:0];
}

- (NSString*) stringUsingUtf8
{
    return [[NSString alloc] initWithData:self encoding:NSUTF8StringEncoding];
}
@end
