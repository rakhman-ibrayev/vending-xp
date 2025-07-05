import UsbSerialService from "./usb-serial-service";

class VendingMachineAPI {
  static readonly VENDOR_ID = 0x1234; // Replace with your device's actual vendor ID

  static async init(): Promise<boolean> {
    return await UsbSerialService.connect(this.VENDOR_ID);
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

    await UsbSerialService.sendCommand(command, data);
  }

  static listenForResponses(callback: (data: number[]) => void) {
    UsbSerialService.onData((data) => {
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
