package com.virgilsecurity.rn.crypto;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableMap;
import com.virgilsecurity.crypto.foundation.CtrDrbg;
import com.virgilsecurity.crypto.foundation.FoundationException;
import com.virgilsecurity.crypto.foundation.GroupSession;
import com.virgilsecurity.crypto.foundation.GroupSessionMessage;
import com.virgilsecurity.crypto.foundation.GroupSessionTicket;
import com.virgilsecurity.crypto.foundation.KeyProvider;
import com.virgilsecurity.crypto.foundation.PrivateKey;
import com.virgilsecurity.crypto.foundation.PublicKey;
import com.virgilsecurity.rn.crypto.utils.Encodings;
import com.virgilsecurity.rn.crypto.utils.ResponseFactory;

import java.util.ArrayList;
import java.util.List;

public class RNVirgilGroupSessionModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;
    private final CtrDrbg rng;
    private final KeyProvider keyProvider;

    public RNVirgilGroupSessionModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.rng = new CtrDrbg();
        this.keyProvider = new KeyProvider();
        this.rng.setupDefaults();
        this.keyProvider.setupDefaults();
    }

    @Override
    public String getName() {
        return "RNVirgilGroupSession";
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public WritableMap encrypt(String dataBase64, String signingKeyBase64, ReadableArray epochMessagesBase64) {
        try {
            PrivateKey privateKey = this.keyProvider.importPrivateKey(Encodings.decodeBase64(signingKeyBase64));
            GroupSession session = this.createSession(epochMessagesBase64);
            GroupSessionMessage encryptedMessage = session.encrypt(Encodings.decodeBase64(dataBase64), privateKey);
            return ResponseFactory.createStringResponse(Encodings.encodeBase64(encryptedMessage.serialize()));
        } catch (FoundationException e) {
            return ResponseFactory.createErrorResponse(e);
        }
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public WritableMap decrypt(String encryptedMessageBase64, String verifyingKeyBase64, ReadableArray epochMessagesBase64) {
        try {
            PublicKey publicKey = this.keyProvider.importPublicKey(Encodings.decodeBase64(verifyingKeyBase64));
            GroupSessionMessage encryptedMessage = GroupSessionMessage.deserialize(Encodings.decodeBase64(encryptedMessageBase64));
            GroupSession session = this.createSession(epochMessagesBase64);
            byte[] decrypted = session.decrypt(encryptedMessage, publicKey);
            return ResponseFactory.createStringResponse(Encodings.encodeBase64(decrypted));
        } catch (FoundationException e) {
            return ResponseFactory.createErrorResponse(e);
        }
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public WritableMap addNewEpoch(ReadableArray epochMessagesBase64) {
        try {
            GroupSession session = this.createSession(epochMessagesBase64);
            GroupSessionTicket epochTicket = session.createGroupTicket();
            GroupSessionMessage epochMessage = epochTicket.getTicketMessage();
            session.addEpoch(epochMessage);
            return ResponseFactory.createMapResponse(this.groupSessionMessageToDictionary(epochMessage));
        } catch (FoundationException e) {
            return ResponseFactory.createErrorResponse(e);
        }
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public WritableMap parseMessage(String messageBase64) {
        try {
            GroupSessionMessage message = GroupSessionMessage.deserialize(Encodings.decodeBase64(messageBase64));
            return ResponseFactory.createMapResponse(this.groupSessionMessageToDictionary(message));
        } catch (FoundationException e) {
            return ResponseFactory.createErrorResponse(e);
        }
    }

    private WritableMap groupSessionMessageToDictionary(GroupSessionMessage message) {
        int epochNumber = (int)message.getEpoch();
        byte[] sessionId = message.getSessionId();
        byte[] data = message.serialize();

        WritableMap messageMap = Arguments.createMap();
        messageMap.putInt("epochNumber", epochNumber);
        messageMap.putString("sessionId", Encodings.encodeBase64(sessionId));
        messageMap.putString("data", Encodings.encodeBase64(data));
        return messageMap;
    }

    private GroupSession createSession(ReadableArray epochMessagesBase64) throws FoundationException {
        List<GroupSessionMessage> epochMessages = new ArrayList<>(epochMessagesBase64.size());
        for(Object epochMessageBase64 : epochMessagesBase64.toArrayList()) {
            epochMessages.add(
                    GroupSessionMessage.deserialize(
                            Encodings.decodeBase64((String)epochMessageBase64)
                    )
            );
        }
        GroupSession session = new GroupSession();
        session.setRng(this.rng);
        for (GroupSessionMessage epochMessage : epochMessages) {
            session.addEpoch(epochMessage);
        }
        return session;
    }
}


