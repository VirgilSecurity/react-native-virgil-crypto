//
//  NSString+Encodings.m
//  RNVirgilCrypto
//
//  Created by vadim on 8/5/19.
//  Copyright © 2019 Virgil Security, Inc. All rights reserved.
//

#import "NSString+Encodings.h"

@implementation NSString (Encodings)

- (NSData*) dataUsingBase64
{
    return [[NSData alloc] initWithBase64EncodedString:self options:0];
}

- (NSData*) dataUsingUtf8
{
    return [self dataUsingEncoding:NSUTF8StringEncoding];
}
@end
