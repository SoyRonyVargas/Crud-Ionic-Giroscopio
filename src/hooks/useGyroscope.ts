/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';

interface Rotation {
  alpha: number; // rotación alrededor del eje Z (0 a 360)
  beta: number;  // inclinación adelante/atrás (-180 a 180)
  gamma: number; // inclinación izquierda/derecha (-90 a 90)
}

/**
 * Hook para obtener datos de giroscopio (orientación del dispositivo)
 * Soporta petición de permiso en iOS 13+
 */
export function useGyroscope(): Rotation {
  const [rotation, setRotation] = useState<Rotation>({ alpha: 0, beta: 0, gamma: 0 });

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      setRotation({
        alpha: event.alpha ?? 0,
        beta: event.beta ?? 0,
        gamma: event.gamma ?? 0,
      });
    };

    // Para iOS 13+ hay que pedir permiso explícito
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      (DeviceOrientationEvent as any)
        .requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        })
        .catch((err: any) => {
          console.warn('Permiso giroscopio denegado o no disponible', err);
        });
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  return rotation;
}
