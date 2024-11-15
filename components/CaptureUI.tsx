import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { forwardRef, useImperativeHandle } from 'react';
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

export interface CaptureImageUIRef {
  handleRetake: () => Promise<void>;
}

interface CaptureImageUIProps {
  isLoading: boolean;
  setCapturedFrames: (frames: string[]) => void;
  capturedFrames: string[];
  isAuthentication?: boolean;
  error: string | null;
  success: boolean | null;
}

const CaptureImageUI = forwardRef<CaptureImageUIRef, CaptureImageUIProps>(
  (props, ref) => {
    const {
      isLoading,
      setCapturedFrames,
      capturedFrames,
      isAuthentication,
      error,
      success,
    } = props;

    const [devices, setDevices] = useState<DeviceInfo[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<string>('');
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [isCameraInitializing, setIsCameraInitializing] = useState(true);
    const [componentError, setComponentError] = useState<string | null>(null);
    const [componentSuccess, setComponentSuccess] = useState<boolean | null>(
      null
    );

    useEffect(() => {
      setComponentError(error);
      setComponentSuccess(success);
    }, [error, success]);

    useEffect(() => {
      const initializeCamera = async () => {
        setIsCameraInitializing(true);

        try {
          if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.enumerateDevices
          ) {
            throw new Error('Camera API not supported');
          }

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
          console.log('Error accessing camera:', error);
          setCameraError('Camera API not supported or permission denied.');
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
      if (videoRef.current) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (ctx) {
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;

          for (let i = 0; i < 6; i++) {
            ctx.drawImage(videoRef.current, 0, 0);
            frames.push(canvas.toDataURL('image/jpeg'));
            await new Promise((resolve) => setTimeout(resolve, 50)); // 50ms delay between frames
          }
        }

        // Clean up canvas element
        canvas.remove();
      }

      setCapturedFrames(frames);
      setIsRecording(false);
    };

    const startCamera = async () => {
      try {
        setCameraError(null);
        setIsCameraReady(false);

        // Stop existing streams if any
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

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
        console.error('Error accessing camera:', error);
        setCameraError(
          'Unable to access camera. Please check permissions and try again.'
        );
      }
    };

    const handleRetakeCore = async () => {
      setComponentError(null);
      setComponentSuccess(null);
      setCapturedFrames([]);
      await startCamera();
    };

    useImperativeHandle(ref, () => ({
      handleRetake: handleRetakeCore,
    }));

    const handleRetake = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      await handleRetakeCore();
    };

    return (
      <div className="flex flex-col justify-center w-full mx-auto gap-4">
        <div
          className={cn(
            'flex flex-row items-center gap-3 w-full',
            (isAuthentication || componentSuccess) && 'hidden'
          )}
        >
          <div
            className={cn(
              'w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-sm font-medium transition-all duration-500 bg-neutral-300 text-neutral-500',
              capturedFrames.length > 0 &&
                'ring-2 ring-offset-2 ring-green-500  bg-green-500'
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(
                'opacity-0',
                capturedFrames.length > 0 && 'opacity-100'
              )}
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <div
              className={cn(
                'opacity-100 absolute transition-all duration-500',
                capturedFrames.length > 0 && 'opacity-0'
              )}
            >
              1
            </div>
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
        <div
          className={cn(
            'flex flex-col w-full group items-center shadow-md justify-center bg-black rounded-3xl transition-all duration-500 overflow-hidden relative',
            isRecording &&
              'ring-2 ring-green-500 shadow-[0_0_10px_8px_rgba(34,197,94,1)]',
            !isRecording && 'shadow-black/60',
            isLoading && 'ring-2 ring-green-700',
            componentError && 'ring-2 ring-red-500',
            componentSuccess && 'ring-2 ring-green-500'
            // capturedFrames.length > 0 && 'ring-2 ring-green-500'
            // isAuthentication &&
            //   'ring-2 ring-blue-500 shadow-[0_0_15px_10px_rgba(59,130,246,1)] '
          )}
        >
          <div
            className={cn(
              'ring-2 w-full h-full absolute inset-0 z-20 ring-blue-500 transition-all duration-300 rounded-3xl shadow-',
              !isRecording &&
                capturedFrames.length === 0 &&
                ' group-hover:shadow-[inset_0_0_40px_5px_rgba(0,0,0,0.2)] shadow-[inset_0_0_40px_5px_rgba(0,0,0,0.8)] ',
              !isRecording &&
                capturedFrames.length > 0 &&
                !isLoading &&
                ' shadow-[inset_0_0_50px_5px_rgba(34,197,94,1)] ',
              !isRecording &&
                capturedFrames.length > 0 &&
                isLoading &&
                'shadow-[inset_0_0_300px_6px_rgba(34,197,94,1)] animate-pulse transition-all duration-1000',
              componentError && 'shadow-[inset_0_0_100px_6px_rgba(239,68,68,1)]'
            )}
          ></div>
          {/* <div
          className="ring-2 w-full h-full absolute inset-0 z-20 ring-blue-500 rounded-3xl animate-pulse "
          style={{ boxShadow: 'inset 0 0 50px 10px rgba(59,130,246,1)' }}
        ></div> */}
          {/* Captured Image */}
          {capturedFrames.length > 0 ? (
            <div className="relative  w-full h-80 ">
              <Image
                src={capturedFrames[capturedFrames.length - 1]}
                alt="Last Frame"
                fill
                className="w-auto h-full object-cover rounded-2xl shadow-lg"
                style={{ transform: 'scaleX(-1)' }}
              />
              <button
                onClick={handleRetake}
                className={cn(
                  'absolute bottom-4 left-1/2 z-50 -translate-x-1/2 px-6 py-2.5 rounded-full text-sm font-medium bg-white backdrop-blur-sm hover:bg-white/90 transition-all duration-200 shadow-lg text-neutral-900 ',
                  (componentSuccess || isLoading) && 'hidden'
                )}
              >
                Retry
              </button>
            </div>
          ) : (
            <div className={cn('relative w-full h-80 group')}>
              {/* Webcam Video */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full object-cover w-full"
                style={{
                  transform: 'scaleX(-1)',
                }}
              />
              {/* Device Selector */}
              {devices.length > 1 && (
                <div className="absolute top-2 right-2 z-50">
                  <Select
                    value={selectedDevice}
                    onValueChange={(value) => setSelectedDevice(value)}
                  >
                    <SelectTrigger className="h-6">
                      <SelectValue placeholder="Select Device" />
                    </SelectTrigger>
                    <SelectContent>
                      {devices.map((device) => (
                        <SelectItem
                          key={device.deviceId}
                          value={device.deviceId}
                        >
                          {device.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {/* Guidelines */}
              {isCameraReady && !componentSuccess && (
                <div className="absolute group-hover:opacity-100  opacity-0 transition-all duration-300 inset-0 w-full h-full flex items-center justify-center">
                  {/* Outer dark overlay */}
                  <div className="absolute inset-0 bg-black/20">
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
              {isCameraReady && !isRecording && !componentSuccess && (
                <div className="flex flex-col justify-center z-50 items-center absolute bottom-4 w-full">
                  <button
                    onClick={handleCapture}
                    disabled={isRecording || isLoading}
                    className={cn(
                      'h-14 w-14 rounded-full text-2xl group/capture font-semibold flex items-center justify-center transition-all hover:border-yellow-400 active:scale-95',
                      isRecording || isLoading
                        ? 'cursor-not-allowed'
                        : 'border-white border-[3px] shadow-lg hover:shadow-xl'
                    )}
                  >
                    <div className="h-12 w-12 rounded-full bg-white group-hover/capture:bg-yellow-400 transition-colors"></div>
                  </button>
                </div>
              )}
              {/* Countdown */}
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                  <div className="flex items-center justify-center ">
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

              {cameraError && (
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
                  <p>{cameraError}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default CaptureImageUI;
