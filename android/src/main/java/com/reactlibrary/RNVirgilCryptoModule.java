
package com.reactlibrary;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.virgilsecurity.sdk.crypto.VirgilCrypto;

import android.util.Base64;

import java.io.UnsupportedEncodingException;


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
  public String computeHash(String data) {
    try {
      byte[] hash = this.crypto.computeHash(data.getBytes("UTF-8"));
      return Base64.encodeToString(hash, Base64.DEFAULT);
    } catch (UnsupportedEncodingException e) {
      return "";
    }
  }
}