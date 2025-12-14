import { useMachine } from '@/entities/machines/use-machine'
import { useRestockEvent } from '@/entities/machines/use-restock-event'
import { useUpdateEvent } from '@/entities/machines/use-update-event'
import { useVendingMachine } from '@/entities/machines/use-vending-machine'
import { AlertProvider } from '@/lib/alert'
import { QUERY_CONFIG } from '@/lib/api/constants'
import { LoadingProvider } from '@/lib/loader'
import { useConnectSSE } from '@/lib/sse'
import { withVersionUpdateCheck } from '@/lib/version-updates/with-version-update-check'
import { NoInternet } from '@/modules/no-internet'
import { StatusBar } from '@/modules/status-bar'
import { SupportContacts } from '@/modules/support-contacts'
import { logger } from '@/services/logger-service'
import {
  onlineManager,
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query'
import { useFonts } from 'expo-font'
import * as Network from 'expo-network'
import { Stack } from 'expo-router'
import { StatusBar as ExpoStatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import * as Sentry from '@sentry/react-native'
import 'react-native-reanimated'

onlineManager.setEventListener(setOnline => {
  const eventSubscription = Network.addNetworkStateListener(state => {
    setOnline(!!state.isConnected)
  })

  return eventSubscription.remove
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: QUERY_CONFIG.RETRY_COUNT,
      staleTime: QUERY_CONFIG.STALE_TIME_MS,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true
    },
    mutations: {
      retry: QUERY_CONFIG.MUTATION_RETRY_COUNT,
      onError: error => {
        logger.app.error(error as Error, {
          context: 'mutation_failed',
          timestamp: Date.now()
        })
      }
    }
  }
})

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0
})

function Routes() {
  const machineQuery = useMachine()
  const machine = machineQuery.data?.data.data

  useEffect(() => {
    if (machine) {
      Sentry.setUser({
        id: String(machine.id),
        username: machine.name || `Machine ${machine.id}`
      })

      Sentry.setTag('machine_id', String(machine.id))

      if (machine.location) Sentry.setTag('machine_location', machine.location)

      if (machine.name) Sentry.setTag('machine_name', machine.name)

      logger.app.info('Machine context set in Sentry', {
        machineId: machine.id,
        machineName: machine.name,
        location: machine.location
      })
    }
  }, [machine])

  useConnectSSE({
    serialNumber: machine?.serial_number || ''
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

const RootLayout = withVersionUpdateCheck(() => {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf')
  })
  const { serialNumber } = useVendingMachine()

  if (!loaded || !serialNumber) return null

  return (
    <QueryClientProvider client={queryClient}>
      <View style={styles.container}>
        <View style={styles.statusBar}>
          <StatusBar />
        </View>

        <NoInternet>
          <Routes />
        </NoInternet>

        <SupportContacts />

        <ExpoStatusBar style="auto" />
        <AlertProvider />
        <LoadingProvider />
      </View>
    </QueryClientProvider>
  )
})

export default Sentry.wrap(RootLayout)

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
