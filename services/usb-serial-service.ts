import {
  Parity,
  UsbSerial,
  UsbSerialManager,
} from "react-native-usb-serialport-for-android";

class UsbSerialService {
  private static instance: UsbSerialService;
  private device: UsbSerial | null = null;
  private subscription: { remove: () => void } | null = null;

  private constructor() {}

  static getInstance(): UsbSerialService {
    if (!UsbSerialService.instance) {
      UsbSerialService.instance = new UsbSerialService();
    }
    return UsbSerialService.instance;
  }

  async connect(vendorId: number): Promise<boolean> {
    try {
      // 1. List available devices
      const devices = await UsbSerialManager.list();
      const targetDevice = devices.find((d) => d.vendorId === vendorId);

      if (!targetDevice) {
        throw new Error("M109E device not found");
      }

      // 2. Request permission
      await UsbSerialManager.tryRequestPermission(targetDevice.deviceId);

      // 3. Open connection
      this.device = await UsbSerialManager.open(targetDevice.deviceId, {
        baudRate: 9600, // M109E default
        dataBits: 8,
        stopBits: 1,
        parity: Parity.None,
      });

      return true;
    } catch (error) {
      console.error("Connection failed:", error);
      return false;
    }
  }

  async sendCommand(command: number, data: number[]): Promise<void> {
    if (!this.device) throw new Error("Device not connected");

    const frame = this.buildFrame(command, data);
    await this.device.send(this.toHexString(frame));
  }

  onData(callback: (data: number[]) => void) {
    if (!this.device) throw new Error("Device not connected");

    this.subscription = this.device.onReceived((event) => {
      if (event.data) {
        callback(this.hexToBytes(event.data));
      }
    });
  }

  disconnect() {
    this.subscription?.remove();
    this.device?.close();
    this.device = null;
  }

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

export default UsbSerialService.getInstance();
