
#if __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#else
#import <React/RCTBridgeModule.h>
#endif

#if __has_include(<VirgilCrypto/VirgilCrypto-Swift.h>)
#import <VirgilCrypto/VirgilCrypto-Swift.h>
#else
#import "VirgilCrypto-Swift.h"
#endif

@interface RNVirgilCrypto : NSObject <RCTBridgeModule>

@property (nonatomic, retain) VSMVirgilCrypto *crypto;

@end
  
