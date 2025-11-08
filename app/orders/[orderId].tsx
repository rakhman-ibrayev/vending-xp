import { PageContainer } from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { useCancelOrder } from "@/entities/orders/use-cancel-order";
import { useOrder } from "@/entities/orders/use-order";
import VendingMachineAPI from "@/services/vending-machine";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

const Order = () => {
  const orderId = Number(useLocalSearchParams().orderId);
  const orderQuery = useOrder(orderId, 2000);
  const cancelMutation = useCancelOrder();

  const [vendStatus, setVendStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [vendError, setVendError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const confirmationOpacity = useRef(new Animated.Value(0)).current;

  const order = orderQuery.data?.data;

  // Cancel order handler
  const handleCancelOrder = () => {
    cancelMutation.mutate(orderId);
    router.navigate("/");
  };

  // Example QR value, replace with real data if needed
  const qrValue = `https://kaspi.kz/pay/{serviceName}?service_id={serviceId}&{parameterId}=XXXX`;

  // Vend product when order is paid
  useEffect(() => {
    let timeout: number | undefined;

    if (order?.status === "paid" && vendStatus === "idle") {
      setVendStatus("pending");
      setVendError(null);

      VendingMachineAPI.vendProduct(order.slot_index - 1)
        .then((result: any) => {
          if (result?.success) {
            setVendStatus("success");
            setShowConfirmation(true);

            Animated.timing(confirmationOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }).start();

            timeout = setTimeout(() => {
              router.navigate("/");
            }, 2500);
          } else {
            setVendStatus("error");
            setVendError(
              result?.error || "Не удалось выдать товар. Попробуйте позже."
            );
          }
        })
        .catch((err) => {
          setVendStatus("error");
          setVendError(
            typeof err === "string"
              ? err
              : err?.message || "Не удалось выдать товар. Попробуйте позже."
          );
        });
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.status]);

  return (
    <PageContainer>
      <View style={styles.card}>
        {showConfirmation && (
          <Animated.View
            style={[styles.confirmation, { opacity: confirmationOpacity }]}
          >
            <MaterialIcons
              name="check-circle-outline"
              color="#06db06ff"
              size={200}
            />

            <Text style={styles.confirmationText}>Спасибо за покупку!</Text>

            <Text style={styles.confirmationHint}>
              Заберите ваш товар из автомата
            </Text>
          </Animated.View>
        )}

        {!showConfirmation && (
          <>
            <Text style={styles.title}>Оплата заказа</Text>

            <Text style={styles.instruction}>
              Отсканируйте QR-код в приложении Kaspi.kz для оплаты заказа
            </Text>

            <View style={styles.qrContainer}>
              <QRCode size={180} value={qrValue} />
            </View>

            {order && (
              <View style={styles.orderInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Товар:</Text>
                  <Text style={styles.value}>{order.product_name}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Цена:</Text>
                  <Text style={styles.value}>{order.product_price} ₸</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Ячейка:</Text>
                  <Text style={styles.value}>{order.slot_index}</Text>
                </View>
              </View>
            )}

            {vendStatus === "pending" && (
              <Text style={styles.pending}>Выдача товара...</Text>
            )}

            {vendStatus === "error" && (
              <Text style={styles.error}>{vendError}</Text>
            )}

            <Button
              variant="secondary"
              onPress={handleCancelOrder}
              style={styles.cancelButton}
              disabled={vendStatus === "pending"}
            >
              Отмена
            </Button>

            <Text style={styles.hint}>
              После оплаты заказ будет автоматически обработан.
            </Text>
          </>
        )}
      </View>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    maxWidth: 400,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#222",
    textAlign: "center",
  },
  instruction: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    marginBottom: 16,
  },
  qrContainer: {
    backgroundColor: "#f6f8fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  orderInfo: {
    width: "100%",
    marginBottom: 16,
    marginTop: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 15,
    color: "#888",
    fontWeight: "500",
  },
  value: {
    fontSize: 15,
    color: "#222",
    fontWeight: "bold",
  },
  cancelButton: {
    marginTop: 12,
    width: "100%",
  },
  hint: {
    marginTop: 14,
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    maxWidth: 340,
  },
  pending: {
    color: "#FFA000",
    fontSize: 16,
    marginBottom: 8,
    marginTop: 8,
    textAlign: "center",
  },
  error: {
    color: "#e53935",
    fontSize: 16,
    marginBottom: 8,
    marginTop: 8,
    textAlign: "center",
  },
  confirmation: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  confirmationIcon: {
    fontSize: 56,
  },
  confirmationText: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  confirmationHint: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
  },
});

export default Order;
