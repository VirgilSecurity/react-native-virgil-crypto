package com.virgilsecurity.rn.crypto.utils;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.virgilsecurity.sdk.crypto.exceptions.DecryptionException;

public final class ResponseFactory {
    private static final int ERROR_STACK_FRAME_LIMIT = 50;
    private static final String ERROR_DEFAULT_CODE = "EUNSPECIFIED";
    private static final String ERROR_DEFAULT_MESSAGE = "Error not specified.";

    // Keys for error's WritableMap
    private static final String ERROR_MAP_KEY_CODE = "code";
    private static final String ERROR_MAP_KEY_MESSAGE = "message";
    private static final String ERROR_MAP_KEY_DOMAIN = "domain";
    private static final String ERROR_MAP_KEY_USER_INFO = "userInfo";
    private static final String ERROR_MAP_KEY_NATIVE_STACK = "nativeStackAndroid";

    // Keys for ERROR_MAP_KEY_NATIVE_STACK's StackFrame maps
    private static final String STACK_FRAME_KEY_CLASS = "class";
    private static final String STACK_FRAME_KEY_FILE = "file";
    private static final String STACK_FRAME_KEY_LINE_NUMBER = "lineNumber";
    private static final String STACK_FRAME_KEY_METHOD_NAME = "methodName";

    private static final WritableMap createErrorInfoMap(Throwable throwable) {
        WritableNativeMap errorInfo = new WritableNativeMap();
        errorInfo.putString(ERROR_MAP_KEY_CODE, ERROR_DEFAULT_CODE);
        if (throwable instanceof DecryptionException) {
            // For consistency with iOS and JS
            errorInfo.putString(ERROR_MAP_KEY_MESSAGE, "Recipient defined with id is not found within message info during data decryption.");
            errorInfo.putString(ERROR_MAP_KEY_DOMAIN, "FoundationError");
        } else {
            errorInfo.putString(ERROR_MAP_KEY_MESSAGE, throwable.getMessage());
            errorInfo.putString(ERROR_MAP_KEY_DOMAIN, throwable.getClass().getCanonicalName());
        }

        // For consistency with iOS ensure userInfo key exists, even if we null it.
        // iOS: /React/Base/RCTUtils.m -> RCTJSErrorFromCodeMessageAndNSError
        errorInfo.putNull(ERROR_MAP_KEY_USER_INFO);

        StackTraceElement[] stackTrace = throwable.getStackTrace();
        WritableNativeArray nativeStackAndroid = new WritableNativeArray();

        // Build an an Array of StackFrames to match JavaScript:
        // iOS: /Libraries/Core/Devtools/parseErrorStack.js -> StackFrame
        for (int i = 0; i < stackTrace.length && i < ERROR_STACK_FRAME_LIMIT; i++) {
            StackTraceElement frame = stackTrace[i];
            WritableMap frameMap = new WritableNativeMap();
            // NOTE: no column number exists StackTraceElement
            frameMap.putString(STACK_FRAME_KEY_CLASS, frame.getClassName());
            frameMap.putString(STACK_FRAME_KEY_FILE, frame.getFileName());
            frameMap.putInt(STACK_FRAME_KEY_LINE_NUMBER, frame.getLineNumber());
            frameMap.putString(STACK_FRAME_KEY_METHOD_NAME, frame.getMethodName());
            nativeStackAndroid.pushMap(frameMap);
        }

        errorInfo.putArray(ERROR_MAP_KEY_NATIVE_STACK, nativeStackAndroid);
        return errorInfo;
    }

    public static final WritableMap createStringResponse(String result) {
        WritableMap response = Arguments.createMap();
        response.putString("result", result);
        return response;
    }

    public static final WritableMap createBooleanResponse(boolean result) {
        WritableMap response = Arguments.createMap();
        response.putBoolean("result", result);
        return response;
    }

    public static final WritableMap createMapResponse(WritableMap params) {
        WritableMap response = Arguments.createMap();
        response.putMap("result", params);
        return response;
    }

    public static final WritableMap createErrorResponse(Throwable throwable) {
        WritableMap response = Arguments.createMap();
        response.putMap("error", createErrorInfoMap(throwable));
        return response;
    }
}
