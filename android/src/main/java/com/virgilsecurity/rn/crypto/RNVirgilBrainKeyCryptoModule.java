package com.virgilsecurity.rn.crypto;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import com.virgilsecurity.crypto.pythia.Pythia;
import com.virgilsecurity.crypto.pythia.PythiaBlindResult;

import com.virgilsecurity.rn.crypto.utils.Encodings;
import com.virgilsecurity.rn.crypto.utils.ResponseFactory;

public class RNVirgilBrainKeyCryptoModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    public RNVirgilBrainKeyCryptoModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        Pythia.configure();
    }

    @Override
    public String getName() {
        return "RNVirgilBrainKeyCrypto";
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public WritableMap blind(String passwordBase64) {
        PythiaBlindResult blindResult = Pythia.blind(Encodings.decodeBase64(passwordBase64));
        WritableMap resultMap = Arguments.createMap();
        resultMap.putString("blindedPassword", Encodings.encodeBase64(blindResult.getBlindedPassword()));
        resultMap.putString("blindingSecret", Encodings.encodeBase64(blindResult.getBlindingSecret()));
        
        return ResponseFactory.createMapResponse(resultMap);
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public WritableMap deblind(String transformedPasswordBase64, String blindingSecretBase64) {
        byte[] deblindResult = Pythia.deblind(
                Encodings.decodeBase64(transformedPasswordBase64),
                Encodings.decodeBase64(blindingSecretBase64));
        return ResponseFactory.createStringResponse(Encodings.encodeBase64(deblindResult));
    }
}
