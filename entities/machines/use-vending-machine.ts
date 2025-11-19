import { useEffect, useState } from 'react'
import VendingMachineAPI from '../../services/vending-machine'
import { setMachineSerialNumber } from '@/lib/api/api'

export function useVendingMachine() {
  const [isConnected, setIsConnected] = useState(false)
  const [serialNumber, setSerialNumber] = useState<string | null>(null)
  const [lastError, setLastError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const ok = await VendingMachineAPI.init()

        setIsConnected(ok)

        if (ok) {
          try {
            const sn = await VendingMachineAPI.getSerialNumber()

            if (sn) {
              setSerialNumber(sn)
              setMachineSerialNumber(sn)
            }
          } catch (err: any) {
            setLastError(err.message ?? String(err))
          }
        }
      } catch (err: any) {
        setLastError(err.message ?? String(err))
      }
    })()
  }, [])

  return {
    isConnected,
    serialNumber,
    lastError
  }
}
