import { ExitModal } from '@/components/exit-modal'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { useNetworkState } from 'expo-network'
import { useState } from 'react'
import { StyleSheet, Text } from 'react-native'

interface NoInternetProps {
  children?: React.ReactNode
}

const NoInternet = ({ children }: NoInternetProps) => {
  const { isConnected } = useNetworkState()
  const [isExitModalOpen, setIsExitModalOpen] = useState(false)

  if (isConnected) return children

  return (
    <PageContainer style={styles.container}>
      <Text style={{ fontSize: 20 }}>Соединение отсутствует</Text>

      <ExitModal
        onClose={() => setIsExitModalOpen(false)}
        isOpen={isExitModalOpen}
      />

      <Button onPress={() => setIsExitModalOpen(true)}>Настройки</Button>
    </PageContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export { NoInternet, type NoInternetProps }
