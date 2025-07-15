import VendingMachineAPI from "@/services/vending-machine";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Device = { name: string; path: string };

/* 
 Попробовать в тупую отправить пример команды из доки в пункте 6
*/
const VendingController = () => {
  const [status, setStatus] = useState<
    "Disconnected" | "Connecting" | "Connected" | "Error"
  >("Disconnected");
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [lastResponse, setLastResponse] = useState<string>("");

  // Load available devices on mount
  useEffect(() => {
    const loadDevices = async () => {
      try {
        const availableDevices = await VendingMachineAPI.getAvailableDevices();
        setDevices(availableDevices);

        if (availableDevices.length > 0) {
          setSelectedDevice(availableDevices[0]);
        }
      } catch (error) {
        setStatus("Error");
        console.error("Device discovery failed:", error);
      }
    };

    loadDevices();
  }, []);

  // Auto-connect to first device if available
  useEffect(() => {
    if (selectedDevice && status === "Disconnected") {
      connectToDevice(selectedDevice);
    }
  }, [selectedDevice]);

  const connectToDevice = async (device: Device) => {
    setStatus("Connecting");

    try {
      const connected = await VendingMachineAPI.init({
        devicePath: device.path,
      });

      if (connected) {
        setStatus("Connected");
        // Set up response listener
        VendingMachineAPI.listenForResponses((data) => {
          setLastResponse(`Response: ${data}...`); // Truncate for display
        });
      } else {
        setStatus("Error");
      }
    } catch (error) {
      setStatus("Error");
      console.error("Connection error:", error);
    }
  };

  const handleVend = async (slot: number) => {
    try {
      await VendingMachineAPI.vendProduct(slot);
      setLastResponse(`Vending slot ${slot} started`);
    } catch (error) {
      setLastResponse(`Vend failed: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.status}>Status: {status}</Text>

      {status === "Connecting" && <ActivityIndicator size="small" />}

      <Text style={styles.response}>{lastResponse || "No responses yet"}</Text>

      {devices.length > 0 && (
        <View style={styles.deviceList}>
          <Text>Available devices:</Text>

          {devices.map((device) => (
            <Text
              key={device.path}
              style={[
                styles.deviceItem,
                selectedDevice?.path === device.path && styles.selectedDevice,
              ]}
              onPress={() => setSelectedDevice(device)}
            >
              {device.name} ({device.path})
            </Text>
          ))}
        </View>
      )}

      <View style={styles.buttonGroup}>
        <Button
          title="Reconnect"
          onPress={() => selectedDevice && connectToDevice(selectedDevice)}
          disabled={!selectedDevice || status === "Connecting"}
        />
        <Button
          title="Vend Slot 1"
          onPress={() => handleVend(1)}
          disabled={status !== "Connected"}
        />
        <Button
          title="Toggle Light"
          onPress={async () => {
            try {
              await VendingMachineAPI.setLight(0, status !== "Connected");
              setLastResponse(`Light ${status === "Connected" ? "OFF" : "ON"}`);
            } catch (error) {
              setLastResponse(`Light control failed: ${error}`);
            }
          }}
          disabled={!selectedDevice}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  status: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  response: {
    fontFamily: "monospace",
    marginVertical: 10,
  },
  deviceList: {
    marginVertical: 10,
  },
  deviceItem: {
    padding: 5,
  },
  selectedDevice: {
    backgroundColor: "#ddd",
    fontWeight: "bold",
  },
  buttonGroup: {
    gap: 10,
    marginTop: 20,
  },
});

export default VendingController;
