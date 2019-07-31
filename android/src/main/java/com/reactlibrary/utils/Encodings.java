package com.reactlibrary.utils;

import android.util.Base64;

import java.nio.charset.StandardCharsets;

public final class Encodings {
    public static final String encodeBase64(byte[] data) {
        return Base64.encodeToString(data, Base64.DEFAULT);
    }

    public static final byte[] decodeBase64(String str) {
        return Base64.decode(str, Base64.DEFAULT);
    }

    public static final String encodeUtf8(byte[] data) {
        return new String(data, StandardCharsets.UTF_8);
    }

    public static final byte[] decodeUtf8(String str) {
        return str.getBytes(StandardCharsets.UTF_8);
    }
}
