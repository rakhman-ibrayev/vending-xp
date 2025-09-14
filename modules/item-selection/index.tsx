import { Numpad } from "@/components/numpad";
import { ProductCard } from "@/components/product-card";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { useAddMachineOrder } from "@/entities/machines/use-add-machine-order";
import { useMachineProducts } from "@/entities/machines/use-machine-products";
import { useSerialNumber } from "@/entities/machines/use-serial-number";
import { alert } from "@/lib/alert";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const ItemSelection = () => {
  const [numpadValue, setNumpadValue] = useState("");
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  const serialNumber = useSerialNumber();
  const orderMutation = useAddMachineOrder();
  const productsQuery = useMachineProducts(serialNumber);

  const products = productsQuery.data?.data || [];

  const selectedProduct = numpadValue
    ? products.find((product) => product.slot_index.toString() === numpadValue)
    : undefined;

  const isSelectedProduct = typeof selectedProduct !== "undefined";

  const openModal = () => setIsItemModalOpen(true);

  const closeModal = () => {
    setIsItemModalOpen(false);
    setNumpadValue("");
  };

  const handlePayClick = () => {
    if (!serialNumber || !isSelectedProduct) return;

    alert({
      title: "Подтвердите свой возраст",
      message: "Вам есть 16 лет?",
      type: "warning",
      positiveText: "Да",
      negativeText: "Нет",
      overlayClose: true,
      onPositivePress: async () => {
        const { data } = await orderMutation.mutateAsync({
          serialNumber,
          data: {
            slot_index: selectedProduct.slot_index,
          },
        });

        if (data?.id) {
          router.navigate({
            pathname: "/orders/[orderId]",
            params: { orderId: data.id },
          });
        }
      },
    });
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

      <Button disabled={!numpadValue || !isSelectedProduct} onPress={openModal}>
        Оплатить
      </Button>

      <BottomSheet
        visible={isItemModalOpen}
        onClose={closeModal}
        title="Вы выбрали товар"
      >
        <ProductCard
          name={selectedProduct?.products.name || "Неизвестный товар"}
          price={selectedProduct?.products.price.toString() || ""}
          imageUrl={selectedProduct?.products.image || ""}
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

          <Button
            onPress={handlePayClick}
            style={styles.modalControl}
            isLoading={orderMutation.isPending}
          >
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
