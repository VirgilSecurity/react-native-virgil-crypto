package com.virgilsecurity.rn.crypto;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import com.virgilsecurity.crypto.foundation.BrainkeyClient;
import com.virgilsecurity.crypto.foundation.BrainkeyClientBlindResult;

import com.virgilsecurity.rn.crypto.utils.Encodings;
import com.virgilsecurity.rn.crypto.utils.ResponseFactory;

/**
 * Brain key primitives.
 *
 * virgil-crypto-c 0.19.1 removed the Pythia module; password hardening moved
 * into foundation as BrainkeyClient/BrainkeyServer. This module exposes only the
 * raw primitives — the harden request and its DLEQ proof verification belong to
 * a service client above this layer, as in virgil-e3kit-kotlin's
 * BrainkeyHttpClient.
 *
 * deblind is not a rename of the Pythia call: it takes the password again plus
 * a keyName domain-separation tag.
 */
public class RNVirgilBrainKeyCryptoModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    public RNVirgilBrainKeyCryptoModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "RNVirgilBrainKeyCrypto";
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public WritableMap blind(String passwordBase64) {
        try (BrainkeyClient client = new BrainkeyClient()) {
            client.setupDefaults();
            BrainkeyClientBlindResult blindResult =
                    client.blind(Encodings.decodeBase64(passwordBase64));

            WritableMap resultMap = Arguments.createMap();
            resultMap.putString("blindedPoint", Encodings.encodeBase64(blindResult.getBlindedPoint()));
            resultMap.putString("deblindFactor", Encodings.encodeBase64(blindResult.getDeblindFactor()));

            return ResponseFactory.createMapResponse(resultMap);
        } catch (Exception e) {
            return ResponseFactory.createErrorResponse(e);
        }
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public WritableMap deblind(String passwordBase64,
                               String hardenedPointBase64,
                               String deblindFactorBase64,
                               String keyNameBase64) {
        try (BrainkeyClient client = new BrainkeyClient()) {
            client.setupDefaults();
            byte[] seed = client.deblind(
                    Encodings.decodeBase64(passwordBase64),
                    Encodings.decodeBase64(hardenedPointBase64),
                    Encodings.decodeBase64(deblindFactorBase64),
                    Encodings.decodeBase64(keyNameBase64));

            return ResponseFactory.createStringResponse(Encodings.encodeBase64(seed));
        } catch (Exception e) {
            return ResponseFactory.createErrorResponse(e);
        }
    }
}
