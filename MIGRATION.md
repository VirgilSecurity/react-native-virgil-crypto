# Migrating to react-native-virgil-crypto 0.7.0

0.7.0 moves both platforms onto the virgil-crypto-c **0.19.x** generation that the
rest of the Virgil SDK estate already runs on. Before this release the two
platforms were on different C-library generations — Android pinned
`foundation-android` 0.13.1, iOS pinned 0.17.1 — which meant the same JavaScript
call could behave differently depending on the device it ran on.

This is a breaking release. The package stays in `0.x`, so the break lands as a
minor bump.

**Read [What breaks](#what-breaks) first if you are short on time.** Two of the
five changes can lose access to key material, and neither has an automatic
migration.

---

## Dependency chain

| | Before (0.6.x) | After (0.7.0) |
|---|---|---|
| iOS delivery | CocoaPods (`VirgilCrypto` pod) | Swift Package Manager, via RN's `spm_dependency` |
| iOS `virgil-crypto-x` | 7.0.1 | 7.2.4 |
| iOS `virgil-crypto-c` | 0.17.1 | 0.19.2 |
| Android `crypto-android` | 7.1.0 | 7.5.1 |
| Android `foundation-android` | 0.13.1 | 0.19.1 |
| Pythia | `VirgilCryptoPythia` 0.17.1 / `pythia-android` | **removed** |
| React Native floor | 0.74 | **0.75.3** |
| iOS native language | Objective-C | Swift 5.9 |

The iOS pins were not merely old, they were terminal: virgil-crypto-c dropped
CocoaPods support at 0.17.2, so 0.17.1 was the last version reachable through a
pod dependency. Apple binaries now ship only as SPM `binaryTarget` xcframework
archives attached to GitHub releases.

---

## What you must change in your app

### 1. Raise your React Native floor to 0.75.3

`spm_dependency` is React Native's own podspec helper
(`react-native/scripts/cocoapods/spm.rb`), shipped since 0.75.0. There is no
backport for older React Native versions, and no way to reach virgil-crypto-c
0.19.x through CocoaPods.

New Architecture / TurboModules is still out of scope; this library runs on the
classic bridge.

### 2. Install pods with `USE_FRAMEWORKS=dynamic`

```sh
cd ios && USE_FRAMEWORKS=dynamic pod install
```

This is a requirement, not a preference. SPM builds the Virgil products as
dynamic frameworks. A statically linked `libRNVirgilCrypto.a` cannot resolve the
`direct field offset` symbols those products export, and the link fails.

If you already set `USE_FRAMEWORKS` for other reasons, `dynamic` is the only
value that works with this library.

### 3. Embed the Virgil C frameworks in your app bundle

virgil-crypto-c ships its C layer as **dynamic** xcframeworks (`VSCCommon`,
`VSCFoundation`). React Native's `spm_dependency` attaches the Swift package
product to the *pod* target only — it never touches your app target — so those
frameworks get linked but never copied into your `.app`. The build stays green
and the app dies on launch:

```
dyld: Library not loaded: @rpath/VSCCommon.framework/VSCCommon
```

This package ships a Podfile helper that fixes it. Add two lines to your
`ios/Podfile`:

```ruby
require_relative '../node_modules/react-native-virgil-crypto/scripts/embed_virgil_frameworks.rb'

# ...

post_install do |installer|
  react_native_post_install(installer, config[:reactNativePath])
  embed_virgil_frameworks!(installer)   # <- add this
end
```

It adds a build phase to your app target that copies — and, on device builds,
re-signs — every `VSC*.framework` SPM produced, the same way CocoaPods' own
`[CP] Embed Pods Frameworks` phase handles pods.

If you embed those frameworks by some other mechanism, set
`SKIP_VIRGIL_FRAMEWORK_EMBED=1` in your build settings to disable the phase.

### 4. Expect your own toolchain to compile the Virgil Swift wrappers

`VirgilCrypto` and `VirgilCryptoFoundation` are SPM **source** targets, not
prebuilt binaries, so your Xcode compiles them. That makes Swift-version
compatibility a per-consumer concern rather than an upstream one — virgil-crypto-c
0.19.2 exists specifically to fix a Swift 6 / Xcode 26 `@objc` visibility failure
that source compilation exposed.

This release was verified end to end on **Xcode 26.6 / Swift 6.3.3**, targeting an
iOS 26.4 simulator. Below that, React Native 0.75.3's own Xcode floor applies; we
have not tested older toolchains against 0.19.2, so if you are pinned to one,
build early.

Only the *Swift* wrappers are compiled from source. The C layer (`VSCCommon`,
`VSCFoundation`) arrives as checksum-verified prebuilt xcframeworks — which is
what step 3 is about.

---

## What breaks

### 5. Pythia is gone; `virgilBrainKeyCrypto` has a new signature

virgil-crypto-c 0.19.1 removed the Pythia module. Password hardening moved into
`foundation` as `BrainkeyClient` / `BrainkeyServer`. The `virgil-pythia-java`,
`virgil-pythia-x`, and `virgil-pythia-go` repositories were archived;
`virgil-e3kit-kotlin` (v3.0.0) and `virgil-e3kit-x` made the same move.

`virgilBrainKeyCrypto` **is still a public API** — the capability does not
disappear — but its argument shape now matches `BrainkeyClient`.

Before:

```javascript
import { virgilBrainKeyCrypto } from 'react-native-virgil-crypto';

const { blindedPassword, blindingSecret } = virgilBrainKeyCrypto.blind('password');
// ... send blindedPassword to the harden service, receive transformedPassword ...
const seed = virgilBrainKeyCrypto.deblind({ transformedPassword, blindingSecret });
```

After:

```javascript
import { virgilBrainKeyCrypto } from 'react-native-virgil-crypto';

const { blindedPoint, deblindFactor } = virgilBrainKeyCrypto.blind('password');
// ... send blindedPoint to the harden service, receive hardenedPoint ...
const seed = virgilBrainKeyCrypto.deblind({
  password: 'password',          // new: the password is needed again
  hardenedPoint,                 // was: transformedPassword
  deblindFactor,                 // was: blindingSecret
  keyName: 'my-app-brainkey-v1', // new: required, see below
});
```

Three things changed:

- `blind` returns `{ blindedPoint, deblindFactor }` instead of
  `{ blindedPassword, blindingSecret }`.
- `deblind` needs the **password** again. It is no longer derivable from the
  other arguments.
- `deblind` takes a **`keyName`** domain-separation tag, and there is no default.

Because `deblind` no longer satisfies `IBrainKeyCrypto` from
`@virgilsecurity/crypto-types`, this module no longer declares that interface.

#### `keyName` has no default, on purpose

`keyName` must be a stable, application-wide constant matching the value your
harden service used. Changing it derives a different, unrecoverable seed — and
**no runtime check can tell that apart from a wrong password**. There is no error,
no warning, just a seed that silently does not open anything.

Shipping a default constant would bake a policy choice into a pure-primitive
module, and a wrong default is worse than no default. So the library requires you
to supply one, and rejects an absent or empty value.

Pick it once, write it down, and never change it.

#### Pythia-derived keys cannot be recovered

**There is no automatic migration and no compatibility mode.** A seed derived
through Pythia cannot be reproduced through `BrainkeyClient` — the algorithms
differ. Any key material a user could only recover through their brainkey
password is unrecoverable through this library after upgrading.

Remedies are application-level, not library-level:

- If the brainkey seed protected a *backup* of a private key, have users
  re-backup under the new scheme while they still have the old app version, or
  re-register the identity.
- If it protected the identity key itself, users must re-register.
- Plan a window where both schemes are readable, if your architecture allows it.
  This library cannot provide one.

### 6. The Falcon key-type constant was renamed

The `Round5` post-quantum KEM was replaced upstream by ML-KEM-768 (the
standardized Kyber). The constant follows:

```diff
- KeyPairType.CURVE25519_ROUND5_ED25519_FALCON
+ KeyPairType.CURVE25519_MLKEM768_ED25519_FALCON
```

This is not a rename of the same algorithm — it *is* a different KEM. Upstream
removed round5 and liboqs outright and replaced them with the standalone
`mlkem-native` library; the algorithm identifier went from
`vscf_alg_id_ROUND5_ND_1CCA_5D` to `vscf_alg_id_ML_KEM_768`. Keys generated under
the old constant are not interoperable with keys generated under the new one,
there is no conversion, and you should rotate any Falcon-hybrid keys you issued.

One thing that may look wrong but is not: on Android the underlying Java enum is
still spelled `KeyPairType.CURVE25519_ROUND5_ED25519_FALCON` at
`foundation-android` 0.19.1, because upstream has not renamed the wrapper
constant yet. It resolves to ML-KEM-768. If that name shows up in a stack trace
or a serialized value, you are still on the new KEM — only the label lags.

The default key type is unchanged: **Ed25519**.

### 7. `generateKeysFromKeyMaterial(seed, keyPairType)` now works on iOS

This is a fix, not a break. The two-argument form was declared in the JS layer
and implemented on Android, but the iOS native module never exposed
`generateKeyPairWithTypeAndSeed` — so passing a `keyPairType` on iOS threw
instead of generating a key. The Swift port closes that gap.

Nothing to migrate: no iOS build ever produced a key through this path, so there
is no old output to reconcile.

---

## What does *not* break

### Existing ciphertext still decrypts

**Every payload written by 0.6.x and earlier still decrypts after upgrading.**
Do not discard old ciphertext.

You may have heard that 0.19.x changed the default ECIES data cipher from
AES-256-CBC to AES-256-GCM. It did not. `vscf_recipient_cipher.c` has defaulted
to AES-256-GCM since at least v0.13.1 — the version this library shipped on
Android before 0.7.0 — so there is no cipher-default change in this migration at
all, and nothing that would make old data unreadable.

Regardless of which cipher wrote a given payload, Virgil's CMS envelope is
self-describing: `vscf_recipient_cipher` builds the decryption cipher from the
message's own `data_encryption_alg_info` rather than from a compile-time default,
and AES-256-CBC remains compiled in at 0.19.2.

This is verified rather than asserted. `E2ETests/e2e/test-cases.ts` commits two
ciphertexts produced by an older stack — one deliberately AES-256-CBC, one the
AES-256-GCM a pre-migration app would actually have written — and decrypts both
on 0.19.2.

If some of your data *is* AES-256-CBC because an older application explicitly
selected that cipher, it stays readable, but CBC has no AEAD tag. Re-encrypting
at rest is worth doing on its own merits, not because this release requires it.

### Group sessions are unaffected

Foundation group sessions (`generateGroupSession`, `importGroupSession`,
`calculateGroupSessionId`, and the `GroupSession` methods) exist at 0.19.2 and
behave as before. 0.19.1's "group session array typedefs replaced with strong
struct types" note is an internal C-level change with no bridge-visible effect.

Do not confuse this with **Ratchet Groups**, which upstream removed in 0.15.1.
That is a different library, and this package has never wrapped ratchet.

### File encryption

`encryptFile`, `decryptFile`, `generateFileSignature`, and `verifyFileSignature`
use the high-level stream API and are unchanged by this release. Files encrypted
by earlier versions still decrypt, for the same self-describing-envelope reason
as above.

These paths are not covered by an automated end-to-end round-trip: the E2E
harness has no filesystem library to write a test file with. They were verified
by inspection only — flagged here rather than left implied.

---

## Migration path for existing users

1. Raise React Native to **0.75.3** or newer.
2. Upgrade the package: `yarn add react-native-virgil-crypto@^0.7.0`.
3. Add the `embed_virgil_frameworks!` call to your `ios/Podfile` post_install
   (step 3 above), then run `cd ios && USE_FRAMEWORKS=dynamic pod install`.
4. Replace `CURVE25519_ROUND5_ED25519_FALCON` with
   `CURVE25519_MLKEM768_ED25519_FALCON`, and schedule rotation for any keys
   issued under the old constant.
5. Rewrite every `virgilBrainKeyCrypto` call site against the new signature, and
   choose your `keyName` constant.
6. Decide and communicate your recovery story for users whose key material was
   reachable only through a Pythia-derived brainkey seed. Do this *before* you
   ship the upgrade — after it ships, the old path is gone.
7. **Launch the app on a real simulator or device before releasing.** A green
   `xcodebuild` proves nothing about whether the dynamic Virgil frameworks were
   embedded; that failure only appears at launch.

---

## Reference

- [virgil-crypto-c changelog](https://github.com/VirgilSecurity/virgil-crypto-c/blob/master/ChangeLog)
- [virgil-crypto-x 7.2.4](https://github.com/VirgilSecurity/virgil-crypto-x/releases/tag/7.2.4)
- [React Native `spm_dependency` (facebook/react-native#44627)](https://github.com/facebook/react-native/pull/44627)
