'use client';

import CaptureImageUI, { CaptureImageUIRef } from '@/components/CaptureUI';
import ErrorAlert from '@/components/errorAlert';
import React, { useState, useEffect, useRef } from 'react';
import { cn, compressImage } from '@/lib/utils';
import Link from 'next/link';
import { AuthenticateCode, AuthenticateResponse } from '@/lib/schema';

const AuthenticationPage = () => {
  const captureImageRef = useRef<CaptureImageUIRef>(null);
  const [capturedFrames, setCapturedFrames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [requestTime, setRequestTime] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [authResult, setAuthResult] = useState<AuthenticateResponse | null>(
    null
  );

  useEffect(() => {
    if (capturedFrames.length > 0) {
      handleAuthentication();
    }
  }, [capturedFrames]);

  useEffect(() => {
    if (authResult && !authResult?.match) {
      setError('No match found');
    }
  }, [authResult]);

  async function handleAuthentication() {
    setIsLoading(true);
    setError('');
    setAuthResult(null);
    try {
      const startTime = performance.now();

      const formDataToSend = new FormData();
      // Process images in chunks similar to enrollment

      // Process and add only the last image
      if (capturedFrames.length > 0) {
        const lastImageUrl = capturedFrames[capturedFrames.length - 1];
        const compressedBlob = await compressImage(lastImageUrl);
        const lastImageFile = new File([compressedBlob], 'user_image.jpg', {
          type: 'image/jpeg',
        });
        formDataToSend.append('image', lastImageFile);
      }

      const response = await fetch('/api/authenticate', {
        method: 'POST',
        body: formDataToSend,
        headers: {
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(200000), // 200 second timeout
      });

      const result: AuthenticateResponse = await response.json();

      console.dir(result, { depth: 4 });

      const endTime = performance.now(); // Stop the timer
      setRequestTime(endTime - startTime);

      setAuthResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  }

  function handleRetry() {
    setAuthResult(null);
    setError('');
    setRequestTime(null);
    setCapturedFrames([]);
    captureImageRef.current?.handleRetake();
  }

  return (
    <div className="h-full w-full flex flex-col items-center justify-between pt-10 md:pt-20 bg-neutral-50 min-h-screen md:py-10 py-4 px-4 ">
      <div className="flex flex-col items-start max-w-lg w-full md:gap-8 gap-4">
        <h1 className="text-3xl md:text-5xl font-semibold text-neutral-900 tracking-tight">
          Face ID Authentication
          <span className="block md:text-xl text-lg font-normal text-neutral-500">
            Quick and secure authentication
          </span>
        </h1>
        <CaptureImageUI
          ref={captureImageRef}
          setCapturedFrames={setCapturedFrames}
          isLoading={isLoading}
          capturedFrames={capturedFrames}
          isAuthentication={true}
          error={error}
          success={authResult?.match ? true : false}
        />
      </div>

      {isLoading && (
        <div className="text-center p-4 mt-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Authenticating...</p>
        </div>
      )}
      {authResult && (
        <div
          className={cn(
            'mt-8 p-6 md:p-8 relative rounded-3xl shadow-2xl max-w-lg w-full mx-auto bg-gradient-to-br from-neutral-900 from-50% to-neutral-800',
            authResult.code === AuthenticateCode.SUCCESS && authResult.match
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
                    authResult.anti_spoofing?.is_real
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
                    !authResult.anti_spoofing?.is_real
                      ? 'text-red-500'
                      : 'hidden'
                  )}
                >
                  <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
                <p className="text-white text-lg mt-1">
                  {authResult.anti_spoofing?.is_real
                    ? 'Genuine Presence Detected'
                    : 'Spoofing Attempt Detected'}
                </p>
              </div>
            </div>
          </div>

          {/* Security Metrics */}
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4 pb-4 border-b border-neutral-700">
            {authResult.anti_spoofing?.antispoof_score !== undefined && (
              <div className="flex flex-col gap-1.5">
                <p className="text-sm text-neutral-400">
                  Liveness Detection Score
                </p>
                <p className="text-xl text-white font-medium">
                  {(authResult.anti_spoofing.antispoof_score * 100).toFixed(1)}
                </p>
              </div>
            )}
            {authResult.anti_spoofing?.confidence !== undefined && (
              <div className="flex flex-col gap-1.5">
                <p className="text-sm text-neutral-400">
                  Liveness Detection Confidence
                </p>
                <p className="text-xl text-white font-medium">
                  {(authResult.anti_spoofing.confidence * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full justify-between mb-4 pt-2">
            <h2 className="text-2xl font-medium text-white tracking-tight">
              {authResult.code === AuthenticateCode.SUCCESS && authResult.match
                ? 'Authentication Successful'
                : 'Authentication Failed'}
            </h2>

            {/* Status Badge */}
            {authResult.code === AuthenticateCode.SUCCESS &&
              authResult.match && (
                <div className="px-4 py-1.5 rounded-full hidden md:block text-md font-medium shadow-md bg-green-500/30 text-green-400 shadow-green-500/10">
                  {(authResult.match.score * 100).toFixed(0)}% Match
                </div>
              )}
          </div>

          {authResult.code !== AuthenticateCode.SUCCESS && (
            <div className="px-4 py-1.5 rounded-xl text-md w-fit font-medium shadow-md bg-red-500/30 text-red-400 shadow-red-500/10">
              {authResult.message}
            </div>
          )}
          {/* {authResult.code === AuthenticateCode.SUCCESS && authResult.match && (
            <div className="px-4 py-1.5 rounded-full md:hidden w-fit mb-4 text-sm font-medium shadow-md bg-green-500/30 text-green-400 shadow-green-500/10">
              {(authResult.match.score * 100).toFixed(0)}% Match
            </div>
          )} */}
          {/* User Details - Only show if authentication was successful */}
          {authResult.match && authResult.code === AuthenticateCode.SUCCESS && (
            <div className="flex flex-col md:grid md:grid-cols-2 gap-6 mb-6">
              <div className="flex flex-col gap-1.5">
                <p className="text-sm text-neutral-400">Name</p>
                <p className="text-white">
                  {authResult.match.metadata.firstName}{' '}
                  {authResult.match.metadata.lastName}
                </p>
              </div>
              {authResult.match.metadata.id && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm text-neutral-400">ID</p>
                  <p className="text-white">{authResult.match.metadata.id}</p>
                </div>
              )}
              {authResult.match.metadata.email && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm text-neutral-400">Email</p>
                  <p className="text-white">
                    {authResult.match.metadata.email}
                  </p>
                </div>
              )}
              {authResult.match.metadata.phone && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm text-neutral-400">Phone</p>
                  <p className="text-white">
                    {authResult.match.metadata.phone}
                  </p>
                </div>
              )}
              {authResult.match.metadata.age && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm text-neutral-400">Age</p>
                  <p className="text-white">{authResult.match.metadata.age}</p>
                </div>
              )}
              {authResult.match.metadata.gender && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm text-neutral-400">Gender</p>
                  <p className="text-white">
                    {authResult.match.metadata.gender}
                  </p>
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

      <div className="flex flex-row gap-2 max-w-md mx-auto mt-20 text-neutral-500 self-end">
        {/* <div
          onClick={handleRetry}
          className="underline hover:text-green-500 transition-all duration-200 cursor-pointer"
        >
          Try again
        </div> */}
        Don&apos;t have a Face ID?
        <Link
          className="underline hover:text-green-500 transition-all duration-200 flex flex-row gap-2 items-center text-neutral-800"
          href="/enrollment"
        >
          Get Started{' '}
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

      {/* {error && <ErrorAlert error={error} />} */}
    </div>
  );
};

export default AuthenticationPage;
