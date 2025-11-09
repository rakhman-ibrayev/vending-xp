import { StyleSheet, Text } from "react-native";

const ItemSelectionHint = () => (
  <Text style={styles.text}>
    <Text style={styles.bold}>Подсказка:</Text> выберите товар набрав номер
    ячейки и пройдите к оплате
  </Text>
);

const styles = StyleSheet.create({
  text: {
    fontSize: 18,
    textAlign: "center",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  bold: {
    fontWeight: "700",
    color: "#1f2937",
  },
});

export { ItemSelectionHint };
