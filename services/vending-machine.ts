import SerialService from "./serial-service";

export interface InitializationSettings {
  devicePath?: string;
  baudRate?: number;
  dataBits?: number;
  stopBits?: number;
  parity?: 0 | 1 | 2;
}

class VendingMachineAPI {
  private static isInitialized = false;

  static async init({
    devicePath = "/dev/ttyS1",
    baudRate = 9600,
    dataBits = 8,
    stopBits = 1,
    parity = 0,
  }: InitializationSettings = {}): Promise<boolean> {
    if (this.isInitialized) return true;

    const connected = await SerialService.connect({
      devicePath,
      baudRate,
      dataBits,
      stopBits,
      parity,
    });

    if (connected) {
      this.isInitialized = true;
    }

    return connected;
  }

  static close() {
    this.setLights(false);
    this.setCompressor(false);
    SerialService.disconnect();
    this.isInitialized = false;
  }

  static async getAvailableDevices(): Promise<
    { name: string; path: string }[]
  > {
    return new Promise((resolve) => {
      SerialService.devicePaths((paths: string[]) => {
        const devices = paths.map((path) => ({ name: path, path }));
        resolve(devices);
      });
    });
  }

  static async getTemperature(): Promise<number> {
    const command = 0x07; // Read Temp
    const data = Array(16).fill(0);

    await SerialService.sendCommand(command, data);

    return new Promise((resolve) => {
      SerialService.onData((response) => {
        if (response[1] !== command) return;

        const tempRaw = (response[2] << 8) | response[3];
        resolve(tempRaw / 10.0); // Convert to float
      });
    });
  }

  static async getSerialNumber(): Promise<string> {
    const command = 0x01; // Read Serial Number
    const data = Array(16).fill(0);

    await SerialService.sendCommand(command, data);

    return new Promise((resolve) => {
      SerialService.onData((response) => {
        if (response[1] !== command) return;

        // Extract serial number bytes (Z1-Z12, positions 2-13 in the 20-byte frame)
        const serialBytes = response.slice(2, 14);

        // Convert to hex string (matches documentation format)
        const serialHex = serialBytes
          .map((b) => b.toString(16).padStart(2, "0").toUpperCase())
          .join("");

        resolve(serialHex);
      });
    });
  }

  static async vendProduct(
    slot: number,
    options: {
      motorType?: number;
      lightScreenMode?: number;
      delay?: number;
      timeout?: number;
    } = {}
  ) {
    const command = 0x05; // Motor Run
    const data = [
      slot, // Y1: Motor index
      options.motorType ?? 0x02, // Y2: Default to 2-wire motor
      options.lightScreenMode ?? 0x02, // Y3: Default to light screen mode 2
      options.delay ?? 15, // Y4: Default 1.5s delay
      0, // Y5: Continue flag
      options.timeout ?? 70, // Y6: Default 7s timeout
      2, // Y7: 0.2s lock time
      ...Array(9).fill(0), // Padding
    ];

    await SerialService.sendCommand(command, data);

    return new Promise((resolve) => {
      SerialService.onData((response) => {
        if (response[1] !== command) return;

        // Parse the response according to protocol section 5.3
        const status = response[3]; // Z3: Implementation results

        if (status === 0x00) {
          resolve({ success: true, status });
        } else {
          resolve({
            success: false,
            status,
            error: this.parseError(status),
          });
        }
      });
    });
  }

  static async setCompressor(on: boolean): Promise<void> {
    const command = 0x08; // Write DO command
    const data = [
      1, // Y1: DO index 1 (O2)
      on ? 1 : 0, // Y2: State (1=ON, 0=OFF)
      ...Array(14).fill(0), // Padding
    ];

    await SerialService.sendCommand(command, data);
  }

  static async setLights(on: boolean): Promise<void> {
    const command = 0x08; // Write DO
    const data = [
      3, // Y1: DO index 1 (O2)
      on ? 1 : 0, // Y2: State (1=ON, 0=OFF)
      ...Array(14).fill(0), // Padding
    ];

    await SerialService.sendCommand(command, data);
  }

  static listenForResponses(callback: (data: number[]) => void) {
    SerialService.onData((response) => {
      if (response.length < 20) return;

      const command = response[1];

      switch (command) {
        case 0x05: // Motor response
          const status = response[3];
          console.log("Motor status:", this.parseError(status));
          break;
        case 0x07: // Temperature
          const temp = ((response[2] << 8) | response[3]) / 10;
          console.log("Temperature:", temp);
          break;
        case 0x08: // DO response
          console.log("Light state updated");
          break;
      }

      callback(response);
    });
  }

  private static parseError(code: number): string {
    switch (code) {
      case 0x00:
        return "Success";
      case 0x01:
        return "Overcurrent";
      case 0x02:
        return "Undercurrent";
      case 0x03:
        return "Timeout";
      case 0x04:
        return "Light screen failed";
      case 0x05:
        return "Electromagnet not open";
      default:
        return `Unknown error (0x${code.toString(16)})`;
    }
  }
}

export default VendingMachineAPI;
