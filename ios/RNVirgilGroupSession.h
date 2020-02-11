#import <React/RCTBridgeModule.h>
#import <VirgilCrypto/VirgilCrypto-Swift.h>
#import <VirgilCryptoFoundation/VirgilCryptoFoundation-Swift.h>

#import "NSData+Encoding.h"
#import "NSString+Encoding.h"
#import "ResponseFactory.h"

@interface RNVirgilGroupSession : NSObject <RCTBridgeModule>

@property (nonatomic, retain) VSCFCtrDrbg *random;
@property (nonatomic, retain) VSCFKeyProvider *keyProvider;

@end
