import { useMachine } from '@/entities/machines/use-machine'
import { useRestockEvent } from '@/entities/machines/use-restock-event'
import { useUpdateEvent } from '@/entities/machines/use-update-event'
import { useVendingMachine } from '@/entities/machines/use-vending-machine'
import { AlertProvider } from '@/lib/alert'
import { LoadingProvider } from '@/lib/loader'
import { useConnectSSE } from '@/lib/sse'
import { NoInternet } from '@/modules/no-internet'
import { StatusBar } from '@/modules/status-bar'
import {
  onlineManager,
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query'
import { useFonts } from 'expo-font'
import * as Network from 'expo-network'
import { Stack } from 'expo-router'
import { StatusBar as ExpoStatusBar } from 'expo-status-bar'
import { StyleSheet, View } from 'react-native'
import 'react-native-reanimated'

onlineManager.setEventListener(setOnline => {
  const eventSubscription = Network.addNetworkStateListener(state => {
    setOnline(!!state.isConnected)
  })

  return eventSubscription.remove
})

const queryClient = new QueryClient()

function Routes() {
  const machineQuery = useMachine()

  useConnectSSE({
    serialNumber: machineQuery.data?.data.data?.serial_number || ''
  })
  useUpdateEvent()
  useRestockEvent()

  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />

        <Stack.Screen
          name="orders/[orderId]"
          options={{ headerShown: false, gestureEnabled: false }}
        />

        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  )
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf')
  })
  const { serialNumber } = useVendingMachine()

  if (!loaded || !serialNumber) return null

  return (
    <QueryClientProvider client={queryClient}>
      <View style={styles.container}>
        <NoInternet>
          <View style={styles.statusBar}>
            <StatusBar />
          </View>

          <Routes />

          <ExpoStatusBar style="auto" />
        </NoInternet>
        <AlertProvider />
        <LoadingProvider />
      </View>
    </QueryClientProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  statusBar: {
    paddingInline: 18,
    paddingTop: 36
  }
})
