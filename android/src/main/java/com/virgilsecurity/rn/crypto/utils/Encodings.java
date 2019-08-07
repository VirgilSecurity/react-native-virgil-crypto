package com.virgilsecurity.rn.crypto.utils;

import android.util.Base64;

public final class Encodings {
    public static final String encodeBase64(byte[] data) {
        return Base64.encodeToString(data, Base64.NO_WRAP);
    }

    public static final byte[] decodeBase64(String str) {
        return Base64.decode(str, Base64.NO_WRAP);
    }
}
