import Foundation
import VirgilCryptoFoundation

/// Brain key primitives.
///
/// virgil-crypto-c 0.19.1 removed the Pythia module entirely; password
/// hardening now lives in foundation as BrainkeyClient/BrainkeyServer. This
/// module exposes the client-side primitives; the harden *request* itself is a
/// service call and belongs above this layer.
///
/// `verify` is not a service call — it is local elliptic-curve arithmetic over
/// the server's response, and nothing above this layer can perform it without
/// the primitive. The full client sequence is blind -> harden -> verify ->
/// deblind, and vscf_brainkey_client.h states verify "Must be called before
/// deblind() to authenticate the server response".
///
/// The `deblind` signature is genuinely different from Pythia's, not a rename:
/// it takes the password again plus a `keyName` domain-separation tag.
@objc(RNVirgilBrainKeyCrypto)
class RNVirgilBrainKeyCrypto: NSObject {

    @objc static func requiresMainQueueSetup() -> Bool {
        return false
    }

    private func makeClient() throws -> BrainkeyClient {
        let client = BrainkeyClient()
        try client.setupDefaults()
        return client
    }

    @objc(blind:)
    func blind(_ passwordBase64: String) -> Any {
        do {
            let client = try makeClient()
            let result = try client.blind(password: passwordBase64.base64Data)
            return ResponseFactory.fromResult([
                "blindedPoint": result.blindedPoint.base64String,
                "deblindFactor": result.deblindFactor.base64String
            ])
        } catch {
            return ResponseFactory.fromError(error)
        }
    }

    @objc(verify:hardenedPoint:serverPublicKey:proofValueC:proofValueS:)
    func verify(
        _ blindedPointBase64: String,
        hardenedPoint hardenedPointBase64: String,
        serverPublicKey serverPublicKeyBase64: String,
        proofValueC proofValueCBase64: String,
        proofValueS proofValueSBase64: String
    ) -> Any {
        do {
            let client = try makeClient()
            let isValid = try client.verify(
                blindedPoint: blindedPointBase64.base64Data,
                hardenedPoint: hardenedPointBase64.base64Data,
                serverPublicKey: serverPublicKeyBase64.base64Data,
                proofValueC: proofValueCBase64.base64Data,
                proofValueS: proofValueSBase64.base64Data
            )
            return ResponseFactory.fromResult(isValid)
        } catch {
            return ResponseFactory.fromError(error)
        }
    }

    @objc(deblind:hardenedPoint:deblindFactor:keyName:)
    func deblind(
        _ passwordBase64: String,
        hardenedPoint hardenedPointBase64: String,
        deblindFactor deblindFactorBase64: String,
        keyName keyNameBase64: String
    ) -> Any {
        do {
            let client = try makeClient()
            let seed = try client.deblind(
                password: passwordBase64.base64Data,
                hardenedPoint: hardenedPointBase64.base64Data,
                deblindFactor: deblindFactorBase64.base64Data,
                keyName: keyNameBase64.base64Data
            )
            return ResponseFactory.fromResult(seed.base64String)
        } catch {
            return ResponseFactory.fromError(error)
        }
    }
}
