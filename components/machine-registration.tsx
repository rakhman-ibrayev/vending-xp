import { useMachine } from "@/entities/machines/use-machine";
import { useGetLocation } from "@/lib/hooks/use-get-location";
import VendingMachineAPI from "@/services/vending-machine";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Button } from "./ui/button";

interface MachineRegistrationProps {
  children?: React.ReactNode;
}

const MachineRegistration = ({ children }: MachineRegistrationProps) => {
  const [serialNumber, setSerialNumber] = useState<string | null>(null);
  const { location } = useGetLocation();

  const machineQuery = useMachine(serialNumber);

  useEffect(() => {
    (async () => {
      const isConnected = await VendingMachineAPI.init();

      if (isConnected) {
        const serialNumber = await VendingMachineAPI.getSerialNumber();
        setSerialNumber(serialNumber);
      }
    })();
  }, []);

  if (machineQuery.isLoading || machineQuery.isFetching) {
    return (
      <View style={styles.container}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  if (machineQuery.isError) {
    const qrValue = `${process.env.EXPO_PUBLIC_ADMIN_APP_URL}?serial_number=${serialNumber}&latitude=${location?.coords.latitude}&longitude=${location?.coords.longitude}`;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Аппарат не зарегистрирован</Text>

        <View style={styles.card}>
          <QRCode size={180} value={qrValue} />

          <Text style={styles.cardText}>
            Отсканируйте QR-код или перейдите в панель добавления аппаратов и
            вручную введите следующие данные:
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Серийный номер:</Text>

            <Text style={styles.value}>{serialNumber || "—"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Широта:</Text>

            <Text style={styles.value}>{location?.coords.latitude ?? "—"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Долгота:</Text>

            <Text style={styles.value}>
              {location?.coords.longitude ?? "—"}
            </Text>
          </View>

          <Button
            style={{ marginTop: 20, width: "100%" }}
            onPress={machineQuery.refetch}
          >
            Проверить регистрацию
          </Button>

          <Text style={styles.refreshHint}>
            После регистрации аппарата нажмите кнопку выше, чтобы обновить
            статус.
          </Text>
        </View>

        <Text style={styles.hint}>
          После регистрации аппарат будет доступен для управления.
        </Text>
      </View>
    );
  }

  return children;
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#222",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    maxWidth: 340,
    marginBottom: 24,
  },
  cardText: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
    paddingHorizontal: 8,
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
  hint: {
    marginTop: 12,
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    maxWidth: 340,
  },
  refreshHint: {
    marginTop: 8,
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    maxWidth: 340,
  },
});

export { MachineRegistration, type MachineRegistrationProps };
