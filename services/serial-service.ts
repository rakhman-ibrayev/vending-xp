import SerialPortAPI, { type SerialPort } from "react-native-serial-port-api";
import crc16modbus from "./crc16modbus";
import MockSerialService from "./mock-serial-service";

export interface ConnectionSettings {
  devicePath: string;
  baudRate: number;
  dataBits: number;
  stopBits: number;
  parity: 0 | 1 | 2;
}

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK_SERIAL === "true";

class SerialService {
  private static instance: SerialService;
  private serialPort: SerialPort | null = null;
  private subscriptions: Set<(data: number[]) => void> = new Set();

  private constructor() {}

  static getInstance(): SerialService {
    if (!SerialService.instance) {
      SerialService.instance = new SerialService();
    }
    return SerialService.instance;
  }

  async connect(settings: ConnectionSettings): Promise<boolean> {
    try {
      const serialPort = await SerialPortAPI.open(
        settings.devicePath,
        settings
      );
      if (!serialPort) throw new Error("M109E device not found");

      this.serialPort = serialPort;

      this.serialPort.onReceived((buff) => {
        const bytes = this.hexToBytes(buff.toString("hex"));
        console.log("onData:", bytes);
        this.subscriptions.forEach((cb) => cb(bytes));
      });

      return true;
    } catch (error) {
      console.error("Connection failed:", error);
      return false;
    }
  }

  async sendCommand(command: number, data: number[]): Promise<void> {
    if (!this.serialPort) throw new Error("Device not connected");
    const frame = this.buildFrame(command, data);
    await this.serialPort.send(this.toHexString(frame));
  }

  onData(callback: (data: number[]) => void): () => void {
    this.subscriptions.add(callback);
    return () => this.subscriptions.delete(callback); // unsubscribe
  }

  disconnect() {
    this.subscriptions.clear();
    this.serialPort?.close();
    this.serialPort = null;
  }

  devicePaths = SerialPortAPI.devicePaths;
  deviceNames = SerialPortAPI.deviceNames;

  private buildFrame(command: number, data: number[]): number[] {
    const frame = new Array(20).fill(0);
    frame[0] = 0x01; // Slave address
    frame[1] = command;
    data.forEach((byte, i) => (frame[i + 2] = byte));

    const crc = crc16modbus(new Uint8Array(frame.slice(0, 18)));
    frame[18] = crc & 0xff;
    frame[19] = (crc >> 8) & 0xff;

    return frame;
  }

  private toHexString(bytes: number[]): string {
    return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  private hexToBytes(hex: string): number[] {
    const bytes: number[] = [];

    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substring(i, i + 2), 16));
    }

    return bytes;
  }
}

// Export the appropriate service based on environment
const service = USE_MOCK ? MockSerialService : SerialService.getInstance();

export default service;
