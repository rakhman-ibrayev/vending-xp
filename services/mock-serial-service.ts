export interface ConnectionSettings {
  devicePath: string;
  baudRate: number;
  dataBits: number;
  stopBits: number;
  parity: 0 | 1 | 2;
}

class MockSerialPort {
  private listeners: Set<(buff: Buffer) => void> = new Set();

  onReceived(callback: (buff: Buffer) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  send(hex: string): Promise<boolean> {
    console.log("Mock TX:", hex);
    return Promise.resolve(true);
  }

  close(): void {
    this.listeners.clear();
  }

  // Simulate receiving data
  simulateReceive(data: number[]) {
    const buffer = new Uint8Array(data);
    this.listeners.forEach((cb) => cb(buffer as any));
  }
}

class MockSerialService {
  private static instance: MockSerialService;
  private mockPort: MockSerialPort | null = null;
  private subscriptions: Set<(data: number[]) => void> = new Set();
  private isConnected = false;

  private constructor() {}

  static getInstance(): MockSerialService {
    if (!MockSerialService.instance) {
      MockSerialService.instance = new MockSerialService();
    }
    return MockSerialService.instance;
  }

  async connect(settings: ConnectionSettings): Promise<boolean> {
    console.log("Mock connecting to:", settings.devicePath);

    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    this.mockPort = new MockSerialPort();
    this.isConnected = true;

    // Simulate initial connection response
    setTimeout(() => {
      if (this.mockPort) {
        // Simulate a basic response
        this.mockPort.simulateReceive([0x01, 0x00, 0x00, 0x00]);
      }
    }, 100);

    return true;
  }

  async sendCommand(command: number, data: number[]): Promise<void> {
    if (!this.isConnected) throw new Error("Mock device not connected");

    console.log("Mock TX command:", command, "data:", data);

    // Simulate responses based on command
    setTimeout(() => {
      this.simulateResponse(command, data);
    }, 100 + Math.random() * 200); // Random delay 100-300ms
  }

  onData(callback: (data: number[]) => void): () => void {
    this.subscriptions.add(callback);
    return () => this.subscriptions.delete(callback);
  }

  disconnect() {
    this.subscriptions.clear();
    this.mockPort?.close();
    this.mockPort = null;
    this.isConnected = false;
  }

  devicePaths(callback: (paths: string[]) => void) {
    // Simulate available devices
    setTimeout(() => {
      callback(["/dev/ttyS0", "/dev/ttyUSB0", "/dev/ttyACM0"]);
    }, 100);
  }

  deviceNames(callback: (names: string[]) => void) {
    setTimeout(() => {
      callback(["Serial Port 1", "USB Serial", "ACM Device"]);
    }, 100);
  }

  private simulateResponse(command: number, originalData: number[]) {
    let response: number[];

    switch (command) {
      case 0x01: // Read Serial Number
        // Simulate serial number response
        response = [
          0x01,
          0x01, // Slave, Command
          0x12,
          0x34,
          0x56,
          0x78,
          0x9a,
          0xbc,
          0xde,
          0xf0,
          0x11,
          0x22,
          0x33,
          0x44, // Serial bytes
          ...Array(6).fill(0), // Padding
          0x00,
          0x00, // CRC (mock)
        ];
        break;

      case 0x05: // Motor Run (Vend Product)
        // Simulate successful vend
        response = [
          0x01,
          0x05, // Slave, Command
          0x00,
          0x00, // Status bytes
          ...Array(16).fill(0), // Padding
          0x00,
          0x00, // CRC
        ];
        break;

      case 0x07: // Read Temperature
        // Simulate temperature (25.0°C = 250)
        const temp = 250;
        response = [
          0x01,
          0x07, // Slave, Command
          temp & 0xff,
          (temp >> 8) & 0xff, // Temperature bytes
          ...Array(16).fill(0), // Padding
          0x00,
          0x00, // CRC
        ];
        break;

      case 0x08: // Write DO (Lights/Compressor)
        // Simulate success
        response = [
          0x01,
          0x08, // Slave, Command
          originalData[0], // Channel
          originalData[1] ? 0xf1 : 0xf0, // Status
          ...Array(16).fill(0), // Padding
          0x00,
          0x00, // CRC
        ];
        break;

      default:
        response = [0x01, command, ...Array(18).fill(0), 0x00, 0x00];
    }

    this.subscriptions.forEach((cb) => cb(response));
  }
}

export default MockSerialService.getInstance();
