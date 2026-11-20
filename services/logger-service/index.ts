import { SerialLogger } from './serial-logger'
import { HardwareLogger } from './hardware-logger'
import { NetworkLogger } from './network-logger'
import { SseLogger } from './sse-logger'
import { AppLogger } from './app-logger'

export const logger = {
  serial: new SerialLogger(),
  hardware: new HardwareLogger(),
  network: new NetworkLogger(),
  sse: new SseLogger(),
  app: new AppLogger()
}
