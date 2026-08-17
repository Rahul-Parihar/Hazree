"use client";

import { useState, useEffect } from "react";
import { formatTimeSeconds } from "../lib/utils";

export function usePunchTimer(punchInTime?: string, punchOutTime?: string | null) {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    if (!punchInTime || punchOutTime) {
      setElapsedSeconds(0);
      return;
    }

    const calcElapsed = () => {
      const now = new Date();
      const parts = punchInTime.split(":");
      const inDate = new Date();
      inDate.setHours(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10),
        parseInt(parts[2] || "0", 10)
      );
      const diff = Math.max(0, Math.floor((now.getTime() - inDate.getTime()) / 1000));
      setElapsedSeconds(diff);
    };

    calcElapsed();
    const interval = setInterval(calcElapsed, 1000);
    return () => clearInterval(interval);
  }, [punchInTime, punchOutTime]);

  return {
    elapsedSeconds,
    formattedElapsed: formatTimeSeconds(elapsedSeconds),
  };
}
