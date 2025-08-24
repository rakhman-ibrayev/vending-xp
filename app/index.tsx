import { ItemSelectionHint } from "@/components/item-selection-hint";
import { StatusBar } from "@/components/status-bar";
import { ItemSelection } from "@/modules/item-selection";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import SerialPortAPI, { SerialPort } from "react-native-serial-port-api";

const Section6Commands = {
  getSerialNumber: "0101000000000000000000000000000000007188",
  getSerialNumber2: "080100000000000000000000000000000000A216",
  startMotorNoLight: "010500020000000000000000000000000000B148",
  startMotorWithLight: "010531020200000000000000000000000000670E",
  setAddress1: "ff01000000000000000000000000000000002050",
  setAddress2: "ff0200000000000000000000000000000000d0a0",
  turnOnO1: "010803010000000000000000000000000000262B",
  turnOffO1: "010803000000000000000000000000000000E72B",
  turnOffCompressor: "010801000000000000000000000000000000664A",
  turnOnCompressor: "010801010000000000000000000000000000A74A",
  readDIStatus: "010900000000000000000000000000000000f64a",
  timeControlLock: "0105000801000001000000000000000000003f72",
  readGridLockStatus: "012a000000000000000000000000000000001f70",
  unencripted: "0103000000000000000000000000000000000000D0E8",
  encrypted: "01030000000000000000000000000000000000000EAD1",
  svet: "01080001000000000000000000000000000003AE",
  readTemperature: "0107000000000000000000000000000000009229",
};

function isClimateResponse(hexResponse: string): boolean {
  if (!hexResponse || hexResponse.length !== 40) return false;

  const bytes = hexResponse.match(/.{2}/g)!.map((b) => parseInt(b, 16));

  return (
    bytes[0] === 0x00 && // Host address
    bytes[1] === 0x07 // 10H command
  );
}

interface ClimateData {
  temperature: number; // °C
}

function parseClimateResponse(hexResponse: string): ClimateData {
  if (!isClimateResponse(hexResponse)) {
    throw new Error("Not a valid 07H response");
  }

  const bytes = hexResponse.match(/.{2}/g);

  if (!bytes) {
    return {
      temperature: 0,
    };
  }

  return {
    temperature: (parseInt(`${bytes[2]}${bytes[3]}`, 16) - 20) / 10,
  };
}

const VendingController = () => {
  const [serialPort, setSerialPort] = useState<SerialPort | null>(null);
  const [temperature, setTemperature] = useState<ClimateData | null>(null);
  const [responses, setResponses] = useState<string[]>([]);

  // Auto-connect to first device if available
  useEffect(() => {
    (async () => {
      const serialPort = await SerialPortAPI.open("/dev/ttyS1", {
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 0,
      });

      serialPort.onReceived((buff) => {
        const response = buff.toString("hex").toUpperCase();

        setResponses((responses) => {
          if (isClimateResponse(response)) {
            console.log(parseClimateResponse(response), response);
            setTemperature(parseClimateResponse(response));
            return responses;
          }

          const updatedResponses = [...responses, response];

          console.log(updatedResponses);

          return updatedResponses;
        });
      });

      // sequence lights, serialnumber, encrypted

      //               010504020000460200000000000000000000b847
      // unencripted: 0103000000000000000000000000000000000000D0E8
      // encrypted:   01030000000000000000000000000000000000000EAD1
      serialPort.send(Section6Commands.setAddress1);
      serialPort.send(Section6Commands.getSerialNumber);

      console.log(serialPort);

      setSerialPort(serialPort);
    })();
  }, []);

  useEffect(() => {
    if (!serialPort) return;

    const interval = setInterval(() => {
      serialPort.send(Section6Commands.readTemperature);
    }, 5000);

    return () => clearInterval(interval);
  }, [serialPort]);

  return (
    <View style={styles.container}>
      <StatusBar />

      <ItemSelectionHint />

      <ItemSelection />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    gap: 24,
    backgroundColor: "#ffffff",
  },
});

export default VendingController;
