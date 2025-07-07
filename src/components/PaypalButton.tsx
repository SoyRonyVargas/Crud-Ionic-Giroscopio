/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    paypal: any;
  }
}

interface PaypalButtonProps {
  total: number;
  onSuccess: () => void;
}

const PaypalButton: React.FC<PaypalButtonProps> = ({ total, onSuccess }) => {
  const paypalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Evitar doble renderizado
    if (!paypalRef.current || paypalRef.current.children.length > 0) return;

    window.paypal.Buttons({
      createOrder: function (data: any, actions: any) {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: total.toFixed(2)
            }
          }]
        });
      },
      onApprove: async function (data: any, actions: any) {
        await actions.order.capture();
        onSuccess();
      },
      onError: function (err: any) {
        console.error('Error de PayPal:', err);
      }
    }).render(paypalRef.current);
  }, [total]);

  return <div ref={paypalRef} />;
};

export default PaypalButton;
