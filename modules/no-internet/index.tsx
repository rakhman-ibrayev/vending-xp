import { ExitModal } from "@/components/exit-modal";
import { Button } from "@/components/ui/button";
import { useNetworkState } from "expo-network";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

interface NoInternetProps {
  children?: React.ReactNode;
}

const NoInternet = ({ children }: NoInternetProps) => {
  const { isConnected } = useNetworkState();
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  if (isConnected) return children;

  return (
    <View style={[styles.container, styles.noInternet]}>
      <Text style={{ fontSize: 20 }}>Соединение отсутствует</Text>

      <ExitModal
        onClose={() => setIsExitModalOpen(false)}
        isOpen={isExitModalOpen}
      />

      <Button onPress={() => setIsExitModalOpen(true)}>Настройки</Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    gap: 24,
    backgroundColor: "#ffffff",
  },
  noInternet: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export { NoInternet, type NoInternetProps };
