/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/usePayPalButton.ts
import { useEffect } from 'react';

export const usePayPalButton = ({
  containerId,
  amount,
  onSuccess,
}: {
  containerId: string;
  amount: string;
  onSuccess: () => void;
}) => {
  useEffect(() => {
    const paypalContainer = document.getElementById(containerId);
    if (!paypalContainer) return;

    // @ts-ignore
    if (window.paypal) {
      // Limpia contenedor antes de renderizar
      paypalContainer.innerHTML = '';

      // @ts-ignore
      window.paypal.Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: { value: amount },
            }],
          });
        },
        onApprove: async (data: any, actions: any) => {
          const details = await actions.order.capture();
          console.log('Pago completado por', details.payer.name.given_name);
          onSuccess();
        },
        onError: (err: any) => {
          console.error('Error en PayPal:', err);
        }
      }).render(`#${containerId}`);
    }

    return () => {
      // Limpieza segura si se desmonta
      if (paypalContainer) {
        paypalContainer.innerHTML = '';
      }
    };
  }, [containerId, amount, onSuccess]);
};
