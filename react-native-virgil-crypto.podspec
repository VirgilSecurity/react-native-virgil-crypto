require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = package['name']
  s.version      = package['version']
  s.summary      = package['description']
  s.license      = package['license']
  s.authors      = package['author']
  s.homepage     = package['homepage']
  s.platform     = :ios, '9.0'
  s.source       = { :git => 'https://github.com/VirgilSecurity/react-native-virgil-crypto.git#master' }
  s.source_files  = 'ios/**/*.{h,m}'
  s.requires_arc = true
  s.static_framework = true
  s.dependency 'React'
  s.dependency 'VirgilCrypto', '5.1.0'
  s.dependency 'VirgilCryptoFoundation', '~> 0.10.0'
  s.dependency 'VirgilCryptoPythia', '~> 0.10.0'
end