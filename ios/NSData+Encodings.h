//
//  NSData+Encodings.h
//  RNVirgilCrypto
//
//  Created by vadim on 8/5/19.
//  Copyright © 2019 Virgil Security, Inc. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface NSData (Encodings)
- (NSString*) stringUsingBase64;
@end

NS_ASSUME_NONNULL_END
