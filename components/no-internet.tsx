import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ExitModal } from "./exit-modal";
import { Button } from "./ui/button";

const NoInternet = () => {
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

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

export { NoInternet };
