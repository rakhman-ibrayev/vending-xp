import { useEffect, useState } from 'react'
import * as Application from 'expo-application'
import VendingMachineAPI from '../../services/vending-machine'
import { setMachineSerialNumber } from '@/lib/api/api'

function readDeviceId(): string | null {
  try {
    // expo-application >= 5: androidId constant was replaced by getAndroidId().
    return Application.getAndroidId() || null
  } catch {
    return null
  }
}

export function useVendingMachine() {
  const [isConnected, setIsConnected] = useState(false)
  const [serialNumber, setSerialNumber] = useState<string | null>(null)
  const [lastError, setLastError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    // Use stable Android device ID as the machine identifier.
    // The existing registration flow shows a QR code when the backend
    // doesn't recognise this ID yet.
    const deviceId = readDeviceId()
    if (deviceId) {
      setSerialNumber(deviceId)
      setMachineSerialNumber(deviceId)
    } else {
      setLastError('Unable to read Android device ID')
    }

    // Ref-counted: the port stays open while any consumer is mounted and is
    // closed (unlocked) when the last one unmounts.
    VendingMachineAPI.acquire()
    VendingMachineAPI.init()
      .then(ok => {
        if (active) setIsConnected(ok)
      })
      .catch((err: unknown) => {
        if (active)
          setLastError(err instanceof Error ? err.message : String(err))
      })

    return () => {
      active = false
      VendingMachineAPI.release()
    }
  }, [])

  return {
    isConnected,
    serialNumber,
    lastError
  }
}
