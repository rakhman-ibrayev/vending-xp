import { Loading } from '@/components/loading'
import { useCallback, useState } from 'react'

let showLoading: (() => void) | undefined

let hideLoading: (() => void) | undefined

const LoadingProvider = () => {
  const [visible, setVisible] = useState(false)

  const show = useCallback(() => {
    setVisible(true)
  }, [])

  const hide = useCallback(() => {
    setVisible(false)
  }, [])

  // bind global functions
  showLoading = show
  hideLoading = hide

  return <Loading visible={visible} />
}

export { showLoading, hideLoading, LoadingProvider }
