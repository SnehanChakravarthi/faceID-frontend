import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type DeviceInfo = {
  deviceId: string;
  label: string;
};

interface CaptureImageUIProps {
  isLoading: boolean;
  setCapturedFrames: (frames: string[]) => void;
  capturedFrames: string[];
  isAuthentication?: boolean;
}

const CaptureImageUI = ({
  isLoading,
  setCapturedFrames,
  capturedFrames,
  isAuthentication = false,
}: CaptureImageUIProps) => {
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraInitializing, setIsCameraInitializing] = useState(true);

  useEffect(() => {
    const initializeCamera = async () => {
      setIsCameraInitializing(true);

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === 'videoinput'
        );
        setDevices(
          videoDevices.map((device) => ({
            deviceId: device.deviceId,
            label: device.label || `Camera ${devices.indexOf(device) + 1}`,
          }))
        );

        await startCamera();
      } catch (error) {
        console.error('Error accessing camera:', error);
      } finally {
        setIsCameraInitializing(false);
      }
    };

    initializeCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Add this useEffect to handle device selection changes
  useEffect(() => {
    if (selectedDevice) {
      const switchCamera = async () => {
        try {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
          }

          const newStream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: selectedDevice,
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          });

          if (videoRef.current) {
            videoRef.current.srcObject = newStream;
            streamRef.current = newStream;
          }
        } catch (error) {
          console.error('Error switching camera:', error);
        }
      };

      switchCamera();
    }
  }, [selectedDevice]);

  const handleCapture = async () => {
    setCapturedFrames([]);
    setIsRecording(true);

    // Start countdown from 3
    if (!isAuthentication) {
      for (let i = 3; i >= 1; i--) {
        setCountdown(i);
        await new Promise((resolve) => setTimeout(resolve, 750));
      }
      setCountdown(null);
    }

    // Capture 6 frames with a small delay between each
    const frames: string[] = [];
    for (let i = 0; i < 6; i++) {
      if (videoRef.current) {
        const canvas = document.createElement('canvas');
        try {
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            // ctx.translate(canvas.width, 0);
            // ctx.scale(-1, 1); // Mirror the image
            ctx.drawImage(videoRef.current, 0, 0);
            frames.push(canvas.toDataURL('image/jpeg'));
          }
        } finally {
          // Clean up canvas element
          canvas.remove();
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 50)); // 50ms delay between frames
    }

    setCapturedFrames(frames);
    setIsRecording(false);
  };

  const startCamera = async () => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedDevice || undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraReady(true);
      }
    } catch (error) {
      console.log('Error accessing camera:', error);
      setError(
        'Unable to access camera. Please check permissions and try again.'
      );
    }
  };

  const handleRetake = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setCapturedFrames([]);
    await startCamera();
  };

  return (
    <div className="flex flex-col justify-center w-full mx-auto gap-4">
      <div
        className={cn(
          'flex flex-row items-center gap-3 w-full',
          isAuthentication && 'hidden'
        )}
      >
        <div
          className={cn(
            'w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-sm font-medium transition-colors duration-200 bg-neutral-300 text-neutral-500',
            capturedFrames.length > 0 &&
              'ring-2 ring-offset-2 ring-green-500 text-white bg-green-500'
          )}
        >
          {capturedFrames.length > 0 ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            '1'
          )}
        </div>
        <div className="text-sm font-medium text-neutral-500 tracking-tight">
          {capturedFrames.length > 0 ? (
            <p>
              Photo captured.{' '}
              <span
                onClick={handleRetake}
                className="text-neutral-900 hover:underline transition-all duration-150 cursor-pointer"
              >
                Take another photo
              </span>{' '}
              if needed
            </p>
          ) : (
            'Center your face in the frame, look directly at the camera and capture'
          )}
        </div>
      </div>

      {/* Video Container */}
      <div className="flex flex-col w-full items-center justify-center shadow-md bg-black shadow-black/60 rounded-3xl  overflow-hidden relative">
        {/* Captured Image */}
        {capturedFrames.length > 0 ? (
          <div className="relative group w-full h-80">
            <Image
              src={capturedFrames[capturedFrames.length - 1]}
              alt="Last Frame"
              fill
              className="w-auto h-full object-cover rounded-2xl shadow-lg"
              style={{ transform: 'scaleX(-1)' }}
            />
            <button
              onClick={handleRetake}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2.5 rounded-full 
                           text-sm font-medium bg-white/60 backdrop-blur-sm hover:bg-white/90
                           transition-all duration-200 shadow-lg
                           text-neutral-900 opacity-0 group-hover:opacity-100"
            >
              Retake Photo
            </button>
          </div>
        ) : (
          <div className="relative w-full h-80">
            {/* Webcam Video */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full object-cover"
              style={{
                transform: 'scaleX(-1)',
              }}
            />
            {/* Device Selector */}
            {devices.length > 1 && (
              <div className="absolute top-2 right-2 z-10">
                <Select
                  value={selectedDevice}
                  onValueChange={(value) => setSelectedDevice(value)}
                >
                  <SelectTrigger className="h-6">
                    <SelectValue placeholder="Select Device" />
                  </SelectTrigger>
                  <SelectContent>
                    {devices.map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {/* Guidelines */}
            {isCameraReady && !isRecording && (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                {/* Outer dark overlay */}
                <div className="absolute inset-0 bg-black/30">
                  {/* Transparent circle cutout */}
                  <div
                    className="absolute left-1/2  -translate-x-1/2 top-6 w-40 h-48 rounded-full bg-transparent "
                    style={{ boxShadow: '0 0 0 100vmax rgba(0, 0, 0, 0.3)' }}
                  >
                    {/* Guidelines */}
                    <div className="absolute inset-0 border-[3px] border-dashed border-white/30 rounded-full" />
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-[2px] bg-white/20" />
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-[2px] bg-white/20" />
                  </div>
                </div>
              </div>
            )}
            {/* Capture Button */}
            {isCameraReady && !isRecording && (
              <div className="flex flex-col justify-center items-center absolute bottom-4 w-full">
                <button
                  onClick={handleCapture}
                  disabled={isRecording || isLoading}
                  className={cn(
                    'h-14 w-14 rounded-full text-2xl group font-semibold flex items-center justify-center transition-all hover:border-yellow-400 active:scale-95',
                    isRecording || isLoading
                      ? 'cursor-not-allowed'
                      : 'border-white border-[3px] shadow-lg hover:shadow-xl'
                  )}
                >
                  <div className="h-12 w-12 rounded-full bg-white group-hover:bg-yellow-400 transition-colors"></div>
                </button>
              </div>
            )}
            {/* Countdown */}
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                <div className="flex items-center justify-center w-32 h-32 rounded-3xl bg-white/20 backdrop-blur-md">
                  <span className="text-7xl font-medium text-white">
                    {countdown}
                  </span>
                </div>
              </div>
            )}
            {isCameraInitializing && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-y-2 border-white" />
              </div>
            )}

            {error && (
              <div className="text-red-500 inset-0 h-full w-full flex flex-col gap-1 items-center justify-center text-sm mt-2 z-50 absolute">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                </svg>
                <p>{error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CaptureImageUI;
