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
  s.source_files = 'ios/**/*.{h,m,swift}'
  s.requires_arc = true
  s.swift_version = '5.9'

  if respond_to?(:install_modules_dependencies, true)
    install_modules_dependencies(s)
  else
    s.dependency 'React-Core'
  end

  # Virgil is no longer distributed via CocoaPods. Upstream dropped podspecs at
  # virgil-crypto-c 0.17.2, so 0.17.1 was the last pod-reachable version.
  #
  # `spm_dependency` is React Native's own podspec helper (scripts/cocoapods/spm.rb,
  # shipped since 0.75.0). At `pod install` it writes an XCRemoteSwiftPackageReference
  # into the Pods project; Xcode's SPM resolver then walks the graph and fetches the
  # checksum-verified xcframeworks. Declaring virgil-crypto-x is enough — it pins
  # virgil-crypto-c exactly at 0.19.2, so we must not declare crypto-c ourselves.
  spm_dependency(s,
    url: 'https://github.com/VirgilSecurity/virgil-crypto-x.git',
    requirement: { kind: 'exactVersion', version: '7.2.4' },
    products: ['VirgilCrypto']
  )
end
