import { ItemSelectionHint } from "@/components/item-selection-hint";
import { NoInternet } from "@/components/no-internet";
import { StatusBar } from "@/components/status-bar";
import { ItemSelection } from "@/modules/item-selection";
import { useNetworkState } from "expo-network";
import { StyleSheet, View } from "react-native";

const VendingController = () => {
  const { isConnected } = useNetworkState();

  if (!isConnected) {
    return <NoInternet />;
  }

  return (
    <View style={styles.container}>
      <StatusBar />
        <StatusBar />

        <ItemSelectionHint />

        <ItemSelection />
      <ItemSelection />
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
});

export default VendingController;
