import { ItemSelectionHint } from "@/components/item-selection-hint";
import { StatusBar } from "@/components/status-bar";
import { ItemSelection } from "@/modules/item-selection";
import { MachineRegistration } from "@/modules/machine-registration";
import { StyleSheet, View } from "react-native";

const VendingController = () => {
  return (
    <View style={styles.container}>
      <MachineRegistration>
        <StatusBar />

        <ItemSelectionHint />

        <ItemSelection />
      </MachineRegistration>
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
