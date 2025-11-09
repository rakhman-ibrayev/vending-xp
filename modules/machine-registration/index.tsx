import { Button } from "@/components/ui/button";
import { useMachine } from "@/entities/machines/use-machine";
import { useGetLocation } from "@/lib/hooks/use-get-location";
import { useVendingMachine } from "@/entities/machines/use-vending-machine";
import { StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

interface MachineRegistrationProps {
  children?: React.ReactNode;
}

const MachineRegistration = ({ children }: MachineRegistrationProps) => {
  const { location } = useGetLocation();
  const { serialNumber } = useVendingMachine();
  const machineQuery = useMachine(serialNumber);

  if (!serialNumber) return null;

  if (machineQuery.isLoading || machineQuery.isFetching) {
    return (
      <View style={styles.container}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  if (machineQuery.isError) {
    const machineAddUrl = new URL(
      `${process.env.EXPO_PUBLIC_ADMIN_APP_URL}/machines?serial_number=${serialNumber}`
    );

    if (location?.coords) {
      machineAddUrl.searchParams.set(
        "latitude",
        location.coords.latitude.toString()
      );

      machineAddUrl.searchParams.set(
        "longitude",
        location.coords.longitude.toString()
      );
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Аппарат не зарегистрирован</Text>

        <View style={styles.card}>
          <QRCode size={200} value={machineAddUrl.toString()} />

          <Text style={styles.cardText}>
            Отсканируйте QR-код или перейдите в панель добавления аппаратов и
            вручную введите следующие данные:
          </Text>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Серийный номер:</Text>
              <Text style={styles.value}>{serialNumber || "—"}</Text>
            </View>

            {location?.coords && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Широта:</Text>
                  <Text style={styles.value}>{location.coords.latitude}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Долгота:</Text>
                  <Text style={styles.value}>{location.coords.longitude}</Text>
                </View>
              </>
            )}
          </View>

          <Button
            style={{ marginTop: 20, width: "100%" }}
            onPress={machineQuery.refetch}
          >
            Проверить регистрацию
          </Button>

          <Text style={styles.hint}>
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
    gap: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    maxWidth: 340,
    gap: 16,
  },
  cardText: {
    fontSize: 18,
    color: "#444",
    textAlign: "center",
    marginVertical: 16,
  },
  infoSection: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
    paddingHorizontal: 8,
    gap: 8,
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
    alignSelf: "flex-end",
  },
  hint: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    maxWidth: 340,
  },
});

export { MachineRegistration, type MachineRegistrationProps };
