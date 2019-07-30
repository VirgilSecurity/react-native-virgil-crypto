
package com.reactlibrary;

import android.util.Base64;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import com.virgilsecurity.sdk.crypto.VirgilCrypto;
import com.virgilsecurity.sdk.crypto.VirgilKeyPair;

import com.reactlibrary.utils.ResponseFactory;
import com.virgilsecurity.sdk.crypto.exceptions.CryptoException;


public class RNVirgilCryptoModule extends ReactContextBaseJavaModule {

  private final ReactApplicationContext reactContext;
  private final VirgilCrypto crypto;

  public RNVirgilCryptoModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
    this.crypto = new VirgilCrypto();
  }

  @Override
  public String getName() {
    return "RNVirgilCrypto";
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public WritableMap computeHash(String data) {
    byte[] hash = this.crypto.computeHash(data.getBytes(StandardCharsets.UTF_8));
    return ResponseFactory.createStringResponse(Base64.encodeToString(hash, Base64.DEFAULT));
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public WritableMap generateKeyPair() {
    try {
      VirgilKeyPair keypair = this.crypto.generateKeyPair();
      final byte[] privateKeyData = this.crypto.exportPrivateKey(keypair.getPrivateKey());
      final byte[] publicKeyData = this.crypto.exportPublicKey(keypair.getPublicKey());
      Map<String, String> keypairMap = new HashMap<>();
      keypairMap.put("privateKey", Base64.encodeToString(privateKeyData, Base64.DEFAULT));
      keypairMap.put("publicKey", Base64.encodeToString(publicKeyData, Base64.DEFAULT));
      return ResponseFactory.createMapResponse(keypairMap);
    }
    catch (CryptoException e) {
      return ResponseFactory.createErrorResponse(e);
    }

  }
}