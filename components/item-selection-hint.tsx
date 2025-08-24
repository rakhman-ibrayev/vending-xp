import { StyleSheet, Text } from "react-native";

const ItemSelectionHint = () => (
  <Text style={styles.text}>
    <Text style={styles.bold}>Подсказка:</Text> выберите товар набрав номер
    ячейки и пройдите к оплате
  </Text>
);

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    textAlign: "center",
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 12,
  },
  bold: {
    fontWeight: 700,
  },
});

export { ItemSelectionHint };
