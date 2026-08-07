import Foundation
import VirgilCryptoFoundation

/// Group session operations.
///
/// virgil-crypto-c 0.19.1 replaced foundation's group-session array typedefs
/// with strong struct types, but the iteration model is unchanged:
/// `addEpoch` still takes one message per call.
@objc(RNVirgilGroupSession)
class RNVirgilGroupSession: NSObject {

    private let random = CtrDrbg()
    private let keyProvider = KeyProvider()

    override init() {
        super.init()
        try? self.random.setupDefaults()
        try? self.keyProvider.setupDefaults()
    }

    @objc static func requiresMainQueueSetup() -> Bool {
        return false
    }

    /// Builds a session from serialized epoch messages.
    ///
    /// Deliberately does NOT sort: this helper feeds encrypt/decrypt and has
    /// always consumed the caller's order. Only `generateGroupSession` and
    /// `importGroupSession` in RNVirgilCrypto sort by epoch. Do not "fix" the
    /// asymmetry here — it is the shipped behaviour.
    private func createSession(from epochMessagesBase64: [String]) throws -> GroupSession {
        let session = GroupSession()
        session.setRng(rng: self.random)
        for epochMessageBase64 in epochMessagesBase64 {
            let epochMessage = try GroupSessionMessage.deserialize(input: epochMessageBase64.base64Data)
            try session.addEpoch(message: epochMessage)
        }
        return session
    }

    private func dictionary(from message: GroupSessionMessage) -> [String: Any] {
        return [
            "epochNumber": message.getEpoch(),
            "sessionId": message.getSessionId().base64String,
            "data": message.serialize().base64String
        ]
    }

    @objc(encrypt:withSigningKey:andEpochMessages:)
    func encrypt(
        _ dataBase64: String,
        withSigningKey signingKeyBase64: String,
        andEpochMessages epochMessagesBase64: [String]
    ) -> Any {
        do {
            let privateKey = try self.keyProvider.importPrivateKey(keyData: signingKeyBase64.base64Data)
            let session = try createSession(from: epochMessagesBase64)
            let message = try session.encrypt(plainText: dataBase64.base64Data, privateKey: privateKey)
            return ResponseFactory.fromResult(message.serialize().base64String)
        } catch {
            return ResponseFactory.fromError(error)
        }
    }

    @objc(decrypt:withVerifyingKey:andEpochMessages:)
    func decrypt(
        _ encryptedMessageBase64: String,
        withVerifyingKey verifyingKeyBase64: String,
        andEpochMessages epochMessagesBase64: [String]
    ) -> Any {
        do {
            let publicKey = try self.keyProvider.importPublicKey(keyData: verifyingKeyBase64.base64Data)
            let encryptedMessage = try GroupSessionMessage.deserialize(input: encryptedMessageBase64.base64Data)
            let session = try createSession(from: epochMessagesBase64)
            let decrypted = try session.decrypt(message: encryptedMessage, publicKey: publicKey)
            return ResponseFactory.fromResult(decrypted.base64String)
        } catch {
            return ResponseFactory.fromError(error)
        }
    }

    @objc(addNewEpoch:)
    func addNewEpoch(_ epochMessagesBase64: [String]) -> Any {
        do {
            let session = try createSession(from: epochMessagesBase64)
            let epochTicket = try session.createGroupTicket()
            let epochMessage = epochTicket.getTicketMessage()
            try session.addEpoch(message: epochMessage)
            return ResponseFactory.fromResult(dictionary(from: epochMessage))
        } catch {
            return ResponseFactory.fromError(error)
        }
    }

    @objc(parseMessage:)
    func parseMessage(_ messageBase64: String) -> Any {
        do {
            let message = try GroupSessionMessage.deserialize(input: messageBase64.base64Data)
            return ResponseFactory.fromResult(dictionary(from: message))
        } catch {
            return ResponseFactory.fromError(error)
        }
    }
}
