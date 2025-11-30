import * as Updates from 'expo-updates'
import { useEffect, useRef } from 'react'
import { hideLoading, showLoading } from '../loader'

const MINUTE_MS = 60_000

const CONFIG = {
  shouldCheckForUpdates: true,
  checkIntervalMs: 2.5 * MINUTE_MS
}

interface UseUpdateVersionOptions {
  checkIntervalMs?: number
}

const useUpdateVersion = ({
  checkIntervalMs = CONFIG.checkIntervalMs
}: UseUpdateVersionOptions = {}) => {
  const lastCheckedRef = useRef(0)

  useEffect(() => {
    const checkOnce = async () => {
      console.info(
        `[useUpdateVersion] ${CONFIG.shouldCheckForUpdates ? 'Checking for updates' : 'Not checking for updates'}`
      )

      if (!CONFIG.shouldCheckForUpdates) return

      try {
        const now = Date.now()

        if (
          now - lastCheckedRef.current <
          Math.max(CONFIG.checkIntervalMs, checkIntervalMs)
        )
          return

        lastCheckedRef.current = now
        const update = await Updates.checkForUpdateAsync()

        if (update.isAvailable) {
          showLoading?.()
          await Updates.fetchUpdateAsync()
          await Updates.reloadAsync()
          hideLoading?.()
        }
      } catch (error) {
        console.error('[useUpdateVersion] Update check failed:', error)
      }
    }

    // initial check on startup
    checkOnce()

    // interval checks
    const id = setInterval(checkOnce, checkIntervalMs)

    return () => {
      clearInterval(id)
    }
  }, [checkIntervalMs])
}

const enableVersionUpdates = () => {
  CONFIG.shouldCheckForUpdates = true
}

const disableVersionUpdates = () => {
  CONFIG.shouldCheckForUpdates = false
}

export {
  useUpdateVersion,
  enableVersionUpdates,
  disableVersionUpdates,
  type UseUpdateVersionOptions
}
