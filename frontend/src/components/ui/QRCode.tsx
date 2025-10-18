import { useEffect, useRef } from 'react';
import QRCodeLib from 'qrcode';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export default function QRCode({ value, size = 200, className = '' }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCodeLib.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#0ea5e9',
          light: '#ffffff',
        },
      }).catch(err => {
        console.error('QR Code generation failed:', err);
      });
    }
  }, [value, size]);

  return (
    <div className={className}>
      <canvas ref={canvasRef} className="border border-gray-200 rounded-lg" />
    </div>
  );
}
