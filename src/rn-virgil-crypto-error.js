import { Platform } from 'react-native';

export class RNVirgilCryptoError extends Error {
  constructor(nativeErrorInfo) {
    super(nativeErrorInfo.message);
    this.name = 'RNVirgilCryptoError';
    this.code = nativeErrorInfo.message;
    this.userInfo = nativeErrorInfo.userInfo;
    this.nativeStack = Platform.OS === 'ios' ? nativeErrorInfo.nativeStackIOS : nativeErrorInfo.nativeStackAndroid;
  } 
}