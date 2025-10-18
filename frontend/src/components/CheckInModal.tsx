import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { eventsService } from '../services/events.service';
import QRCode from './ui/QRCode';
import toast from 'react-hot-toast';

interface CheckInModalProps {
  eventId: string;
  eventTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckInModal({ eventId, eventTitle, isOpen, onClose }: CheckInModalProps) {
  const { user } = useAuthStore();
  const [qrCode, setQrCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (isOpen && eventId) {
      loadQRCode();
    }
  }, [isOpen, eventId]);

  const loadQRCode = async () => {
    if (!eventId) return;

    setLoading(true);
    try {
      const qrData = await eventsService.generateQRCode(eventId);
      setQrCode(qrData);
      setCheckInStatus('idle');
    } catch (error: any) {
      console.error('Failed to generate QR code:', error);
      toast.error('Failed to generate check-in code');
      setCheckInStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!eventId || !user) return;

    setLoading(true);
    try {
      await eventsService.checkIn(eventId);
      setCheckInStatus('success');
      toast.success('Successfully checked in!');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error('Check-in failed:', error);
      toast.error(error.message || 'Check-in failed');
      setCheckInStatus('error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Check In</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="text-center mb-6">
          <h3 className="text-lg font-medium mb-2">{eventTitle}</h3>
          <p className="text-gray-600">Show this QR code at the event entrance</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="text-gray-600">Generating QR code...</div>
          </div>
        ) : checkInStatus === 'success' ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-600 font-medium">Check-in successful!</p>
          </div>
        ) : checkInStatus === 'error' ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-600 font-medium">Check-in failed</p>
            <button
              onClick={loadQRCode}
              className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <QRCode value={qrCode} size={200} />
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Alternative Check-in:</strong>
              </p>
              <p className="text-sm text-gray-600">
                If QR code scanning doesn't work, event staff can manually check you in using your name and email.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCheckIn}
                disabled={loading}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  loading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {loading ? 'Checking in...' : 'Check In Manually'}
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
