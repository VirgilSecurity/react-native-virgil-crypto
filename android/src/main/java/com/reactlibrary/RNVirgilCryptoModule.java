
package com.reactlibrary;

import android.util.Log;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableMap;

import com.reactlibrary.utils.Encodings;
import com.virgilsecurity.sdk.crypto.VirgilCrypto;
import com.virgilsecurity.sdk.crypto.VirgilKeyPair;

import com.reactlibrary.utils.ResponseFactory;
import com.virgilsecurity.sdk.crypto.VirgilPrivateKey;
import com.virgilsecurity.sdk.crypto.VirgilPublicKey;
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
  public WritableMap computeHash(String dataUtf8) {
    byte[] hash = this.crypto.computeHash(Encodings.decodeUtf8(dataUtf8));
    return ResponseFactory.createStringResponse(Encodings.encodeBase64(hash));
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public WritableMap generateKeyPair() {
    try {
      VirgilKeyPair keypair = this.crypto.generateKeyPair();
      final byte[] privateKeyData = this.crypto.exportPrivateKey(keypair.getPrivateKey());
      final byte[] publicKeyData = this.crypto.exportPublicKey(keypair.getPublicKey());
      Map<String, String> keypairMap = new HashMap<>();
      keypairMap.put("privateKey", Encodings.encodeBase64(privateKeyData));
      keypairMap.put("publicKey", Encodings.encodeBase64(publicKeyData));
      return ResponseFactory.createMapResponse(keypairMap);
    }
    catch (CryptoException e) {
      return ResponseFactory.createErrorResponse(e);
    }
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public WritableMap encrypt(String dataUtf8, ReadableArray recipientsBase64) {
    try {
      List<VirgilPublicKey> publicKeys = this.decodeAndImportPublicKeys(recipientsBase64);
      byte[] encryptedData = this.crypto.encrypt(Encodings.decodeUtf8(dataUtf8), publicKeys);
      return ResponseFactory.createStringResponse(Encodings.encodeBase64(encryptedData));
    }
    catch (CryptoException e) {
      return ResponseFactory.createErrorResponse(e);
    }
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public WritableMap decrypt(String dataBase64, String privateKeyBase64) {
    try {
      VirgilKeyPair keypair = this.crypto.importPrivateKey(Encodings.decodeBase64(privateKeyBase64));
      byte[] decryptedData = this.crypto.decrypt(Encodings.decodeBase64(dataBase64), keypair.getPrivateKey());

      return ResponseFactory.createStringResponse(Encodings.encodeUtf8(decryptedData));
    }
    catch (CryptoException e) {
      return ResponseFactory.createErrorResponse(e);
    }
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public WritableMap generateSignature(String dataBase64, String privateKeyBase64) {
    try {
      VirgilKeyPair keypair = this.crypto.importPrivateKey(Encodings.decodeBase64(privateKeyBase64));
      byte[] signatureData = this.crypto.generateSignature(Encodings.decodeBase64(dataBase64), keypair.getPrivateKey());
      return ResponseFactory.createStringResponse(Encodings.encodeBase64(signatureData));
    }
    catch (CryptoException e) {
      return ResponseFactory.createErrorResponse(e);
    }
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public WritableMap verifySignature(String signatureBase64, String dataBase64, String publicKeyBase64) {
    try {
      VirgilPublicKey publicKey = this.crypto.importPublicKey(Encodings.decodeBase64(publicKeyBase64));
      boolean isValid = this.crypto.verifySignature(
              Encodings.decodeBase64(signatureBase64),
              Encodings.decodeBase64(dataBase64),
              publicKey
      );
      return ResponseFactory.createBooleanResponse(isValid);
    }
    catch (CryptoException e) {
      return ResponseFactory.createErrorResponse(e);
    }
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public WritableMap signAndEncrypt(String dataUtf8, String privateKeyBase64, ReadableArray recipientsBase64)
  {
    try {
      VirgilKeyPair keypair = this.crypto.importPrivateKey(Encodings.decodeBase64(privateKeyBase64));
      List<VirgilPublicKey> publicKeys = this.decodeAndImportPublicKeys(recipientsBase64);
      byte[] encryptedData = this.crypto.signThenEncrypt(Encodings.decodeUtf8(dataUtf8), keypair.getPrivateKey(), publicKeys);
      return ResponseFactory.createStringResponse(Encodings.encodeBase64(encryptedData));
    }
    catch (CryptoException e) {
      return ResponseFactory.createErrorResponse(e);
    }
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public WritableMap decryptAndVerify(String dataBase64, String privateKeyBase64, ReadableArray sendersPublicKeysBase64)
  {
    try {
      VirgilKeyPair keypair = this.crypto.importPrivateKey(Encodings.decodeBase64(privateKeyBase64));
      List<VirgilPublicKey> publicKeys = this.decodeAndImportPublicKeys(sendersPublicKeysBase64);
      byte[] decryptedData = this.crypto.decryptThenVerify(Encodings.decodeBase64(dataBase64), keypair.getPrivateKey(), publicKeys);
      return ResponseFactory.createStringResponse(Encodings.encodeUtf8(decryptedData));
    }
    catch (CryptoException e) {
      return ResponseFactory.createErrorResponse(e);
    }
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public WritableMap extractPublicKey(String privateKeyBase64) {
    try {
      VirgilKeyPair keypair = this.crypto.importPrivateKey(Encodings.decodeBase64(privateKeyBase64));
      byte[] publicKeyData = this.crypto.exportPublicKey(keypair.getPublicKey());
      return ResponseFactory.createStringResponse(Encodings.encodeBase64(publicKeyData));
    }
    catch (CryptoException e) {
      return ResponseFactory.createErrorResponse(e);
    }
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public WritableMap generateRandomData(Integer size) {
    byte[] randomData = this.crypto.generateRandomData(size);
    return ResponseFactory.createStringResponse(Encodings.encodeBase64(randomData));
  }

  private List<VirgilPublicKey> decodeAndImportPublicKeys(ReadableArray publicKeysBase64) throws CryptoException {
    List<VirgilPublicKey> publicKeys = new ArrayList<>(publicKeysBase64.size());
    for(Object publicKeyBase64 : publicKeysBase64.toArrayList()) {
      publicKeys.add(this.crypto.importPublicKey(Encodings.decodeBase64((String)publicKeyBase64)));
    }
    return publicKeys;
  }
}