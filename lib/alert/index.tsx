import { Alert } from '@/components/alert'
import { useCallback, useState } from 'react'

interface AlertProviderProps {
  children: React.ReactNode
}

type AlertOptions = {
  title?: string
  message?: string
  positiveText?: string
  negativeText?: string
  type?: 'default' | 'success' | 'error' | 'warning' | 'info'
  animationType?: 'fade' | 'scale' | 'slide'
  overlayClose?: boolean
  theme?: 'light' | 'dark'
  onPositivePress?: () => void
  onNegativePress?: () => void
}

let alert: (options: AlertOptions) => void

const AlertProvider = ({ children }: AlertProviderProps) => {
  const [visible, setVisible] = useState(false)
  const [options, setOptions] = useState<AlertOptions | null>(null)

  const showAlert = useCallback((opts: AlertOptions) => {
    setOptions(opts)
    setVisible(true)
  }, [])

  // bind global function
  alert = showAlert

  const handlePositive = () => {
    options?.onPositivePress?.()
    setVisible(false)
  }

  const handleNegative = () => {
    options?.onNegativePress?.()
    setVisible(false)
  }

  return (
    <>
      {children}

      <Alert
        visible={visible}
        title={options?.title}
        message={options?.message}
        positiveText={options?.positiveText}
        negativeText={options?.negativeText}
        type={options?.type}
        animationType={options?.animationType}
        overlayClose={options?.overlayClose}
        theme={options?.theme}
        onPositivePress={handlePositive}
        onNegativePress={handleNegative}
      />
    </>
  )
}

export { alert, AlertProvider, type AlertProviderProps }
