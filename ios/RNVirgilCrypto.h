#import <React/RCTBridgeModule.h>
#import <VirgilCrypto/VirgilCrypto-Swift.h>
#import <VirgilCryptoFoundation/VirgilCryptoFoundation-Swift.h>

#import "FSUtils.h"
#import "HashAlgorithm.h"
#import "KeyPairType.h"
#import "NSData+Encoding.h"
#import "NSString+Encoding.h"
#import "ResponseFactory.h"

@interface RNVirgilCrypto : NSObject <RCTBridgeModule>

@property (nonatomic, retain) VSMVirgilCrypto *crypto;

@end
