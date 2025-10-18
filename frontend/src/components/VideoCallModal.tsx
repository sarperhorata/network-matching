import { useEffect, useRef, useState } from 'react';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  userName: string;
  meetingTitle?: string;
}

/**
 * Video Call Modal using Jitsi Meet
 * 
 * Setup:
 * 1. Add Jitsi script to index.html:
 *    <script src='https://meet.jit.si/external_api.js'></script>
 * 
 * 2. Or use self-hosted Jitsi instance
 */
export default function VideoCallModal({
  isOpen,
  onClose,
  roomName,
  userName,
  meetingTitle = 'Meeting',
}: VideoCallModalProps) {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const [jitsiApi, setJitsiApi] = useState<any>(null);

  useEffect(() => {
    if (isOpen && jitsiContainerRef.current) {
      initializeJitsi();
    }

    return () => {
      if (jitsiApi) {
        jitsiApi.dispose();
      }
    };
  }, [isOpen]);

  const initializeJitsi = () => {
    // Check if Jitsi external API is loaded
    if (!(window as any).JitsiMeetExternalAPI) {
      console.error('Jitsi Meet API not loaded. Add script to index.html');
      return;
    }

    const domain = process.env.VITE_JITSI_DOMAIN || 'meet.jit.si';

    const options = {
      roomName: roomName,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName: userName,
      },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        prejoinPageEnabled: true,
        disableDeepLinking: true,
        enableNoisyMicDetection: true,
        enableClosePage: false,
        remoteVideoMenu: {
          disableKick: true,
        },
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone',
          'camera',
          'closedcaptions',
          'desktop',
          'fullscreen',
          'fodeviceselection',
          'hangup',
          'chat',
          'raisehand',
          'videoquality',
          'filmstrip',
          'tileview',
        ],
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_BACKGROUND: '#474747',
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
      },
    };

    const api = new (window as any).JitsiMeetExternalAPI(domain, options);

    // Event listeners
    api.addEventListener('videoConferenceJoined', () => {
      console.log('User joined the video conference');
    });

    api.addEventListener('videoConferenceLeft', () => {
      console.log('User left the video conference');
      onClose();
    });

    api.addEventListener('readyToClose', () => {
      onClose();
    });

    setJitsiApi(api);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
      <div className="w-full h-full md:w-11/12 md:h-5/6 bg-white rounded-lg overflow-hidden relative">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 bg-gray-900 bg-opacity-90 text-white px-4 py-3 flex items-center justify-between z-10">
          <div>
            <h3 className="font-semibold">{meetingTitle}</h3>
            <p className="text-sm text-gray-300">Video Call</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-red-400 transition-colors"
            title="Leave Call"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Jitsi Container */}
        <div
          ref={jitsiContainerRef}
          className="w-full h-full"
          id="jitsi-container"
        />

        {/* Loading State */}
        {!jitsiApi && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Connecting to video call...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Quick Start Video Call Component
 * For instant 1-on-1 calls without scheduled meetings
 */
export function QuickVideoCall({
  isOpen,
  onClose,
  recipientName,
  currentUserName,
}: {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  currentUserName: string;
}) {
  const roomName = `quick-call-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  return (
    <VideoCallModal
      isOpen={isOpen}
      onClose={onClose}
      roomName={roomName}
      userName={currentUserName}
      meetingTitle={`Call with ${recipientName}`}
    />
  );
}

