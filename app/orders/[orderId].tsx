import { PageContainer } from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/countdown";
import { useCancelOrder } from "@/entities/orders/use-cancel-order";
import { useOrder } from "@/entities/orders/use-order";
import { useVendingMachine } from "@/entities/machines/use-vending-machine";
import { alert } from "@/lib/alert";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

const PAYMENT_TIMEOUT_MS = 60000; // 1 minute
const WARNING_TIMEOUT_S = 30; // 30 seconds

const Order = () => {
  const orderId = Number(useLocalSearchParams().orderId);

  const orderQuery = useOrder(orderId, 3000);
  const cancelMutation = useCancelOrder();
  const { vend } = useVendingMachine();

  const [vendStatus, setVendStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [vendError, setVendError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const confirmationOpacity = useRef(new Animated.Value(0)).current;

  const [showWarning, setShowWarning] = useState(false);
  const warningTimerRef = useRef<number | null>(null);

  const order = orderQuery.data?.data.data;

  // Cancel order handler
  const handleCancelOrder = () => {
    alert({
      title: "Отмена заказа",
      message: "Вы уверены, что хотите отменить заказ?",
      type: "warning",
      positiveText: "Да, отменить",
      negativeText: "Нет",
      onPositivePress: () => {
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        cancelMutation.mutate(orderId);
        router.replace("/");
      },
    });
  };

  // Handle timeout expiration
  const handleTimeoutExpired = () => {
    cancelMutation.mutate(orderId);
    router.replace("/");
  };

  // Restart the timer
  const handleRestartTimer = () => {
    setShowWarning(false);

    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }

    // Start a new timer
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
    }, PAYMENT_TIMEOUT_MS);
  };

  // Example QR value, replace with real data if needed
  const qrValue = `https://kaspi.kz/pay/{serviceName}?service_id={serviceId}&{parameterId}=XXXX`;

  // Payment timeout logic
  useEffect(() => {
    // After 1 minute, show warning countdown
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
    }, PAYMENT_TIMEOUT_MS);

    return () => {
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };
  }, []);

  // Vend product when order is paid
  useEffect(() => {
    let timeout: number | undefined;

    if (
      order?.status === "paid" &&
      vendStatus === "idle" &&
      order.slot_index !== null
    ) {
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      setShowWarning(false);
      setVendStatus("pending");
      setVendError(null);

      vend(order.slot_index - 1)
        .then((result) => {
          if (result.success) {
            setVendStatus("success");
            setShowConfirmation(true);

            Animated.timing(confirmationOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }).start();

            timeout = setTimeout(() => {
              router.replace("/");
            }, 2500);
          } else {
            setVendStatus("error");
            setVendError("Не удалось выдать товар. Попробуйте позже.");
          }
        })
        .catch(() => {
          setVendStatus("error");
          setVendError("Не удалось выдать товар. Попробуйте позже.");
        });
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.status]);

  return (
    <PageContainer style={styles.container}>
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

            {showWarning && (
              <View style={styles.warningBanner}>
                <View style={styles.warningContent}>
                  <MaterialIcons name="warning" size={24} color="#f97316" />

                  <Text style={styles.warningText}>
                    Страница закроется через{" "}
                    <Countdown
                      numSeconds={WARNING_TIMEOUT_S}
                      onFinish={handleTimeoutExpired}
                    />{" "}
                    сек
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.stayButton}
                  onPress={handleRestartTimer}
                >
                  <Text style={styles.stayButtonText}>
                    Нажмите, чтобы остаться
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.qrContainer}>
              <QRCode size={200} value={qrValue} />
            </View>

            {order && (
              <>
                <Text
                  style={styles.productName}
                  numberOfLines={3}
                  ellipsizeMode="tail"
                >
                  {order.product_name}
                </Text>

                <View style={styles.orderInfo}>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Цена:</Text>
                    <Text style={styles.value}>{order.product_price} ₸</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Ячейка:</Text>
                    <Text style={styles.value}>{order.slot_index}</Text>
                  </View>
                </View>
              </>
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
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    maxWidth: 400,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#222",
    textAlign: "center",
  },
  instruction: {
    fontSize: 18,
    color: "#444",
    textAlign: "center",
  },
  warningBanner: {
    backgroundColor: "#fff7ed",
    borderWidth: 2,
    borderColor: "#f97316",
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    gap: 12,
  },
  warningContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  warningText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ea580c",
  },
  stayButton: {
    backgroundColor: "#f97316",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  stayButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  qrContainer: {
    backgroundColor: "#f6f8fa",
    borderRadius: 12,
    padding: 16,
    marginTop: 44,
  },

  productName: {
    fontSize: 24,
    color: "#222",
    fontWeight: "bold",
    textAlign: "center",
    marginBlock: 36,
  },

  orderInfo: {
    width: "100%",
    marginBottom: 36,
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 18,
    color: "#888",
    fontWeight: "500",
  },
  value: {
    fontSize: 18,
    color: "#222",
    fontWeight: "bold",
  },

  cancelButton: {
    width: "100%",
  },

  hint: {
    marginTop: 18,
    fontSize: 16,
    color: "#888",
    textAlign: "center",
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
