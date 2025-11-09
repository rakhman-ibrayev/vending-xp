export function isClimateResponse(hexResponse: string): boolean {
  if (!hexResponse || hexResponse.length !== 40) return false;

  const bytes = hexResponse.match(/.{2}/g)!.map((b) => parseInt(b, 16));

  return (
    bytes[0] === 0x00 && // Host address
    bytes[1] === 0x07 // 10H command
  );
}

interface ClimateData {
  temperature: number; // °C
}

export function parseClimateResponse(hexResponse: string): ClimateData {
  if (!isClimateResponse(hexResponse)) {
    throw new Error("Not a valid 07H response");
  }

  const bytes = hexResponse.match(/.{2}/g);

  if (!bytes) {
    return {
      temperature: 0,
    };
  }

  return {
    temperature: (parseInt(`${bytes[2]}${bytes[3]}`, 16) - 20) / 10,
  };
}

export function formatPrice(price: string | number) {
  return `${price} ₸`;
}
