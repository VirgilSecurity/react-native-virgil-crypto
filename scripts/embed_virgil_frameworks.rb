# Embeds Virgil's dynamic C-layer frameworks into the consuming app bundle.
#
# Why this is needed
# ------------------
# Virgil is resolved through Swift Package Manager (see RNVirgilCrypto.podspec).
# React Native's `spm_dependency` helper attaches the package product to the
# *pod* target only — it never touches the app target. That is fine for the
# pure-Swift products, which link statically into RNVirgilCrypto.framework, but
# virgil-crypto-c ships its C layer as **dynamic** xcframeworks (VSCCommon,
# VSCFoundation). Those are linked but never copied into the .app, so the app
# builds green and then dies at launch with:
#
#   dyld: Library not loaded: @rpath/VSCCommon.framework/VSCCommon
#
# This adds a build phase to the app target that copies (and, on device builds,
# re-signs) every VSC*.framework that SPM produced into the app's Frameworks
# folder — the same thing CocoaPods' own "[CP] Embed Pods Frameworks" phase does
# for pods.
#
# Usage — in your Podfile's post_install:
#
#   require_relative '../node_modules/react-native-virgil-crypto/scripts/embed_virgil_frameworks.rb'
#
#   post_install do |installer|
#     react_native_post_install(installer, config[:reactNativePath])
#     embed_virgil_frameworks!(installer)
#   end
#
# Requires `USE_FRAMEWORKS=dynamic pod install` — see MIGRATION.md.

VIRGIL_EMBED_PHASE_NAME = '[Virgil] Embed Virgil crypto frameworks'.freeze

VIRGIL_EMBED_SCRIPT = <<~'SH'
  set -euo pipefail

  # Escape hatch for consumers who embed these frameworks by other means.
  if [ "${SKIP_VIRGIL_FRAMEWORK_EMBED:-0}" = "1" ]; then
    echo "note: SKIP_VIRGIL_FRAMEWORK_EMBED=1, skipping"
    exit 0
  fi

  DEST="${TARGET_BUILD_DIR}/${FRAMEWORKS_FOLDER_PATH}"
  mkdir -p "${DEST}"

  shopt -s nullglob
  found=0
  for SRC in "${BUILT_PRODUCTS_DIR}"/VSC*.framework; do
    found=1
    NAME="$(basename "${SRC}")"
    echo "note: embedding ${NAME}"
    rsync -av --delete --filter 'P .DS_Store' "${SRC}/" "${DEST}/${NAME}/"

    if [ "${CODE_SIGNING_REQUIRED:-NO}" = "YES" ] \
       && [ -n "${EXPANDED_CODE_SIGN_IDENTITY:-}" ] \
       && [ "${EXPANDED_CODE_SIGN_IDENTITY}" != "-" ]; then
      codesign --force --sign "${EXPANDED_CODE_SIGN_IDENTITY}" \
        --preserve-metadata=identifier,entitlements \
        ${OTHER_CODE_SIGN_FLAGS:-} "${DEST}/${NAME}"
    fi
  done

  if [ "${found}" -eq 0 ]; then
    echo "warning: no VSC*.framework found in ${BUILT_PRODUCTS_DIR}; react-native-virgil-crypto will fail at launch. Did you run 'USE_FRAMEWORKS=dynamic pod install'?"
  fi
SH

# Adds the embed phase to every user target that links RNVirgilCrypto.
def embed_virgil_frameworks!(installer)
  installer.aggregate_targets.each do |aggregate_target|
    next unless aggregate_target.pod_targets.any? { |t| t.name == 'RNVirgilCrypto' }

    project = aggregate_target.user_project
    next if project.nil?

    aggregate_target.user_targets.each do |target|
      # Only app-like targets own a Frameworks folder worth embedding into.
      next unless target.respond_to?(:product_type) &&
                  target.product_type == 'com.apple.product-type.application'

      phase = target.shell_script_build_phases.find { |p| p.name == VIRGIL_EMBED_PHASE_NAME }
      phase ||= target.new_shell_script_build_phase(VIRGIL_EMBED_PHASE_NAME)

      phase.shell_path = '/bin/bash'
      phase.shell_script = VIRGIL_EMBED_SCRIPT
      # The frameworks are produced by SPM, not by a target Xcode tracks here,
      # so dependency analysis would wrongly skip this phase.
      phase.run_only_for_deployment_postprocessing = '0'
      phase.always_out_of_date = '1'

      Pod::UI.puts "[Virgil] Added '#{VIRGIL_EMBED_PHASE_NAME}' to target #{target.name}".green
    end

    project.save
  end
end
