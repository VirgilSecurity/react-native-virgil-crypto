//
//  RNVirgilGroupSession.m
//  RNVirgilCrypto
//
//  Created by vadim on 9/19/19.
//  Copyright © 2019 Virgil Security, Inc. All rights reserved.
//

#import "RNVirgilGroupSession.h"

@implementation RNVirgilGroupSession

+ (BOOL)requiresMainQueueSetup
{
    return NO;
}

- (instancetype)init
{
    self = [super init];
    self.rng = [[VSCFCtrDrbg alloc] init];
    self.keyProvider = [[VSCFKeyProvider alloc] init];
    [self.rng setupDefaultsAndReturnError:nil];
    [self.keyProvider setupDefaultsAndReturnError:nil];
    return self;
}

- (VSCFGroupSession *) createSession:(NSArray<NSString *> *) epochMessagesBase64 error:(NSError **)err
{
    NSMutableArray<VSCFGroupSessionMessage*> *epochMessages = [NSMutableArray arrayWithCapacity:[epochMessagesBase64 count]];
    for (NSString *epochMessageBase64 in epochMessagesBase64) {
        VSCFGroupSessionMessage *epochMessage = [VSCFGroupSessionMessage deserializeWithInput:[epochMessageBase64 dataUsingBase64]
                                                                                        error:err];
        if (nil == epochMessage) {
            return nil;
        }
        [epochMessages addObject:epochMessage];
    }
    
    VSCFGroupSession *session = [[VSCFGroupSession alloc] init];
    [session setRngWithRng:self.rng];
    for (VSCFGroupSessionMessage* epochMessage in epochMessages) {
        if (![session addEpochWithMessage:epochMessage error:err]) {
            return nil;
        }
    }
    return session;
}

- (NSDictionary *) groupSessionMessageToDictionary:(VSCFGroupSessionMessage *)message
{
    NSNumber *epochNumber = @([message getEpoch]);
    NSData *sessionId = [message getSessionId];
    NSData *data = [message serialize];
    return @{ @"epochNumber": epochNumber,
              @"sessionId": [sessionId stringUsingBase64],
              @"data": [data stringUsingBase64] };
}

RCT_EXPORT_MODULE()

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(encrypt:(NSString *)dataBase64
                                       withSigningKey:(NSString *)signingKeyBase64
                                       andEpochMessages:(NSArray<NSString *> *) epochMessagesBase64)
{
    @autoreleasepool {
        NSError *err;
        id<VSCFPrivateKey> privateKey = [self.keyProvider importPrivateKeyWithKeyData:[signingKeyBase64 dataUsingBase64] error:&err];
        if (nil == privateKey) {
            return [ResponseFactory fromError:err];
        }
        
        VSCFGroupSession *session = [self createSession:epochMessagesBase64 error:&err];
        if (nil == session) {
            return [ResponseFactory fromError:err];
        }
        
        VSCFGroupSessionMessage *message = [session encryptWithPlainText:[dataBase64 dataUsingBase64] privateKey:privateKey error:&err];
        if (nil == message) {
            return [ResponseFactory fromError:err];
        }
        
        return [ResponseFactory fromResult:[[message serialize] stringUsingBase64]];
    }
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(decrypt: (NSString *)encryptedMessageBase64
                                       withVerifyingKey:(NSString *)verifyingKeyBase64
                                       andEpochMessages:(NSArray<NSString *> *) epochMessagesBase64)
{
    @autoreleasepool {
        NSError *err;
        id<VSCFPublicKey> publicKey = [self.keyProvider importPublicKeyWithKeyData:[verifyingKeyBase64 dataUsingBase64] error:&err];
        if (nil == publicKey) {
            return [ResponseFactory fromError:err];
        }
        
        VSCFGroupSessionMessage *encryptedMessage = [VSCFGroupSessionMessage deserializeWithInput:[encryptedMessageBase64 dataUsingBase64]
                                                                                            error:&err];
        if (nil == encryptedMessage) {
            return [ResponseFactory fromError:err];
        }
        
        VSCFGroupSession *session = [self createSession:epochMessagesBase64 error:&err];
        if (nil == session) {
            return [ResponseFactory fromError:err];
        }
        
        NSData* decrypted = [session decryptWithMessage:encryptedMessage publicKey:publicKey error:&err];
        if (nil == decrypted) {
            return [ResponseFactory fromError:err];
        }
        
        return [ResponseFactory fromResult:[decrypted stringUsingBase64]];
    }
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(addNewEpoch:(NSArray<NSString *> *) epochMessagesBase64)
{
    @autoreleasepool {
        NSError *err;
        VSCFGroupSession *session = [self createSession:epochMessagesBase64 error:&err];
        if (nil == session) {
            return [ResponseFactory fromError:err];
        }
        
        VSCFGroupSessionTicket *epochTicket = [session createGroupTicketAndReturnError:&err];
        if (nil == epochTicket) {
            return [ResponseFactory fromError:err];
        }
        
        VSCFGroupSessionMessage *epochMessage = [epochTicket getTicketMessage];
        
        if (![session addEpochWithMessage:epochMessage error:&err]) {
            return [ResponseFactory fromError:err];
        }
        
        return [ResponseFactory fromResult: [self groupSessionMessageToDictionary:epochMessage]];
    }
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(parseMessage:(NSString *)messageBase64)
{
    @autoreleasepool {
        NSError *err;
        VSCFGroupSessionMessage *message = [VSCFGroupSessionMessage deserializeWithInput:[messageBase64 dataUsingBase64]
                                                                                   error:&err];
        if (nil == message) {
            return [ResponseFactory fromError:err];
        }
        
        return [ResponseFactory fromResult: [self groupSessionMessageToDictionary:message]];
    }
}
@end
