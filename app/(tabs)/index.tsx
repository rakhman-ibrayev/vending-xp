import VendingMachineAPI from "@/services/vending-machine";
import { useEffect, useState } from "react";
import { Button, Text, View } from "react-native";
import SerialPortAPI from "react-native-serial-port-api";

const VendingController = () => {
  const [status, setStatus] = useState("Disconnected");
  const [lastResponse, setLastResponse] = useState("");
  const [devices, setDevices] = useState<any>(null);
  const [paths, setPaths] = useState<any>([]);
  const [selectedPath, setSelectedPath] = useState<string>("");

  const connectToPath = async (path?: string) => {
    setStatus("Connecting...");

    try {
      const connected = await VendingMachineAPI.init({
        devicePath: path || selectedPath,
      });
      setStatus(
        connected ? `Connected (${path || selectedPath})` : "Connection failed"
      );

      VendingMachineAPI.listenForResponses((data) => {
        setLastResponse(`Received: ${data.join(" ")}`);
      });
    } catch (error) {
      setStatus(`Connection error: ${error}`);
    }
  };

  useEffect(() => {
    SerialPortAPI.deviceNames(setDevices);
    SerialPortAPI.devicePaths((paths: string[]) => {
      setPaths(paths);
      if (paths && paths.length > 0) {
        setSelectedPath(paths[0]);
      }
    });
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text>Status: {status}</Text>
      <Text>{lastResponse}</Text>
      <Text>Devices: {JSON.stringify(devices)}</Text>
      <Text>Paths: {JSON.stringify(paths)}</Text>

      <Text>Select device path:</Text>

      {paths && paths.length > 0 && (
        <View style={{ marginBottom: 8 }}>
          <Text>Available paths:</Text>

          {paths.map((path: string) => (
            <Text
              key={path}
              style={{
                color: selectedPath === path ? "blue" : "black",
                textDecorationLine: "underline",
              }}
              onPress={() => setSelectedPath(path)}
            >
              {path}
            </Text>
          ))}
        </View>
      )}

      <Button
        title="Reconnect"
        onPress={() => connectToPath(selectedPath)}
        disabled={!selectedPath}
      />

      <Button
        title="Vend Slot 1"
        onPress={async () => {
          try {
            await VendingMachineAPI.vendProduct(1);
            setStatus("Vending started");
          } catch (error) {
            setStatus(`Error: ${error}`);
          }
        }}
      />
    </View>
  );
};

export default VendingController;
