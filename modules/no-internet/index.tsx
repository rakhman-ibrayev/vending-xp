import { PageContainer } from '@/components/page-container'
import { useNetworkState } from 'expo-network'
import { StyleSheet, Text } from 'react-native'

interface NoInternetProps {
  children?: React.ReactNode
}

const NoInternet = ({ children }: NoInternetProps) => {
  const { isConnected } = useNetworkState()

  if (isConnected) return children

  return (
    <PageContainer style={styles.container}>
      <Text style={{ fontSize: 26 }}>Соединение отсутствует</Text>
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
