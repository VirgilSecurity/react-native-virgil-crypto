#import <React/RCTBridgeModule.h>

@import VirgilCrypto.Swift;
@import VirgilCryptoFoundation.Swift;

#import "NSData+Encoding.h"
#import "NSString+Encoding.h"
#import "ResponseFactory.h"

@interface RNVirgilGroupSession : NSObject <RCTBridgeModule>

@property (nonatomic, retain) VSCFCtrDrbg *random;
@property (nonatomic, retain) VSCFKeyProvider *keyProvider;

@end
