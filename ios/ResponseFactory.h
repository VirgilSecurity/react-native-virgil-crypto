//
//  ResponseFactory.h
//  RNVirgilCrypto
//
//  Created by vadim on 8/5/19.
//  Copyright © 2019 Virgil Security, Inc. All rights reserved.
//

#if __has_include("RCTUtils.h")
#import "RCTUtils.h"
#else
#import <React/RCTUtils.h>
#endif

@interface ResponseFactory : NSObject

+ (id) fromResult:(id) result;
+ (id) fromError:(NSError*) error;

@end
