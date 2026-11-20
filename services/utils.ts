export const commandToHex = (command: number): string =>
  `0x${command.toString(16).padStart(2, '0')}`
