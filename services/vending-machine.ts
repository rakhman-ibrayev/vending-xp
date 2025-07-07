import SerialService from "./serial-service";

export interface InitializationSettings {
  devicePath?: string;
  baudRate?: number;
  dataBits?: number;
  stopBits?: number;
  parity?: 0 | 1 | 2;
}

class VendingMachineAPI {
  static async init({
    devicePath = "/dev/ttyS4",
    baudRate = 9600,
    dataBits = 8,
    stopBits = 1,
    parity = 0,
  }: InitializationSettings): Promise<boolean> {
    return await SerialService.connect({
      devicePath,
      baudRate,
      dataBits,
      stopBits,
      parity,
    });
  }

  static close() {
    SerialService.disconnect();
  }

  static async getTemperature(): Promise<number> {
    const command = 0x07; // Temperature command
    const data: number[] = Array(20).fill(0); // Fill with zeros for padding

    await SerialService.sendCommand(command, data);

    return new Promise((resolve) => {
      SerialService.onData((response) => {
        if (response.length < 4) return;

        const temp = ((response[2] << 8) | response[3]) / 10;
        resolve(temp);
      });
    });
  }

  static async vendProduct(slot: number): Promise<void> {
    const command = 0x05; // Motor Run
    const data = [
      slot, // Y1
      0x03, // Y2 (3-wire motor)
      0x02, // Y3 (light screen mode)
      15, // Y4 (1.5s delay)
      0, // Y5 (continue flag)
      70, // Y6 (7s timeout)
      2, // Y7 (0.2s lock)
      ...Array(9).fill(0), // Padding
    ];

    await SerialService.sendCommand(command, data);
  }

  static listenForResponses(callback: (data: number[]) => void) {
    SerialService.onData((data) => {
      if (data.length < 20) return;

      const command = data[1];
      switch (command) {
        case 0x05: // Motor response
          const status = data[3];
          console.log("Motor status:", this.parseError(status));
          break;
        case 0x07: // Temperature
          const temp = ((data[2] << 8) | data[3]) / 10;
          console.log("Temperature:", temp);
          break;
      }
      callback(data);
    });
  }

  private static parseError(code: number): string {
    switch (code) {
      case 0x00:
        return "Success";
      case 0x01:
        return "Overcurrent";
      case 0x03:
        return "Timeout";
      default:
        return `Unknown error (0x${code.toString(16)})`;
    }
  }
}

export default VendingMachineAPI;
