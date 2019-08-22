package com.virgilsecurity.rn.crypto.utils;

import android.net.Uri;

import com.virgilsecurity.rn.crypto.RNVirgilCryptoModule;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.UUID;

public final class FS {

    public static final String FILE_PREFIX_BUNDLE_ASSET = "bundle-assets://";

    public static InputStream getInputStreamFromPath(String path) throws IOException {
        String resolved = normalizePath(path);
        if (resolved != null) {
            path = resolved;
        }

        if (resolved != null && resolved.startsWith(FILE_PREFIX_BUNDLE_ASSET)) {
            String assetName = path.replace(FILE_PREFIX_BUNDLE_ASSET, "");
            return RNVirgilCryptoModule.RCTContext.getAssets().open(assetName);
        }

        if (resolved == null) {
            return RNVirgilCryptoModule.RCTContext.getContentResolver()
                    .openInputStream(Uri.parse(path));
        }

        File f = new File(path);
        return new FileInputStream(f);
    }

    public static OutputStream getOutputStreamFromPath(String path) throws InvalidOutputFilePathException {
        File dest = new File(path);
        File dir = dest.getParentFile();

        try {
            if (!dest.exists()) {
                if (dir != null && !dir.exists()) {
                    if (!dir.mkdirs()) {
                        throw new InvalidOutputFilePathException(
                                String.format("Failed to create parent directory of '%s'", path)
                        );
                    }
                }


                if (!dest.createNewFile()) {
                    throw new InvalidOutputFilePathException(
                            String.format("File '%s' does not exist and could not be created", path)
                    );
                }
            } else if (dest.isDirectory()) {
                throw new InvalidOutputFilePathException(
                        String.format("Expected a file but '%s' is a directory", path)
                );
            }

            return new FileOutputStream(path, false);
        } catch (IOException e) {
            throw new InvalidOutputFilePathException(
                    String.format(
                            "Failed to create write stream at path: '%s'; %s",
                            path,
                            e.getLocalizedMessage()
                    )
            );
        }
    }

    /**
     * Normalize the path, remove URI scheme (xxx://) so that we can handle it.
     * @param path URI string.
     * @return Normalized string
     */
    public static String normalizePath(String path) {
        if(path == null)
            return null;
        if(!path.matches("\\w+:.*"))
            return path;
        if(path.startsWith("file://")) {
            return path.replace("file://", "");
        }

        Uri uri = Uri.parse(path);
        if(path.startsWith(FS.FILE_PREFIX_BUNDLE_ASSET)) {
            return path;
        }

        return PathResolver.getRealPathFromURI(RNVirgilCryptoModule.RCTContext, uri);
    }

    public static String getTempFilePath(String extension) {
        String cacheDir = RNVirgilCryptoModule.RCTContext.getCacheDir().getAbsolutePath();
        String fileName = UUID.randomUUID().toString();
        if (extension != null) {
            fileName = String.format("%s.%s", fileName, extension);
        }
        return String.format("%s/%s", cacheDir, fileName);
    }

    public static String getFileExtension(String path) {
        path = normalizePath(path);
        if (path == null) {
            return null;
        }

        int dotIndex = path.lastIndexOf(".");
        int separatorIndex = path.indexOf(File.separator);

        if (dotIndex > Math.max(0, separatorIndex)) {
            return path.substring(dotIndex + 1);
        }
        return null;
    }
}
