require 'json'
require Pod::Executable.execute_command('node', ['-p',
  'require.resolve(
    "react-native/scripts/react_native_pods.rb",
    {paths: [process.argv[1]]},
  )', __dir__]).strip

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = 'RNVirgilCrypto'
  s.version      = package['version']
  s.summary      = package['description']
  s.homepage     = 'https://github.com/VirgilSecurity/react-native-virgil-crypto'
  s.license      = package['license']
  s.authors      = { 'Virgil Security Inc.': 'support@virgilsecurity.com' }
  s.platforms    = { ios: min_ios_version_supported }
  s.source       = { git: 'https://github.com/VirgilSecurity/react-native-virgil-crypto.git', tag: "#{s.version}" }
  s.source_files = 'ios/**/*.{h,m}'
  s.requires_arc = true
  s.static_framework = true

  if respond_to?(:install_modules_dependencies, true)
    install_modules_dependencies(s)
  else
    s.dependency 'React-Core'
  end

  s.dependency 'VirgilCrypto', '5.3.0'
  s.dependency 'VirgilCryptoFoundation', '0.12.0'
  s.dependency 'VirgilCryptoPythia', '0.12.0'
end
