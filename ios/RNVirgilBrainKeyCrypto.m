#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNVirgilBrainKeyCrypto, NSObject)

RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(blind:(NSString *)passwordBase64)

RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(verify:(NSString *)blindedPointBase64
                                        hardenedPoint:(NSString *)hardenedPointBase64
                                        serverPublicKey:(NSString *)serverPublicKeyBase64
                                        proofValueC:(NSString *)proofValueCBase64
                                        proofValueS:(NSString *)proofValueSBase64)

RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(deblind:(NSString *)passwordBase64
                                        hardenedPoint:(NSString *)hardenedPointBase64
                                        deblindFactor:(NSString *)deblindFactorBase64
                                        keyName:(NSString *)keyNameBase64)

@end
