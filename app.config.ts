import 'tsx/cjs'
import { ExpoConfig, ConfigContext } from 'expo/config'

module.exports = ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'vending',
  slug: 'vending',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'vending',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/icon.png',
      backgroundColor: '#ffffff'
    },
    edgeToEdgeEnabled: true,
    package: 'com.pharmexpress.vending'
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff'
      }
    ],
    './plugins/withBootReceiver'
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    router: {},
    eas: {
      projectId: '4724abbe-9ced-41cd-9b43-51e1634c8703'
    }
  },
  owner: 'pharmexpress',
  runtimeVersion: {
    policy: 'appVersion'
  },
  updates: {
    url: 'https://u.expo.dev/4724abbe-9ced-41cd-9b43-51e1634c8703',
    enabled: true,
    checkAutomatically: 'NEVER',
    fallbackToCacheTimeout: 0
  }
})
