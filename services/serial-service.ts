import { EventSubscription } from "react-native";
import SerialPortAPI, { type SerialPort } from "react-native-serial-port-api";

export interface ConnectionSettings {
  devicePath: string;
  baudRate: number;
  dataBits: number;
  stopBits: number;
  parity: 0 | 1 | 2;
}

class SerialService {
  private static instance: SerialService;
  private serialPort: SerialPort | null = null;
  private subscription: EventSubscription | null = null;

  private constructor() {}

  static getInstance(): SerialService {
    if (!SerialService.instance) {
      SerialService.instance = new SerialService();
    }
    return SerialService.instance;
  }

  async connect({
    devicePath,
    baudRate,
    dataBits,
    stopBits,
    parity,
  }: ConnectionSettings): Promise<boolean> {
    try {
      const serialPort = await SerialPortAPI.open(devicePath, {
        baudRate,
        dataBits,
        stopBits,
        parity,
      });

      if (!serialPort) {
        throw new Error("M109E device not found");
      }

      this.serialPort = serialPort;

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

  onData(callback: (data: number[]) => void) {
    if (!this.serialPort) throw new Error("Device not connected");

    this.subscription = this.serialPort.onReceived((buff) => {
      callback(this.hexToBytes(buff.toString("hex")));
    });
  }

  disconnect() {
    this.subscription?.remove();
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

    // CRC16-MODBUS
    const crc = this.calculateCRC(frame.slice(0, 18));
    frame[18] = crc & 0xff;
    frame[19] = (crc >> 8) & 0xff;

    return frame;
  }

  private toHexString(bytes: number[]): string {
    return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  private hexToBytes(hex: string): number[] {
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return bytes;
  }

  private calculateCRC(data: number[]): number {
    let crc = 0xffff;
    for (const byte of data) {
      crc ^= byte << 8;
      for (let i = 0; i < 8; i++) {
        crc = crc & 0x8000 ? (crc << 1) ^ 0x8005 : crc << 1;
      }
    }
    return crc & 0xffff;
  }
}

export default SerialService.getInstance();
