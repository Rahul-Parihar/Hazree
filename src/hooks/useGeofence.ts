"use client";

import { useState } from "react";

export function useGeofence(initialInside: boolean = true) {
  const [isInside, setIsInside] = useState<boolean>(initialInside);
  const [distanceMeters, setDistanceMeters] = useState<number>(initialInside ? 12 : 240);
  const [accuracyMeters, setAccuracyMeters] = useState<number>(4.2);

  const toggleSimulation = () => {
    if (isInside) {
      setIsInside(false);
      setDistanceMeters(240);
    } else {
      setIsInside(true);
      setDistanceMeters(12);
    }
  };

  return {
    isInside,
    distanceMeters,
    accuracyMeters,
    toggleSimulation,
    statusText: isInside ? "Inside Office Radius" : "Outside Authorized Area",
  };
}
