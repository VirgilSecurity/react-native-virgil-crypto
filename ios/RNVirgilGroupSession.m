#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNVirgilGroupSession, NSObject)

RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(encrypt:(NSString *)dataBase64
                                        withSigningKey:(NSString *)signingKeyBase64
                                        andEpochMessages:(NSArray<NSString *> *)epochMessagesBase64)

RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(decrypt:(NSString *)encryptedMessageBase64
                                        withVerifyingKey:(NSString *)verifyingKeyBase64
                                        andEpochMessages:(NSArray<NSString *> *)epochMessagesBase64)

RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(addNewEpoch:(NSArray<NSString *> *)epochMessagesBase64)

RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(parseMessage:(NSString *)messageBase64)

@end
