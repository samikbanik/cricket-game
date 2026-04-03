import { useState, useEffect, useRef } from "react";

export function usePowerSweep(speed: number = 1.2, active: boolean = true) {
  const [level, setLevel] = useState(0);
  const directionRef = useRef(1);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setLevel((prev) => {
        const next = prev + directionRef.current * speed;
        if (next >= 100) {
          directionRef.current = -1;
          return 100;
        }
        if (next <= 0) {
          directionRef.current = 1;
          return 0;
        }
        return next;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [speed, active]);

  return level;
}
