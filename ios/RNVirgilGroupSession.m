#import "RNVirgilGroupSession.h"

@implementation RNVirgilGroupSession

RCT_EXPORT_MODULE()

- (instancetype)init {
    self = [super init];
    self.random = [[VSCFCtrDrbg alloc] init];
    self.keyProvider = [[VSCFKeyProvider alloc] init];
    [self.random setupDefaultsAndReturnError:nil];
    [self.keyProvider setupDefaultsAndReturnError:nil];
    return self;
}

+ (BOOL)requiresMainQueueSetup {
    return NO;
}

- (VSCFGroupSession *)createSession:(NSArray<NSString *> *) epochMessagesBase64 error:(NSError **)error {
    NSMutableArray<VSCFGroupSessionMessage *> *epochMessages = [NSMutableArray arrayWithCapacity:epochMessagesBase64.count];
    for (NSString *epochMessageBase64 in epochMessagesBase64) {
        VSCFGroupSessionMessage *epochMessage = [VSCFGroupSessionMessage deserializeWithInput:[epochMessageBase64 dataUsingBase64] error:error];
        if (epochMessage == nil) {
            return nil;
        }
        [epochMessages addObject:epochMessage];
    }
    VSCFGroupSession *session = [[VSCFGroupSession alloc] init];
    [session setRngWithRng:self.random];
    for (VSCFGroupSessionMessage *epochMessage in epochMessages) {
        if (![session addEpochWithMessage:epochMessage error:error]) {
            return nil;
        }
    }
    return session;
}

- (NSDictionary *)groupSessionMessageToDictionary:(VSCFGroupSessionMessage *)message {
    NSNumber *epochNumber = @([message getEpoch]);
    NSData *sessionId = [message getSessionId];
    NSData *data = [message serialize];
    return @{
        @"epochNumber": epochNumber,
        @"sessionId": [sessionId stringUsingBase64],
        @"data": [data stringUsingBase64]
    };
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(encrypt:(NSString *)dataBase64 withSigningKey:(NSString *)signingKeyBase64 andEpochMessages:(NSArray<NSString *> *)epochMessagesBase64) {
    NSError *error;
    id<VSCFPrivateKey> privateKey = [self.keyProvider importPrivateKeyWithKeyData:[signingKeyBase64 dataUsingBase64] error:&error];
    if (privateKey == nil) {
        return [ResponseFactory fromError:error];
    }
    VSCFGroupSession *session = [self createSession:epochMessagesBase64 error:&error];
    if (session == nil) {
        return [ResponseFactory fromError:error];
    }
    VSCFGroupSessionMessage *message = [session encryptWithPlainText:[dataBase64 dataUsingBase64] privateKey:privateKey error:&error];
    if (message == nil) {
        return [ResponseFactory fromError:error];
    }
    return [ResponseFactory fromResult:[[message serialize] stringUsingBase64]];
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(decrypt:(NSString *) encryptedMessageBase64 withVerifyingKey:(NSString *)verifyingKeyBase64 andEpochMessages:(NSArray<NSString *> *)epochMessagesBase64) {
    NSError *error;
    id<VSCFPublicKey> publicKey = [self.keyProvider importPublicKeyWithKeyData:[verifyingKeyBase64 dataUsingBase64] error:&error];
    if (publicKey == nil) {
        return [ResponseFactory fromError:error];
    }
    VSCFGroupSessionMessage *encryptedMessage = [VSCFGroupSessionMessage deserializeWithInput:[encryptedMessageBase64 dataUsingBase64] error:&error];
    if (encryptedMessage == nil) {
        return [ResponseFactory fromError:error];
    }
    VSCFGroupSession *session = [self createSession:epochMessagesBase64 error:&error];
    if (session == nil) {
        return [ResponseFactory fromError:error];
    }
    NSData *decrypted = [session decryptWithMessage:encryptedMessage publicKey:publicKey error:&error];
    if (decrypted == nil) {
        return [ResponseFactory fromError:error];
    }
    return [ResponseFactory fromResult:[decrypted stringUsingBase64]];
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(addNewEpoch:(NSArray<NSString *> *)epochMessagesBase64) {
    NSError *error;
    VSCFGroupSession *session = [self createSession:epochMessagesBase64 error:&error];
    if (session == nil) {
        return [ResponseFactory fromError:error];
    }
    VSCFGroupSessionTicket *epochTicket = [session createGroupTicketAndReturnError:&error];
    if (epochTicket == nil) {
        return [ResponseFactory fromError:error];
    }
    VSCFGroupSessionMessage *epochMessage = [epochTicket getTicketMessage];
    if (![session addEpochWithMessage:epochMessage error:&error]) {
        return [ResponseFactory fromError:error];
    }
    return [ResponseFactory fromResult:[self groupSessionMessageToDictionary:epochMessage]];
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(parseMessage:(NSString *)messageBase64) {
    NSError *error;
    VSCFGroupSessionMessage *message = [VSCFGroupSessionMessage deserializeWithInput:[messageBase64 dataUsingBase64] error:&error];
    if (message == nil) {
        return [ResponseFactory fromError:error];
    }
    return [ResponseFactory fromResult:[self groupSessionMessageToDictionary:message]];
}

@end
