import { Buffer } from 'buffer';
import { dataToBase64 } from './encoding';

describe('dataToBase64', () => {
  it('transforms Buffer to base64 string', () => {
    const data = Buffer.from('data');
    const actual = dataToBase64(data, 'utf8', 'data');
    expect(actual).toEqual('ZGF0YQ==');
  });

  it('throws if "defaultEncoding" is not provided', () => {
    expect(() => {
      dataToBase64('ignore', undefined, 'data');
    }).toThrow(TypeError);
  });

  it('throws if "defaultEncoding" is not a valid encoding', () => {
    expect(() => {
      dataToBase64('ignore', 'not_an_encoding', 'data');
    }).toThrow(TypeError);
  });

  it('returns the value if it\'s already a string in base64', () => {
    const data = 'ZGF0YQ==';
    expect(dataToBase64(data, 'base64', 'data')).toEqual(data);
  });

  it('converts string from utf8 to base64', () => {
    const data = 'data';
    expect(dataToBase64(data, 'utf8', 'data')).toEqual('ZGF0YQ==');
  });

  it('converts Uint8Array to base64 string', () => {
    const data = new Uint8Array('data'.split('').map(c => c.charCodeAt(0)));
    expect(dataToBase64(data, 'utf8', 'data')).toEqual('ZGF0YQ==');
  });

  it('converts object values to base64 string', () => {
    const data = { value: 'data', encoding: 'utf8' };
    expect(dataToBase64(data, 'utf8', 'data')).toBe('ZGF0YQ==');
  });

  it('throws if given an object value with the wrong format', () => {
    const notData = { x: 'invalid' };
    expect(() => {
      dataToBase64(notData, 'utf8', 'data');
    }).toThrow(TypeError);
  });

  it('throws if given an object value with invalid encoding', () => {
    const data = { value: 'data', encoding: 'not_an_encoding' };
    expect(() => {
      dataToBase64(data, 'utf8', 'data');
    }).toThrow(TypeError);
  });

  it('throws if given value is not in any of the supported formats', () => {
    expect(() => {
      dataToBase64(42, 'utf8', 'data');
    }).toThrow(TypeError);
  });

  it('throws if given value is undefined', () => {
    expect(() => {
      dataToBase64(undefined, 'utf8', 'data');
    }).toThrow(TypeError);
  });

  it('throws if given value is null', () => {
    expect(() => {
      dataToBase64(null, 'utf8', 'data');
    }).toThrow();
  });
});
