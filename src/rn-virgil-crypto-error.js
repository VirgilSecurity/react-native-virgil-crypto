import { Platform } from 'react-native';

const iosErrorCodeToMessage = {
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-1': 'Received invalid arguments',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-2': 'Not all context prerequisites are satisfied.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-3': 'Error from one of third-party modules was not handled.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-101': 'Buffer capacity is not enough to hold result.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-200': 'Unsupported algorithm.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-201': 'Authentication failed during decryption.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-202': 'Attempt to read data out of buffer bounds.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-203': 'ASN.1 encoded data is corrupted.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-204': 'Attempt to read ASN.1 type that is bigger then requested C type.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-205': 'ASN.1 representation of PKCS#1 public key is corrupted.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-206': 'ASN.1 representation of PKCS#1 private key is corrupted.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-207': 'ASN.1 representation of PKCS#8 public key is corrupted.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-208': 'ASN.1 representation of PKCS#8 private key is corrupted.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-209': 'Encrypted data is corrupted.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-210': 'Underlying random operation returns error.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-211': 'Generation of the private or secret key failed.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-212': 'One of the entropy sources failed.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-213': 'Requested data to be generated is too big.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-214': 'Base64 encoded string contains invalid characters.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-215': 'PEM data is corrupted.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-216': 'Exchange key return zero.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-217': 'Ed25519 public key is corrupted.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-218': 'Ed25519 private key is corrupted.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-219': 'CURVE25519 public key is corrupted.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-220': 'CURVE25519 private key is corrupted.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-221': 'Elliptic curve public key format is corrupted see RFC 5480.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-222': 'Elliptic curve public key format is corrupted see RFC 5915.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-223': 'ASN.1 representation of a public key is corrupted.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-224': 'ASN.1 representation of a private key is corrupted.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-225': 'Key algorithm does not accept given type of public key.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-226': 'Key algorithm does not accept given type of private key.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-301': 'Decryption failed, because message info was not given explicitly, and was not part of an encrypted message.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-302': 'Message Info is corrupted.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-303': 'Recipient defined with id is not found within message info during data decryption.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-304': 'Content encryption key can not be decrypted with a given private key.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-305': 'Content encryption key can not be decrypted with a given password.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-306': 'Custom parameter with a given key is not found within message info.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-307': 'A custom parameter with a given key is found, but the requested value type does not correspond to the actual type.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-308': 'Signature format is corrupted.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-309': 'Message Info footer is corrupted.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-401': 'Brainkey password length is out of range.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-402': 'Brainkey number length should be 32 byte.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-403': 'Brainkey point length should be 65 bytes.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-404': 'Brainkey name is out of range.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-405': 'Brainkey internal error.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-406': 'Brainkey point is invalid.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-407': 'Brainkey number buffer length capacity should be >= 32 byte.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-408': 'Brainkey point buffer length capacity should be >= 32 byte.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-409': 'Brainkey seed buffer length capacity should be >= 32 byte.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-410': 'Brainkey identity secret is invalid.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-501': 'Invalid padding.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-601': 'Protobuf error.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-701': 'Session id doesnt match.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-702': 'Epoch not found.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-703': 'Wrong key type.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-704': 'Invalid signature.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-705': 'Ed25519 error.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-706': 'Duplicate epoch.',
  'EVIRGILCRYPTOFOUNDATION.FOUNDATIONERROR-707': 'Plain text too long.'
};

const getErrorNameFromDomain = (domain) => {
  if (typeof domain !== 'string' || domain === '') {
    return null;
  }
  const parts = domain.split('.');
  return parts[parts.length - 1].replace(/Exception$/, 'Error');
}

const getErrorMessage = (nativeErrorInfo) => {
  return Platform.select({
    ios: iosErrorCodeToMessage[nativeErrorInfo.code] || nativeErrorInfo.message,
    android: nativeErrorInfo.message
  });
}

export class RNVirgilCryptoError extends Error {
  constructor(nativeErrorInfo) {
    super(getErrorMessage(nativeErrorInfo));
    this.name = getErrorNameFromDomain(nativeErrorInfo.domain) || 'VirgilCryptoError';
    this.code = nativeErrorInfo.code;
    this.userInfo = nativeErrorInfo.userInfo;
    this.nativeStack = Platform.OS === 'ios' ? nativeErrorInfo.nativeStackIOS : nativeErrorInfo.nativeStackAndroid;
  }
}
