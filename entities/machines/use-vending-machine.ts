import { useCallback, useEffect, useState } from "react";
import VendingMachineAPI from "../../services/vending-machine";
import { setMachineSerialNumber } from "@/lib/api/api";

interface UseVendingMachineOptions {
  devicePath?: string;
  baudRate?: number;
}

export function useVendingMachine(options: UseVendingMachineOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [serialNumber, setSerialNumber] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const ok = await VendingMachineAPI.init({
          devicePath: options.devicePath,
          baudRate: options.baudRate,
        });

        if (mounted) {
          setIsConnected(ok);

          // Fetch serial number immediately after successful initialization
          if (ok) {
            try {
              const sn = await VendingMachineAPI.getSerialNumber();

              if (mounted && sn) {
                setSerialNumber(sn);
                setMachineSerialNumber(sn);
              }
            } catch (err: any) {
              if (mounted) setLastError(err.message ?? String(err));
            }
          }
        }
      } catch (err: any) {
        if (mounted) setLastError(err.message ?? String(err));
      }
    })();

    return () => {
      mounted = false;
      VendingMachineAPI.close();
      setIsConnected(false);
    };
  }, [options.devicePath, options.baudRate]);

  const refreshTemperature = useCallback(async () => {
    try {
      const temp = await VendingMachineAPI.getTemperature();
      setTemperature(temp);
      return temp;
    } catch (err: any) {
      setLastError(err.message ?? String(err));
      throw err;
    }
  }, []);

  const turnOnLights = useCallback(() => VendingMachineAPI.setLights(true), []);

  const turnOffLights = useCallback(
    () => VendingMachineAPI.setLights(false),
    []
  );

  const turnOnCompressor = useCallback(
    () => VendingMachineAPI.setCompressor(true),
    []
  );
  const turnOffCompressor = useCallback(
    () => VendingMachineAPI.setCompressor(false),
    []
  );

  const vend = useCallback(
    async (
      slot: number,
      opts?: Parameters<typeof VendingMachineAPI.vendProduct>[1]
    ) => {
      try {
        return await VendingMachineAPI.vendProduct(slot, opts);
      } catch (err: any) {
        setLastError(err.message ?? String(err));
        throw err;
      }
    },
    []
  );

  return {
    isConnected,
    temperature,
    serialNumber,
    lastError,

    refreshTemperature,
    turnOnLights,
    turnOffLights,
    turnOnCompressor,
    turnOffCompressor,
    vend,
  };
}
