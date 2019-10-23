const { resolve } = require('path');

module.exports = {
  dependencies: {
    'react-native-virgil-crypto': {
      platforms: {
        ios: { podspecPath: resolve(__dirname, 'react-native-virgil-crypto.podspec') }
      },
    },
  },
};