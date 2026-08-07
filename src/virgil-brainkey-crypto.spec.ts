import { NativeModules } from 'react-native';
import { Buffer } from 'buffer';
import { virgilBrainKeyCrypto } from './virgil-brainkey-crypto';

jest.mock('react-native', () => ({
  NativeModules: {
    RNVirgilBrainKeyCrypto: {
      blind: jest.fn(),
      deblind: jest.fn(),
    },
  },
  Platform: {
    OS: 'ios',
    select: ({ ios }: { ios: unknown }) => {
      return ios;
    },
  },
}));

const { RNVirgilBrainKeyCrypto } = NativeModules;

const b64 = (value: string) => Buffer.from(value).toString('base64');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('blind', () => {
  it('returns the blinded point and the deblind factor', () => {
    RNVirgilBrainKeyCrypto.blind.mockReturnValue({
      result: { blindedPoint: b64('blinded'), deblindFactor: b64('factor') },
    });

    const result = virgilBrainKeyCrypto.blind('password');

    expect(result.blindedPoint.toString()).toBe('blinded');
    expect(result.deblindFactor.toString()).toBe('factor');
  });

  it('passes the password to the native module as base64', () => {
    RNVirgilBrainKeyCrypto.blind.mockReturnValue({
      result: { blindedPoint: b64('blinded'), deblindFactor: b64('factor') },
    });

    virgilBrainKeyCrypto.blind('password');

    expect(RNVirgilBrainKeyCrypto.blind).toHaveBeenCalledWith(b64('password'));
  });

  it('throws when the native module returns an error', () => {
    RNVirgilBrainKeyCrypto.blind.mockReturnValue({
      error: { code: '-1', message: 'boom' },
    });

    expect(() => virgilBrainKeyCrypto.blind('password')).toThrow();
  });
});

describe('deblind', () => {
  const params = {
    password: 'password',
    hardenedPoint: b64('hardened'),
    deblindFactor: b64('factor'),
    keyName: 'my-app-key',
  };

  it('returns the derived seed', () => {
    RNVirgilBrainKeyCrypto.deblind.mockReturnValue({ result: b64('seed') });

    expect(virgilBrainKeyCrypto.deblind(params).toString()).toBe('seed');
  });

  it('forwards all four arguments to the native module as base64', () => {
    RNVirgilBrainKeyCrypto.deblind.mockReturnValue({ result: b64('seed') });

    virgilBrainKeyCrypto.deblind(params);

    expect(RNVirgilBrainKeyCrypto.deblind).toHaveBeenCalledWith(
      b64('password'),
      b64('hardened'),
      b64('factor'),
      b64('my-app-key')
    );
  });

  // keyName is a domain-separation tag: a different value derives a different,
  // unrecoverable seed and nothing at runtime can tell that apart from a wrong
  // password. It must reach the native layer verbatim.
  it('does not default or normalize keyName', () => {
    RNVirgilBrainKeyCrypto.deblind.mockReturnValue({ result: b64('seed') });

    virgilBrainKeyCrypto.deblind({ ...params, keyName: 'other-key' });

    expect(RNVirgilBrainKeyCrypto.deblind).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      b64('other-key')
    );
  });

  it('throws a TypeError when keyName is missing', () => {
    const { keyName, ...withoutKeyName } = params;

    expect(() =>
      virgilBrainKeyCrypto.deblind(withoutKeyName as unknown as typeof params)
    ).toThrow(TypeError);
    expect(RNVirgilBrainKeyCrypto.deblind).not.toHaveBeenCalled();
  });

  it('throws a TypeError when keyName is an empty string', () => {
    expect(() => virgilBrainKeyCrypto.deblind({ ...params, keyName: '' })).toThrow(TypeError);
    expect(RNVirgilBrainKeyCrypto.deblind).not.toHaveBeenCalled();
  });

  it('throws when the native module returns an error', () => {
    RNVirgilBrainKeyCrypto.deblind.mockReturnValue({
      error: { code: '-1', message: 'boom' },
    });

    expect(() => virgilBrainKeyCrypto.deblind(params)).toThrow();
  });
});
