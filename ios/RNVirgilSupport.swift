import Foundation
import React
import VirgilCrypto
import VirgilCryptoFoundation

// MARK: - Constants

enum RNVirgilConstants {
    static let assetPrefix = "asset://"
    static let errorDomain = "RNVirgilCrypto"
}

// MARK: - Base64 helpers
//
// The bridge speaks base64 in both directions. These mirror the former
// NSData+Encoding / NSString+Encoding categories.

extension Data {
    var base64String: String { base64EncodedString() }
}

extension String {
    /// Non-optional by design: the bridge contract is that every payload is
    /// base64. A malformed value yields empty Data, which the crypto layer
    /// then rejects with a real error rather than crashing the bridge.
    var base64Data: Data { Data(base64Encoded: self) ?? Data() }
}

// MARK: - Response envelope
//
// Every synchronous method returns { result } or { error }. src/utils/response.ts
// unwraps exactly this shape, so it must not drift.

enum ResponseFactory {
    static func fromResult(_ result: Any) -> Any {
        return ["result": result]
    }

    static func fromError(_ error: Error) -> Any {
        return ["error": RCTJSErrorFromNSError(error as NSError)]
    }

    static func fromError(_ message: String, code: Int = -1) -> Any {
        let error = NSError(
            domain: RNVirgilConstants.errorDomain,
            code: code,
            userInfo: [NSLocalizedDescriptionKey: message]
        )
        return fromError(error)
    }
}

// MARK: - Enum maps exported to JS
//
// JS receives the raw enum values through getConstants() and sends them back
// as integers, so these must stay in sync with src/key-pair-type.ts and
// src/hash-algorithm.ts.

enum KeyPairTypeMap {
    static var values: [String: Int] {
        return [
            "ED25519": KeyPairType.ed25519.rawValue,
            "CURVE25519": KeyPairType.curve25519.rawValue,
            "SECP256R1": KeyPairType.secp256r1.rawValue,
            "RSA2048": KeyPairType.rsa2048.rawValue,
            "RSA4096": KeyPairType.rsa4096.rawValue,
            "RSA8192": KeyPairType.rsa8192.rawValue,
            "CURVE25519_ED25519": KeyPairType.curve25519Ed25519.rawValue,
            // Renamed upstream at virgil-crypto-c 0.19.1: Round5 was removed and
            // ML-KEM-768 took its place.
            "CURVE25519_MLKEM768_ED25519_FALCON": KeyPairType.curve25519MlKem768Ed25519Falcon.rawValue
        ]
    }
}

enum HashAlgorithmMap {
    static var values: [String: Int] {
        return [
            "SHA224": HashAlgorithm.sha224.rawValue,
            "SHA256": HashAlgorithm.sha256.rawValue,
            "SHA384": HashAlgorithm.sha384.rawValue,
            "SHA512": HashAlgorithm.sha512.rawValue
        ]
    }
}

// MARK: - Filesystem helpers
//
// Ported from FSUtils.m. Some parts originally based on
// https://github.com/joltup/rn-fetch-blob/blob/master/ios/RNFetchBlobFS.m

enum FSUtils {
    static func path(fromUri uri: String) -> String {
        guard uri.hasPrefix(RNVirgilConstants.assetPrefix) else { return uri }
        let relative = String(uri.dropFirst(RNVirgilConstants.assetPrefix.count))
        let name = (relative as NSString).deletingPathExtension
        let ext = (relative as NSString).pathExtension
        return Bundle.main.path(forResource: name, ofType: ext) ?? uri
    }

    static func tempFilePath(extension ext: String?) -> String {
        var name = UUID().uuidString
        if let ext = ext, !ext.isEmpty {
            name += ".\(ext)"
        }
        return (NSTemporaryDirectory() as NSString).appendingPathComponent(name)
    }

    static func prepareFileForWriting(_ path: String) throws {
        let fileManager = FileManager.default
        var isDirectory: ObjCBool = false
        let exists = fileManager.fileExists(atPath: path, isDirectory: &isDirectory)

        if isDirectory.boolValue {
            throw NSError(
                domain: RNVirgilConstants.errorDomain,
                code: -1,
                userInfo: [NSLocalizedDescriptionKey: "Expected path to a file but '\(path)' is a directory"]
            )
        }

        guard !exists else { return }

        let folder = (path as NSString).deletingLastPathComponent
        do {
            try fileManager.createDirectory(atPath: folder, withIntermediateDirectories: true)
        } catch {
            throw NSError(
                domain: RNVirgilConstants.errorDomain,
                code: -2,
                userInfo: [
                    NSUnderlyingErrorKey: error,
                    NSLocalizedDescriptionKey: "Failed to create parent directory of '\(path)'; error: \(error.localizedDescription)"
                ]
            )
        }

        guard fileManager.createFile(atPath: path, contents: nil) else {
            throw NSError(
                domain: RNVirgilConstants.errorDomain,
                code: -3,
                userInfo: [NSLocalizedDescriptionKey: "File '\(path)' does not exist and could not be created"]
            )
        }
    }
}
