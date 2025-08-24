import { Numpad } from "@/components/numpad";
import { ProductCard } from "@/components/product-card";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { ITEMS } from "@/constants/items";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const ItemSelection = () => {
  const [numpadValue, setNumpadValue] = useState("");
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const selectedProduct = ITEMS[Number(numpadValue) as keyof typeof ITEMS];

  const openModal = () => setIsItemModalOpen(true);

  const closeModal = () => {
    setIsItemModalOpen(false);
    setNumpadValue("");
  };

  return (
    <>
      <Text style={styles.input}>{numpadValue}</Text>

      <Numpad
        onNumberPress={(value) => setNumpadValue(`${numpadValue}${value}`)}
        onBackspacePress={() =>
          setNumpadValue(numpadValue.slice(0, numpadValue.length - 1))
        }
      />

      <Button disabled={!numpadValue} onPress={openModal}>
        Оплатить
      </Button>

      <BottomSheet
        visible={isItemModalOpen}
        onClose={closeModal}
        title="Вы выбрали товар"
      >
        <ProductCard
          name={selectedProduct?.name || "Неизвестный товар"}
          price={selectedProduct?.price || ""}
          imageUrl={selectedProduct?.imageUrl || ""}
          description={`Ячейка №${numpadValue}`}
        />

        <View style={styles.modalControls}>
          <Button
            onPress={closeModal}
            variant="secondary"
            style={styles.modalControl}
          >
            Отмена
          </Button>

          <Button onPress={closeModal} style={styles.modalControl}>
            Оплатить
          </Button>
        </View>
      </BottomSheet>
    </>
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 16,
    fontSize: 24,
  },
  modalControls: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  modalControl: {
    flex: 1,
  },
});

export { ItemSelection };
