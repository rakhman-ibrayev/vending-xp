import VendingMachineAPI from "@/services/vending-machine";
import { useEffect, useState } from "react";
import { Button, Text, View } from "react-native";

const VendingController = () => {
  const [status, setStatus] = useState("Disconnected");
  const [lastResponse, setLastResponse] = useState("");

  useEffect(() => {
    const init = async () => {
      const connected = await VendingMachineAPI.init();
      setStatus(connected ? "Connected" : "Connection failed");

      VendingMachineAPI.listenForResponses((data) => {
        setLastResponse(`Received: ${data.join(" ")}`);
      });
    };

    init();

    return () => {
      // Cleanup on unmount
    };
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text>Status: {status}</Text>
      <Text>{lastResponse}</Text>

      <Button
        title="Vend Slot 1"
        onPress={async () => {
          try {
            await VendingMachineAPI.vendProduct(1);
            setStatus("Vending started");
          } catch (error) {
            setStatus(`Error: ${error.message}`);
          }
        }}
      />
    </View>
  );
};

export default VendingController;
