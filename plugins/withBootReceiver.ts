import {
  ConfigPlugin,
  withAndroidManifest,
  withDangerousMod
} from 'expo/config-plugins'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const withBootReceiverManifest: ConfigPlugin = config =>
  withAndroidManifest(config, config => {
    const manifest = config.modResults

    // ----- Add permissions -----
    manifest.manifest['uses-permission'] =
      manifest.manifest['uses-permission'] ?? []

    const permissions = [
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.SYSTEM_ALERT_WINDOW',
      'android.permission.WAKE_LOCK',
      'android.permission.RECORD_AUDIO',
      'android.permission.READ_PHONE_STATE',
      'android.permission.CHANGE_NETWORK_STATE',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION'
    ]

    permissions.forEach(permission => {
      // Avoid duplicate entries
      const exists = manifest.manifest['uses-permission']?.some(
        (p: any) => p.$['android:name'] === permission
      )
      if (!exists) {
        manifest.manifest['uses-permission']?.push({
          $: {
            'android:name': permission
          }
        })
      }
    })

    // ----- Add receiver -----
    const app = manifest.manifest.application?.[0]
    if (!app) return config

    app.receiver = app.receiver ?? []

    // Ensure we don't add duplicate receivers if you run prebuild multiple times
    const receiverExists = app.receiver.some(
      (r: any) => r.$['android:name'] === '.BootReceiver'
    )

    if (!receiverExists) {
      app.receiver.push({
        $: {
          'android:name': '.BootReceiver',
          'android:enabled': 'true',
          'android:exported': 'true'
        },
        'intent-filter': [
          {
            action: [
              {
                $: {
                  'android:name': 'android.intent.action.BOOT_COMPLETED'
                }
              }
            ]
          }
        ]
      })
    }

    // ----- Configure MainActivity soft input mode -----
    app.activity = app.activity ?? []
    const mainActivity = app.activity.find(
      (a: any) => a.$['android:name'] === '.MainActivity'
    )

    if (mainActivity && mainActivity.$) {
      // Ensure keyboard shows properly for text inputs
      mainActivity.$['android:windowSoftInputMode'] = 'adjustResize'
      // Keep screen on for vending machine tablet
      mainActivity.$['android:keepScreenOn'] = 'true'
    }

    return config
  })

const withBootReceiverSource: ConfigPlugin = config =>
  withDangerousMod(config, [
    'android',
    async config => {
      const pkg = config.android?.package
      if (!pkg) throw new Error('android.package is required')

      const packagePath = pkg.replace(/\./g, '/')
      const srcPath = path.join(__dirname, 'BootReceiver.kt')
      const destDir = path.join(
        config.modRequest.platformProjectRoot,
        'app/src/main/java',
        packagePath
      )

      fs.mkdirSync(destDir, { recursive: true })
      const destPath = path.join(destDir, 'BootReceiver.kt')
      fs.copyFileSync(srcPath, destPath)

      return config
    }
  ])

const withBootReceiver: ConfigPlugin = config => {
  config = withBootReceiverManifest(config)
  config = withBootReceiverSource(config)
  return config
}

export default withBootReceiver
