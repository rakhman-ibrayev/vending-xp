import { useState, useEffect, useRef } from "react";
import { Text } from "react-native";

interface CountdownProps {
  numSeconds: number;
  onFinish: () => void;
}

const Countdown = ({ numSeconds, onFinish }: CountdownProps) => {
  const [timeLeft, setTimeLeft] = useState(numSeconds);
  const finishedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onFinishRef = useRef(onFinish);

  // Keep onFinish ref updated without restarting countdown
  onFinishRef.current = onFinish;

  useEffect(() => {
    finishedRef.current = false;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;

        if (next <= 0) {
          // Clear interval
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }

          // Call onFinish only once (protection against race conditions)
          if (!finishedRef.current) {
            finishedRef.current = true;
            onFinishRef.current();
          }

          return 0;
        }

        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return <Text>{timeLeft}</Text>;
};

export { Countdown, type CountdownProps };
