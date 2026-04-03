import { useState, useEffect, useRef } from "react";

export function useTimingSweep(speed: number = 2, active: boolean = true) {
  const [position, setPosition] = useState(0);
  const directionRef = useRef(1);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setPosition((prev) => {
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
    }, 16);
    return () => clearInterval(interval);
  }, [speed, active]);

  return position;
}
