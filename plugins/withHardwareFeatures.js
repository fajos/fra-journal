const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Expo Config Plugin to mark non-essential hardware features (such as portrait orientation,
 * landscape orientation, touchscreen, and faketouch) as optional (android:required="false").
 *
 * This resolves the Google Play Console requirement:
 * "Required hardware feature declarations are restricting your app's availability:
 *  android.hardware.screen.portrait affects Phone, Tablet, Desktop, and Android XR users"
 */
module.exports = function withHardwareFeatures(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const manifest = androidManifest.manifest;

    // Ensure xmlns:tools is declared on <manifest>
    if (!manifest.$) {
      manifest.$ = {};
    }
    if (!manifest.$['xmlns:tools']) {
      manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    if (!Array.isArray(manifest['uses-feature'])) {
      manifest['uses-feature'] = [];
    }

    const optionalFeatures = [
      'android.hardware.screen.portrait',
      'android.hardware.screen.landscape',
      'android.hardware.touchscreen',
      'android.hardware.faketouch',
      'android.hardware.fingerprint',
      'android.hardware.biometrics',
    ];

    for (const featureName of optionalFeatures) {
      const existing = manifest['uses-feature'].find(
        (f) => f.$ && f.$['android:name'] === featureName
      );

      if (existing) {
        existing.$['android:required'] = 'false';
        existing.$['tools:replace'] = 'android:required';
      } else {
        manifest['uses-feature'].push({
          $: {
            'android:name': featureName,
            'android:required': 'false',
            'tools:replace': 'android:required',
          },
        });
      }
    }

    return config;
  });
};
