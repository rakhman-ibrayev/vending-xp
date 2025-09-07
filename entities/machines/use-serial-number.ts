import VendingMachineAPI from "@/services/vending-machine";
import { useEffect, useState } from "react";

const useSerialNumber = () => {
  const [serialNumber, setSerialNumber] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const isConnected = await VendingMachineAPI.init();

      if (isConnected) {
        const serialNumber = await VendingMachineAPI.getSerialNumber();
        setSerialNumber(serialNumber);
      }
    })();
  }, []);

  return serialNumber;
};

export { useSerialNumber };
