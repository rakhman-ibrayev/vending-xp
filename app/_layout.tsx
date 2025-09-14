import { StatusBar } from "@/components/status-bar";
import { AlertProvider } from "@/lib/alert";
import { NoInternet } from "@/modules/no-internet";
import {
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useFonts } from "expo-font";
import * as Network from "expo-network";
import { Stack } from "expo-router";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, View } from "react-native";
import "react-native-reanimated";

onlineManager.setEventListener((setOnline) => {
  const eventSubscription = Network.addNetworkStateListener((state) => {
    setOnline(!!state.isConnected);
  });
  return eventSubscription.remove;
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaView style={styles.container}>
        <AlertProvider>
          <NoInternet>
            <View style={{ padding: 20 }}>
              <StatusBar />
            </View>

            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />

              <Stack.Screen
                name="orders/[orderId]"
                options={{ headerShown: false, gestureEnabled: false }}
              />

              <Stack.Screen name="+not-found" />
            </Stack>

            <ExpoStatusBar style="auto" />
          </NoInternet>
        </AlertProvider>
      </SafeAreaView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});
