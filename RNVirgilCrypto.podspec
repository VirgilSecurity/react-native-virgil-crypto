require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = 'RNVirgilCrypto'
  s.version      = package['version']
  s.summary      = package['description']
  s.homepage     = 'https://github.com/VirgilSecurity/react-native-virgil-crypto'
  s.license      = package['license']
  s.authors      = { 'Virgil Security Inc.': 'support@virgilsecurity.com' }
  s.platforms    = { ios: '9.0' }
  s.source       = { git: 'https://github.com/VirgilSecurity/react-native-virgil-crypto.git', tag: "#{s.version}" }
  s.source_files = 'ios/**/*.{h,m}'
  s.requires_arc = true
  s.static_framework = true

  s.dependency 'React'
  s.dependency 'VirgilCrypto', '5.3.0'
  s.dependency 'VirgilCryptoFoundation', '0.12.0'
  s.dependency 'VirgilCryptoPythia', '0.12.0'
end
