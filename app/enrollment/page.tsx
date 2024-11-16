'use client';

import CaptureImageUI, { CaptureImageUIRef } from '@/components/CaptureUI';
import EnterDataUI from '@/components/EnterDataUI';
import ErrorAlert from '@/components/errorAlert';
import { cn, compressImage } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  AuthenticateCode,
  EnrollmentCode,
  EnrollmentResponse,
  formSchema,
} from '@/lib/schema';
import Link from 'next/link';

export default function EnrollmentPage() {
  const captureImageRef = useRef<CaptureImageUIRef>(null);
  const [capturedFrames, setCapturedFrames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [requestTime, setRequestTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enrollResult, setEnrollResult] = useState<EnrollmentResponse | null>(
    null
  );
  const [success, setSuccess] = useState<boolean | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '',
      firstName: '',
      lastName: '',
      age: 0, // Change from undefined to 0
      gender: '',
      email: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (enrollResult?.code !== EnrollmentCode.SUCCESS) {
      setError(enrollResult?.message ?? null);
    } else if (enrollResult?.code === EnrollmentCode.SUCCESS) {
      setSuccess(true);
    }
  }, [enrollResult]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null); // Reset error state

    try {
      const formDataToSend = new FormData();
      // Add all form fields in one go
      Object.entries(values).forEach(([key, value]) => {
        if (key === 'age' && value === 0) {
          formDataToSend.append(key, '');
        } else {
          formDataToSend.append(key, value.toString());
        }
      });

      // Process and add only the last image
      if (capturedFrames.length > 0) {
        const lastImageUrl = capturedFrames[capturedFrames.length - 1];
        const compressedBlob = await compressImage(lastImageUrl);
        const lastImageFile = new File([compressedBlob], 'user_image.jpg', {
          type: 'image/jpeg',
        });
        formDataToSend.append('image', lastImageFile);
      }

      // Debugging: Log the FormData content
      // for (let pair of formDataToSend.entries()) {
      //   console.log(pair[0] + ', ' + pair[1]);
      // }

      const startTime = performance.now();

      const response = await fetch('/api/enroll', {
        method: 'POST',
        body: formDataToSend,
        headers: {
          Accept: 'application/json',
        },
        // Add timeout and credentials
        signal: AbortSignal.timeout(200000), // 200 second timeout
      });

      const result: EnrollmentResponse = await response.json();

      console.dir(result, { depth: 4 });

      const endTime = performance.now(); // Stop the timer
      setRequestTime(endTime - startTime);

      setEnrollResult(result);
    } catch (error) {
      console.log('Enrollment error:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to complete enrollment. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  const handleRetakeFromCapture = async () => {
    setEnrollResult(null);
    setError(null);
  };

  const handleRetry = async () => {
    setCapturedFrames([]);
    form.reset();
    setEnrollResult(null);
    setError(null);
    captureImageRef.current?.handleRetake();
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-start pt-10 md:pt-20 bg-neutral-50 min-h-screen md:py-10 py-4 px-4">
      <div className="flex flex-col items-start max-w-lg w-full md:gap-8 gap-4">
        <h1 className="md:text-5xl text-4xl font-semibold text-neutral-900 tracking-tight">
          Face ID Enrollment
          <span className="block md:text-xl text-lg font-normal text-neutral-500">
            Quick and secure registration
          </span>
        </h1>
        <CaptureImageUI
          ref={captureImageRef}
          setCapturedFrames={setCapturedFrames}
          isLoading={isLoading}
          capturedFrames={capturedFrames}
          error={error}
          success={success}
          handleRetakeFromCapture={handleRetakeFromCapture}
        />
        {!enrollResult ? (
          <EnterDataUI
            form={form}
            onSubmit={onSubmit}
            isLoading={isLoading}
            capturedFrames={capturedFrames}
          />
        ) : (
          <>
            {enrollResult && (
              <div
                className={cn(
                  'mt-8 p-6 md:p-8 relative rounded-3xl shadow-2xl max-w-lg w-full mx-auto bg-gradient-to-br from-neutral-900 from-50% to-neutral-800',
                  success
                    ? 'bg-gradient-to-b from-neutral-900 from-50% to-green-950'
                    : 'bg-gradient-to-b from-neutral-900 from-50% to-red-950'
                )}
              >
                {/* Status Header */}
                <div className="flex flex-col md:flex-row justify-between w-full mb-4 gap-4">
                  <div>
                    {/* <h2 className="text-2xl font-medium text-white tracking-tight">
                    {authResult.code === AuthenticateCode.SUCCESS &&
                    authResult.match
                      ? 'Authentication Successful'
                      : 'Authentication Failed'}
                  </h2> */}
                    <div className="flex flex-row gap-2 items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={cn(
                          enrollResult.anti_spoofing?.is_real
                            ? 'text-green-500'
                            : 'hidden'
                        )}
                      >
                        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={cn(
                          !enrollResult.anti_spoofing?.is_real
                            ? 'text-red-500'
                            : 'hidden'
                        )}
                      >
                        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                        <line x1="12" x2="12" y1="8" y2="12" />
                        <line x1="12" x2="12.01" y1="16" y2="16" />
                      </svg>
                      <p className="text-white text-lg mt-1">
                        {enrollResult.anti_spoofing?.is_real
                          ? 'Genuine Presence Detected'
                          : 'Spoofing Attempt Detected'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Security Metrics */}
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-4 pb-4 border-b border-neutral-700">
                  {enrollResult.anti_spoofing?.antispoof_score !==
                    undefined && (
                    <div className="flex flex-col gap-1.5">
                      <p className="text-sm text-neutral-400">
                        Liveness Detection Score
                      </p>
                      <p className="text-xl text-white font-medium">
                        {(
                          enrollResult.anti_spoofing.antispoof_score * 100
                        ).toFixed(1)}
                      </p>
                    </div>
                  )}
                  {enrollResult.anti_spoofing?.confidence !== undefined && (
                    <div className="flex flex-col gap-1.5">
                      <p className="text-sm text-neutral-400">
                        Liveness Detection Confidence
                      </p>
                      <p className="text-xl text-white font-medium">
                        {(enrollResult.anti_spoofing.confidence * 100).toFixed(
                          1
                        )}
                        %
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col md:flex-row gap-4 w-full justify-between mb-4 pt-2">
                  <h2 className="text-2xl font-medium text-white tracking-tight">
                    {success ? 'Enrollment Successful' : 'Enrollment Failed'}
                  </h2>
                </div>

                {(enrollResult.code !== EnrollmentCode.SUCCESS || error) && (
                  <div className="px-4 py-1.5 rounded-xl text-md w-fit font-medium shadow-md bg-red-500/30 text-red-400 shadow-red-500/10">
                    {enrollResult.message ?? error}
                  </div>
                )}
                {/* {authResult.code === AuthenticateCode.SUCCESS && authResult.match && (
                <div className="px-4 py-1.5 rounded-full md:hidden w-fit mb-4 text-sm font-medium shadow-md bg-green-500/30 text-green-400 shadow-green-500/10">
                  {(authResult.match.score * 100).toFixed(0)}% Match
                </div>
              )} */}
                {/* User Details - Only show if authentication was successful */}
                {success && (
                  <div className="flex flex-col md:grid md:grid-cols-2 gap-6 mb-6">
                    <div className="flex flex-col gap-1.5">
                      <p className="text-sm text-neutral-400">Name</p>
                      <p className="text-white">
                        {form.getValues().firstName} {form.getValues().lastName}
                      </p>
                    </div>
                    {form.getValues().id && (
                      <div className="flex flex-col gap-1.5">
                        <p className="text-sm text-neutral-400">ID</p>
                        <p className="text-white">{form.getValues().id}</p>
                      </div>
                    )}
                    {form.getValues().email && (
                      <div className="flex flex-col gap-1.5">
                        <p className="text-sm text-neutral-400">Email</p>
                        <p className="text-white">{form.getValues().email}</p>
                      </div>
                    )}
                    {form.getValues().phone && (
                      <div className="flex flex-col gap-1.5">
                        <p className="text-sm text-neutral-400">Phone</p>
                        <p className="text-white">{form.getValues().phone}</p>
                      </div>
                    )}
                    {(form.getValues('age') ?? 0) > 0 && (
                      <div className="flex flex-col gap-1.5">
                        <p className="text-sm text-neutral-400">Age</p>
                        <p className="text-white">{form.getValues().age}</p>
                      </div>
                    )}
                    {form.getValues().gender && (
                      <div className="flex flex-col gap-1.5">
                        <p className="text-sm text-neutral-400">Gender</p>
                        <p className="text-white">{form.getValues().gender}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Retry Button */}
                <div className="w-full flex justify-end mt-4">
                  <div
                    className="w-fit flex items-center gap-1 z-10 text-neutral-400 hover:text-white transition-colors duration-200  cursor-pointer"
                    onClick={handleRetry}
                  >
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
                      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                      <path d="M21 3v5h-5" />
                    </svg>
                    <div className="text-sm w-fit">Try Again</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <div className="flex flex-row gap-8 mt-8">
        {enrollResult?.code !== EnrollmentCode.SUCCESS && (
          <div
            onClick={handleRetry}
            className="underline hover:text-green-500 transition-all duration-200 cursor-pointer "
          >
            New enrollment
          </div>
        )}
        <Link
          className="underline hover:text-green-500 transition-all duration-200 flex flex-row gap-2 items-center"
          href="/authentication"
        >
          Authenticate with Face ID{' '}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
