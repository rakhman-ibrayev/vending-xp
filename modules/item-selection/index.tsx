import { Numpad } from "@/components/numpad";
import { ProductCard } from "@/components/product-card";
import { useAddMachineOrder } from "@/entities/machines/use-add-machine-order";
import { useMachineProducts } from "@/entities/machines/use-machine-products";
import { alert } from "@/lib/alert";
import { useVendingMachine } from "@/entities/machines/use-vending-machine";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ItemSelectionHint } from "@/components/item-selection-hint";
import { formatPrice } from "@/lib/helpers";
import { Button } from "@/components/ui/button";

const ItemSelection = () => {
  const [numpadValue, setNumpadValue] = useState("");

  const { serialNumber } = useVendingMachine();
  const orderMutation = useAddMachineOrder();
  const productsQuery = useMachineProducts(serialNumber);

  const products = productsQuery.data?.data.data || [];

  const selectedProduct = numpadValue
    ? products.find((product) => product.slot_index.toString() === numpadValue)
    : undefined;

  const isSelectedProduct = typeof selectedProduct !== "undefined";

  const handlePayClick = () => {
    if (!serialNumber || !isSelectedProduct) return;

    alert({
      title: "Подтвердите свой возраст",
      message: "Покупка данного товара доступна лицам старше 16 лет",
      type: "info",
      negativeText: "Отмена",
      positiveText: "Ок",
      overlayClose: true,
      onPositivePress: async () => {
        const { data } = await orderMutation.mutateAsync({
          slot_index: selectedProduct.slot_index,
        });

        if (data?.data?.id) {
          router.replace({
            pathname: "/orders/[orderId]",
            params: { orderId: data.data.id },
          });
        }
      },
    });
  };

  const handleNumberPress = (value: number) => {
    if (numpadValue.length < 3) {
      setNumpadValue(`${numpadValue}${value}`);
    }
  };

  const handleBackspace = () => {
    setNumpadValue(numpadValue.slice(0, numpadValue.length - 1));
  };

  const handleResetNumpad = () => {
    setNumpadValue("");
  };

  const renderCharacterBoxes = () => {
    const chars = numpadValue.split("");
    const boxes = [];

    for (let i = 0; i < 3; i++) {
      boxes.push(
        <View key={i} style={styles.charBox}>
          <Text style={styles.charText}>{chars[i] || " "}</Text>
          <View style={styles.charUnderline} />
        </View>
      );
    }

    return boxes;
  };

  return (
    <View style={styles.container}>
      <ItemSelectionHint />

      <View style={styles.header}>
        <View style={styles.slotInfo}>
          <Text style={styles.slotInfoTitle}>НОМЕР ЯЧЕЙКИ</Text>

          <View style={styles.slotInfoInput}>{renderCharacterBoxes()}</View>

          <Text style={styles.slotInfoPrice}>
            {selectedProduct &&
              formatPrice(selectedProduct.products?.price || "")}
          </Text>
        </View>

        <View style={styles.productCard}>
          {selectedProduct && (
            <ProductCard
              name={selectedProduct.products?.name || "Неизвестный товар"}
              imageUrl={selectedProduct.products?.image || ""}
              description={`Ячейка №${numpadValue}`}
              onRemove={handleResetNumpad}
            />
          )}
        </View>
      </View>

      <Numpad
        onNumberPress={handleNumberPress}
        onBackspacePress={handleBackspace}
      />

      <Button
        onPress={handlePayClick}
        disabled={!numpadValue || !isSelectedProduct}
        isLoading={orderMutation.isPending}
      >
        Оплатить
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 24,
    paddingBlock: 4,
    flex: 1,
  },

  header: {
    flex: 1,
    padding: 32,
    backgroundColor: "#00aa6f",
    borderRadius: 16,
  },

  slotInfo: {
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    marginTop: 80,
  },
  slotInfoTitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 2,
  },
  slotInfoInput: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
    gap: 20,
  },
  slotInfoPrice: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
  },

  productCard: {
    width: "100%",
  },

  charBox: {
    alignItems: "center",
  },
  charText: {
    color: "#fff",
    fontSize: 56,
    fontWeight: "700",
    textAlign: "center",
  },
  charUnderline: {
    width: 60,
    height: 2,
    backgroundColor: "#fff",
    borderRadius: 2,
  },
});

export { ItemSelection };
