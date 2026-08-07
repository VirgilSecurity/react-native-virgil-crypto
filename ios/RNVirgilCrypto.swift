import Foundation
import React
import VirgilCrypto
import VirgilCryptoFoundation

@objc(RNVirgilCrypto)
class RNVirgilCrypto: NSObject {

    private let crypto: VirgilCrypto

    override init() {
        // Matches the previous Objective-C behaviour: a failure here left the
        // module with a nil crypto and every call failed. Trapping instead
        // surfaces the misconfiguration immediately.
        guard let crypto = try? VirgilCrypto(defaultKeyType: .ed25519, useSHA256Fingerprints: false) else {
            fatalError("RNVirgilCrypto: failed to initialise VirgilCrypto")
        }
        self.crypto = crypto
        super.init()
    }

    @objc static func requiresMainQueueSetup() -> Bool {
        return false
    }

    @objc func constantsToExport() -> [AnyHashable: Any]! {
        return [
            "KeyPairType": KeyPairTypeMap.values,
            "HashAlgorithm": HashAlgorithmMap.values
        ]
    }

    // MARK: - Helpers

    private func importPublicKeys(_ publicKeysBase64: [String]) throws -> [VirgilPublicKey] {
        return try publicKeysBase64.map { try self.crypto.importPublicKey(from: $0.base64Data) }
    }

    private func exportKeyPair(_ keyPair: VirgilKeyPair) throws -> [String: Any] {
        return [
            "privateKey": try self.crypto.exportPrivateKey(keyPair.privateKey).base64String,
            "publicKey": try self.crypto.exportPublicKey(keyPair.publicKey).base64String,
            "identifier": keyPair.identifier.base64String
        ]
    }

    private func keyPairType(from rawValue: Int) throws -> KeyPairType {
        guard let type = KeyPairType(rawValue: rawValue) else {
            throw NSError(
                domain: RNVirgilConstants.errorDomain,
                code: -10,
                userInfo: [NSLocalizedDescriptionKey: "Unknown key pair type \(rawValue)"]
            )
        }
        return type
    }

    private func hashAlgorithm(from rawValue: Int) -> HashAlgorithm {
        return HashAlgorithm(rawValue: rawValue) ?? .sha512
    }

    // MARK: - Hashing

    @objc(computeHash:)
    func computeHash(_ dataBase64: String) -> Any {
        let digest = self.crypto.computeHash(for: dataBase64.base64Data, using: .sha512)
        return ResponseFactory.fromResult(digest.base64String)
    }

    @objc(computeHashWithAlgorithm:algorithm:)
    func computeHashWithAlgorithm(_ dataBase64: String, algorithm: Int) -> Any {
        let digest = self.crypto.computeHash(for: dataBase64.base64Data, using: hashAlgorithm(from: algorithm))
        return ResponseFactory.fromResult(digest.base64String)
    }

    // MARK: - Key generation

    @objc(generateKeyPair)
    func generateKeyPair() -> Any {
        do {
            return ResponseFactory.fromResult(try exportKeyPair(try self.crypto.generateKeyPair()))
        } catch {
            return ResponseFactory.fromError(error)
        }
    }

    @objc(generateKeyPairOfType:)
    func generateKeyPairOfType(_ keyPairType: Int) -> Any {
        do {
            let type = try self.keyPairType(from: keyPairType)
            return ResponseFactory.fromResult(try exportKeyPair(try self.crypto.generateKeyPair(ofType: type)))
        } catch {
            return ResponseFactory.fromError(error)
        }
    }

    @objc(generateKeyPairUsingSeed:)
    func generateKeyPairUsingSeed(_ seedBase64: String) -> Any {
        do {
            let keyPair = try self.crypto.generateKeyPair(usingSeed: seedBase64.base64Data)
            return ResponseFactory.fromResult(try exportKeyPair(keyPair))
        } catch {
            return ResponseFactory.fromError(error)
        }
    }

    /// Present in the Android module and in src/native-modules.ts but missing
    /// from the previous Objective-C implementation, which made
    /// generateKeysFromKeyMaterial(seed, keyPairType) fail on iOS.
    @objc(generateKeyPairWithTypeAndSeed:seed:)
    func generateKeyPairWithTypeAndSeed(_ keyPairType: Int, seed seedBase64: String) -> Any {
        do {
            let type = try self.keyPairType(from: keyPairType)
            let keyPair = try self.crypto.generateKeyPair(ofType: type, usingSeed: seedBase64.base64Data)
            return ResponseFactory.fromResult(try exportKeyPair(keyPair))
        } catch {
            return ResponseFactory.fromError(error)
        }
    }

    // MARK: - Encryption

    @objc(encrypt:for:enablePadding:)
    func encrypt(_ dataBase64: String, for publicKeysBase64: [String], enablePadding: Bool) -> Any {
        do {
            let publicKeys = try importPublicKeys(publicKeysBase64)
            let encrypted = try self.crypto.encrypt(dataBase64.base64Data, for: publicKeys, enablePadding: enablePadding)
            return ResponseFactory.fromResult(encrypted.base64String)
        } catch {
            return ResponseFactory.fromError(error)
        }
    }

    @objc(decrypt:with:)
    func decrypt(_ dataBase64: String, with privateKeyBase64: String) -> Any {
        do {
            let keyPair = try self.crypto.importPrivateKey(from: privateKeyBase64.base64Data)
            let decrypted = try self.crypto.decrypt(dataBase64.base64Data, with: keyPair.privateKey)
            return ResponseFactory.fromResult(decrypted.base64String)
        } catch {
            return ResponseFactory.fromError(error)
        }
    }

    // MARK: - Signatures

    @objc(generateSignature:using:)
    func generateSignature(_ dataBase64: String, using privateKeyBase64: String) -> Any {
        do {
            let keyPair = try self.crypto.importPrivateKey(from: privateKeyBase64.base64Data)
            let signature = try self.crypto.generateSignature(of: dataBase64.base64Data, using: keyPair.privateKey)
            return ResponseFactory.fromResult(signature.base64String)
        } catch {
            return ResponseFactory.fromError(error)
        }
    }

    @objc(verifySignature:of:with:)
    func verifySignature(_ signatureBase64: String, of dataBase64: String, with publicKeyBase64: String) -> Any {
        do {
            let publicKey = try self.crypto.importPublicKey(from: publicKeyBase64.base64Data)
            // The Objective-C implementation used verifySignature_objc, which
            // returns NO for both an invalid signature and an internal error.
            // That variant is unavailable in Swift, so collapse the throwing
            // API the same way rather than changing observable behaviour.
            let isValid = (try? self.crypto.verifySignature(
                signatureBase64.base64Data,
                of: dataBase64.base64Data,
                with: publicKey
            )) ?? false
            return ResponseFactory.fromResult(isValid)
        } catch {
            return ResponseFactory.fromError(error)
        }
    }

    // MARK: - Authenticated encryption

    @objc(signAndEncrypt:with:for:enablePadding:)
    func signAndEncrypt(
        _ dataBase64: String,
        with privateKeyBase64: String,
        for publicKeysBase64: [String],
        enablePadding: Bool
    ) -> Any {
        do {
            let keyPair = try self.crypto.importPrivateKey(from: privateKeyBase64.base64Data)
            let publicKeys = try importPublicKeys(publicKeysBase64)
            let encrypted = try self.crypto.authEncrypt(
                dataBase64.base64Data,
                with: keyPair.privateKey,
                for: publicKeys,
                enablePadding: enablePadding
            )
            return ResponseFactory.fromResult(encrypted.base64String)
        } catch {
            return ResponseFactory.fromError(error)
        }
    }

    @objc(decryptAndVerify:with:usingOneOf:)
    func decryptAndVerify(
        _ dataBase64: String,
        with privateKeyBase64: String,
        usingOneOf publicKeysBase64: [String]
    ) -> Any {
        do {
            let keyPair = try self.crypto.importPrivateKey(from: privateKeyBase64.base64Data)
            let publicKeys = try importPublicKeys(publicKeysBase64)
            let decrypted = try self.crypto.authDecrypt(
                dataBase64.base64Data,
                with: keyPair.privateKey,
                usingOneOf: publicKeys
            )
            return ResponseFactory.fromResult(decrypted.base64String)
        } catch {
            return ResponseFactory.fromError(error)
        }
    }

    @objc(signThenEncrypt:with:for:enablePadding:)
    func signThenEncrypt(
        _ dataBase64: String,
        with privateKeyBase64: String,
        for publicKeysBase64: [String],
        enablePadding: Bool
    ) -> Any {
        do {
            let keyPair = try self.crypto.importPrivateKey(from: privateKeyBase64.base64Data)
            let publicKeys = try importPublicKeys(publicKeysBase64)
            let encrypted = try self.crypto.signAndEncrypt(
                dataBase64.base64Data,
                with: keyPair.privateKey,
                for: publicKeys
            )
            return ResponseFactory.fromResult(encrypted.base64String)
        } catch {
            return ResponseFactory.fromError(error)
        }
    }

    @objc(decryptThenVerify:with:usingOneOf:)
    func decryptThenVerify(
        _ dataBase64: String,
        with privateKeyBase64: String,
        usingOneOf publicKeysBase64: [String]
    ) -> Any {
        do {
            let keyPair = try self.crypto.importPrivateKey(from: privateKeyBase64.base64Data)
            let publicKeys = try importPublicKeys(publicKeysBase64)
            let decrypted = try self.crypto.decryptAndVerify(
                dataBase64.base64Data,
                with: keyPair.privateKey,
                usingOneOf: publicKeys
            )
            return ResponseFactory.fromResult(decrypted.base64String)
        } catch {
            return ResponseFactory.fromError(error)
        }
    }

    // MARK: - Key inspection

    @objc(getPrivateKeyIdentifier:)
    func getPrivateKeyIdentifier(_ privateKeyBase64: String) -> Any {
        do {
            let keyPair = try self.crypto.importPrivateKey(from: privateKeyBase64.base64Data)
            return ResponseFactory.fromResult(keyPair.identifier.base64String)
        } catch {
            return ResponseFactory.fromError(error)
        }
    }

    @objc(getPublicKeyIdentifier:)
    func getPublicKeyIdentifier(_ publicKeyBase64: String) -> Any {
        do {
            let publicKey = try self.crypto.importPublicKey(from: publicKeyBase64.base64Data)
            return ResponseFactory.fromResult(publicKey.identifier.base64String)
        } catch {
            return ResponseFactory.fromError(error)
        }
    }

    @objc(extractPublicKey:)
    func extractPublicKey(_ privateKeyBase64: String) -> Any {
        do {
            let keyPair = try self.crypto.importPrivateKey(from: privateKeyBase64.base64Data)
            let publicKeyData = try self.crypto.exportPublicKey(keyPair.publicKey)
            return ResponseFactory.fromResult([
                "publicKey": publicKeyData.base64String,
                "identifier": keyPair.identifier.base64String
            ])
        } catch {
            return ResponseFactory.fromError(error)
        }
    }

    @objc(generateRandomData:)
    func generateRandomData(_ size: Int) -> Any {
        do {
            return ResponseFactory.fromResult(try self.crypto.generateRandomData(ofSize: size).base64String)
        } catch {
            return ResponseFactory.fromError(error)
        }
    }

    // MARK: - Detached signatures

    @objc(signThenEncryptDetached:with:for:enablePadding:)
    func signThenEncryptDetached(
        _ dataBase64: String,
        with privateKeyBase64: String,
        for publicKeysBase64: [String],
        enablePadding: Bool
    ) -> Any {
        do {
            let keyPair = try self.crypto.importPrivateKey(from: privateKeyBase64.base64Data)
            let publicKeys = try importPublicKeys(publicKeysBase64)
            let signature = try self.crypto.generateSignature(of: dataBase64.base64Data, using: keyPair.privateKey)

            let cipher = RecipientCipher()
            cipher.setEncryptionCipher(encryptionCipher: Aes256Gcm())
            cipher.setRandom(random: self.crypto.rng)
            for publicKey in publicKeys {
                cipher.addKeyRecipient(recipientId: publicKey.identifier, publicKey: publicKey.key)
            }
            cipher.customParams().addData(key: VirgilCrypto.CustomParamKeySignature, value: signature)
            cipher.customParams().addData(key: VirgilCrypto.CustomParamKeySignerId, value: keyPair.privateKey.identifier)

            try cipher.startEncryption()
            let metadata = cipher.packMessageInfo()
            var encrypted = try cipher.processEncryption(data: dataBase64.base64Data)
            encrypted.append(try cipher.finishEncryption())

            return ResponseFactory.fromResult([
                "encryptedData": encrypted.base64String,
                "metadata": metadata.base64String
            ])
        } catch {
            return ResponseFactory.fromError(error)
        }
    }

    @objc(decryptThenVerifyDetached:withMetadata:andPrivateKey:usingOneOf:)
    func decryptThenVerifyDetached(
        _ dataBase64: String,
        withMetadata metadataBase64: String,
        andPrivateKey privateKeyBase64: String,
        usingOneOf publicKeysBase64: [String]
    ) -> Any {
        do {
            let keyPair = try self.crypto.importPrivateKey(from: privateKeyBase64.base64Data)
            let publicKeys = try importPublicKeys(publicKeysBase64)
            var combined = metadataBase64.base64Data
            combined.append(dataBase64.base64Data)
            let decrypted = try self.crypto.decryptAndVerify(
                combined,
                with: keyPair.privateKey,
                usingOneOf: publicKeys
            )
            return ResponseFactory.fromResult(decrypted.base64String)
        } catch {
            return ResponseFactory.fromError(error)
        }
    }

    // MARK: - Group sessions

    @objc(generateGroupSession:)
    func generateGroupSession(_ groupIdBase64: String) -> Any {
        do {
            let digest = self.crypto.computeHash(for: groupIdBase64.base64Data, using: .sha512)
            let sessionId = digest.subdata(in: 0..<32)

            let ticket = GroupSessionTicket()
            ticket.setRng(rng: self.crypto.rng)
            try ticket.setupTicketAsNew(sessionId: sessionId)
            let initialEpochMessage = ticket.getTicketMessage()

            return ResponseFactory.fromResult([
                "sessionId": sessionId.base64String,
                "currentEpochNumber": initialEpochMessage.getEpoch(),
                "epochMessages": [initialEpochMessage.serialize().base64String]
            ])
        } catch {
            return ResponseFactory.fromError(error)
        }
    }

    /// Unlike RNVirgilGroupSession.createSession, this sorts by epoch before
    /// replaying. That asymmetry is the shipped behaviour — see U3.
    @objc(importGroupSession:)
    func importGroupSession(_ epochMessagesBase64: [String]) -> Any {
        do {
            let epochMessages = try epochMessagesBase64.map {
                try GroupSessionMessage.deserialize(input: $0.base64Data)
            }
            let sorted = epochMessages.sorted { $0.getEpoch() < $1.getEpoch() }

            let session = GroupSession()
            session.setRng(rng: self.crypto.rng)
            var serialized: [String] = []
            for epochMessage in sorted {
                try session.addEpoch(message: epochMessage)
                serialized.append(epochMessage.serialize().base64String)
            }

            return ResponseFactory.fromResult([
                "sessionId": session.getSessionId().base64String,
                "currentEpochNumber": session.getCurrentEpoch(),
                "epochMessages": serialized
            ])
        } catch {
            return ResponseFactory.fromError(error)
        }
    }

    // MARK: - File operations (promise-based)

    @objc(encryptFile:toFile:for:enablePadding:resolver:rejecter:)
    func encryptFile(
        _ inputUri: String,
        toFile outputUri: String?,
        for publicKeysBase64: [String],
        enablePadding: Bool,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        let inputPath = FSUtils.path(fromUri: inputUri)
        guard FileManager.default.fileExists(atPath: inputPath) else {
            reject("invalid_input_file", "File does not exist at path \(inputPath)", nil)
            return
        }
        let outputPath = outputUri.map { FSUtils.path(fromUri: $0) } ?? FSUtils.tempFilePath(extension: nil)

        let publicKeys: [VirgilPublicKey]
        do {
            try FSUtils.prepareFileForWriting(outputPath)
            publicKeys = try importPublicKeys(publicKeysBase64)
        } catch {
            reject("invalid_output_file", error.localizedDescription, error)
            return
        }

        DispatchQueue.global().async {
            let inputStream = InputStream(fileAtPath: inputPath)!
            let outputStream = OutputStream(toFileAtPath: outputPath, append: false)!
            inputStream.open()
            outputStream.open()
            defer {
                inputStream.close()
                outputStream.close()
            }
            do {
                try self.crypto.encrypt(
                    inputStream,
                    to: outputStream,
                    for: publicKeys,
                    enablePadding: enablePadding
                )
                resolve(outputPath)
            } catch {
                reject("failed_to_encrypt", "Could not encrypt file; \(error.localizedDescription)", error)
            }
        }
    }

    @objc(decryptFile:toFile:with:resolver:rejecter:)
    func decryptFile(
        _ inputUri: String,
        toFile outputUri: String?,
        with privateKeyBase64: String,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        let inputPath = FSUtils.path(fromUri: inputUri)
        guard FileManager.default.fileExists(atPath: inputPath) else {
            reject("invalid_input_file", "File does not exist at path \(inputUri)", nil)
            return
        }
        let outputPath = outputUri.map { FSUtils.path(fromUri: $0) }
            ?? FSUtils.tempFilePath(extension: (inputPath as NSString).pathExtension)

        let keyPair: VirgilKeyPair
        do {
            try FSUtils.prepareFileForWriting(outputPath)
        } catch {
            reject("invalid_output_file", error.localizedDescription, error)
            return
        }
        do {
            keyPair = try self.crypto.importPrivateKey(from: privateKeyBase64.base64Data)
        } catch {
            reject("invalid_private_key", "The given value is not a valid private key", error)
            return
        }

        DispatchQueue.global().async {
            let inputStream = InputStream(fileAtPath: inputPath)!
            let outputStream = OutputStream(toFileAtPath: outputPath, append: false)!
            inputStream.open()
            outputStream.open()
            defer {
                inputStream.close()
                outputStream.close()
            }
            do {
                try self.crypto.decrypt(inputStream, to: outputStream, with: keyPair.privateKey)
                resolve(outputPath)
            } catch {
                reject("failed_to_decrypt", "Could not decrypt file; \(error.localizedDescription)", error)
            }
        }
    }

    @objc(generateFileSignature:with:resolver:rejecter:)
    func generateFileSignature(
        _ inputUri: String,
        with privateKeyBase64: String,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        let inputPath = FSUtils.path(fromUri: inputUri)
        guard FileManager.default.fileExists(atPath: inputPath) else {
            reject("invalid_input_file", "File does not exist at path \(inputUri)", nil)
            return
        }
        let keyPair: VirgilKeyPair
        do {
            keyPair = try self.crypto.importPrivateKey(from: privateKeyBase64.base64Data)
        } catch {
            reject("invalid_private_key", "The given value is not a valid private key", error)
            return
        }

        DispatchQueue.global().async {
            let inputStream = InputStream(fileAtPath: inputPath)!
            inputStream.open()
            defer { inputStream.close() }
            do {
                let signature = try self.crypto.generateStreamSignature(of: inputStream, using: keyPair.privateKey)
                resolve(signature.base64String)
            } catch {
                reject("failed_to_sign", "Could not generate signature of file; \(error.localizedDescription)", error)
            }
        }
    }

    @objc(verifyFileSignature:ofFile:with:resolver:rejecter:)
    func verifyFileSignature(
        _ signatureBase64: String,
        ofFile inputUri: String,
        with publicKeyBase64: String,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        let inputPath = FSUtils.path(fromUri: inputUri)
        guard FileManager.default.fileExists(atPath: inputPath) else {
            reject("invalid_input_file", "File does not exist at path \(inputPath)", nil)
            return
        }
        let publicKey: VirgilPublicKey
        do {
            publicKey = try self.crypto.importPublicKey(from: publicKeyBase64.base64Data)
        } catch {
            reject("invalid_public_key", "The given value is not a valid public key", error)
            return
        }

        DispatchQueue.global().async {
            let inputStream = InputStream(fileAtPath: inputPath)!
            inputStream.open()
            defer { inputStream.close() }
            let isValid = (try? self.crypto.verifyStreamSignature(
                signatureBase64.base64Data,
                of: inputStream,
                with: publicKey
            )) ?? false
            resolve(isValid)
        }
    }
}
