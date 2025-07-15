// test-commands-standalone.ts
import SerialPortAPI, { type SerialPort } from "react-native-serial-port-api";

// Helper function to calculate CRC16-MODBUS
const calculateCRC = (data: number[]): number => {
  let crc = 0xffff;
  for (const byte of data) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x8005 : crc << 1;
    }
  }
  return crc & 0xffff;
};

// Helper to build 20-byte frames
const buildFrame = (
  address: number,
  command: number,
  data: number[]
): number[] => {
  const frame = new Array(20).fill(0);
  frame[0] = address;
  frame[1] = command;
  data.forEach((byte, i) => (frame[i + 2] = byte));

  const crc = calculateCRC(frame.slice(0, 18));
  frame[18] = crc & 0xff; // LSB first
  frame[19] = (crc >> 8) & 0xff;

  return frame;
};

// Helper to convert bytes to hex string
const toHexString = (bytes: number[]): string =>
  bytes.map((b) => b.toString(16).padStart(2, "0")).join("");

let serialPort: SerialPort | null = null;

export const connect = async (devicePath: string) => {
  serialPort = await SerialPortAPI.open(devicePath, {
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: 0,
  });
  console.log("Connected to", devicePath);
};

export const disconnect = async () => {
  if (serialPort) {
    await serialPort.close();
    serialPort = null;
    console.log("Disconnected");
  }
};

// Command implementations
export const testGetSerialNumber = async () => {
  if (!serialPort) throw new Error("Not connected");
  const command = buildFrame(0x01, 0x01, Array(16).fill(0));
  await serialPort.send(toHexString(command));
  console.log("Sent Get Serial Number (01H)");
};

export const testStartMotor = async (
  slot: number,
  motorType: number,
  lightScreenMode: number
) => {
  if (!serialPort) throw new Error("Not connected");
  const data = [
    slot, // Y1
    motorType, // Y2
    lightScreenMode, // Y3
    15, // Y4: 1.5s delay
    0, // Y5
    70, // Y6: 7s timeout
    2, // Y7: 0.2s lock
    ...Array(9).fill(0),
  ];
  const command = buildFrame(0x01, 0x05, data);
  await serialPort.send(toHexString(command));
  console.log(`Sent Motor Run (05H) for slot ${slot}`);
};

export const testSetLight = async (outputIndex: number, on: boolean) => {
  if (!serialPort) throw new Error("Not connected");
  const data = [
    outputIndex, // Y1: DO index (0-4)
    on ? 1 : 0, // Y2: State
    ...Array(14).fill(0),
  ];
  const command = buildFrame(0x01, 0x08, data);
  await serialPort.send(toHexString(command));
  console.log(`Set output O${outputIndex + 1} ${on ? "ON" : "OFF"}`);
};

export const testReadTemperature = async () => {
  if (!serialPort) throw new Error("Not connected");
  const command = buildFrame(0x01, 0x07, Array(16).fill(0));
  await serialPort.send(toHexString(command));
  console.log("Sent Read Temperature (07H)");
};

export const testReadDIStatus = async () => {
  if (!serialPort) throw new Error("Not connected");
  const command = buildFrame(0x01, 0x09, Array(16).fill(0));
  await serialPort.send(toHexString(command));
  console.log("Sent Read DI Status (09H)");
};

// Example usage:
export const runTests = async () => {
  try {
    await connect("/dev/ttyS4");

    // Test commands
    await testGetSerialNumber();
    setTimeout(() => {}, 1000);
    await testSetLight(0, true);
    setTimeout(() => {}, 1000);
    await testStartMotor(0, 0x03, 0x02); // Slot 0, 3-wire, light screen mode 2
    setTimeout(() => {}, 1000);
    await testReadTemperature();
    setTimeout(() => {}, 1000);
    await testReadDIStatus();
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await disconnect();
  }
};
