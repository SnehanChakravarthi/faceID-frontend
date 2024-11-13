'use client';

import CaptureImageUI from '@/components/CaptureUI';
import ErrorAlert from '@/components/errorAlert';
import React, { useState, useEffect } from 'react';
import { cn, compressImage } from '@/lib/utils';
import Link from 'next/link';

interface User {
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  email: string;
  phone: string;
  id: string;
  score: number;
  timestamp: number;
}

interface AuthenticationResponse {
  success: boolean;
  message: string;
  user?: User;
  isReal?: boolean;
  antispoofScore?: number;
  confidence?: number;
  error?: string;
}

const AuthenticationPage = () => {
  const [capturedFrames, setCapturedFrames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [requestTime, setRequestTime] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [authResult, setAuthResult] = useState<AuthenticationResponse | null>(
    null
  );

  useEffect(() => {
    if (capturedFrames.length > 0) {
      handleAuthentication();
    }
  }, [capturedFrames]);

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

      const result: AuthenticationResponse = await response.json();

      console.dir(result, { depth: 4 });

      // if (!response.ok) {
      //   throw new Error(
      //     result.error || `Authenticatssion failed: ${response.status}`
      //   );
      // }

      const endTime = performance.now(); // Stop the timer
      setRequestTime(endTime - startTime);

      if (result.success && result.user) {
        console.log('match', result);
        setAuthResult(result);
        // setMatch({
        //   id: result.user.id,
        //   score: result.user.score, // Adjusted to match response
        //   metadata: {
        //     firstName: result.user.metadata.firstName,
        //     lastName: result.user.metadata.lastName,
        //     age: result.user.metadata.age,
        //     gender: result.user.metadata.gender,
        //     email: result.user.metadata.email,
        //     phone: result.user.metadata.phone,
        //     id: result.user.metadata.id,
        //     timestamp: result.user.metadata.timestamp,
        //     embedding_number: result.user.metadata.embedding_number, // Added this field
        //   },
        //   sparse_values: {
        //     indices: [],
        //     values: [],
        //   },
        //   values: [],
        // });
      } else {
        console.log('no match', result);
        setError(result.message || 'No match found');
      }
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
          setCapturedFrames={setCapturedFrames}
          isLoading={isLoading}
          capturedFrames={capturedFrames}
          isAuthentication={true}
          error={error}
          success={authResult?.success || null}
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
            'mt-8 p-4 md:p-8 relative  rounded-3xl shadow-2xl max-w-lg w-full mx-auto',
            authResult.isReal
              ? 'bg-gradient-to-br from-neutral-900 from-50% to-green-900'
              : 'bg-gradient-to-br from-neutral-900 from-50% to-red-900'
          )}
        >
          <div className="text-neutral-400 flex flex-col items-start justify-between w-full gap-4">
            <h2 className="text-2xl font-medium text-white tracking-tight">
              Live Detection
            </h2>
            {authResult.isReal !== undefined && (
              <p className="text-white">
                Is Real: {authResult.isReal ? 'Yes' : 'No'}
              </p>
            )}
            {authResult.antispoofScore !== undefined && (
              <p className="text-white">
                Antispoof Score: {authResult.antispoofScore}
              </p>
            )}
            {/* {authResult.confidence !== undefined && (
              <p className="text-white">Confidence: {authResult.confidence}</p>
            )} */}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-8 p-4 md:p-8 relative  bg-gradient-to-br from-neutral-900 from-50% to-red-900 rounded-3xl shadow-2xl max-w-lg w-full mx-auto">
          <div className=" text-neutral-400 flex flex-col items-start justify-between w-full gap-4">
            <h2 className="text-2xl font-medium  text-white tracking-tight">
              Authentication Failed
            </h2>
            <div className="bg-red-500 text-white px-4 py-1.5 rounded-full text-sm w-fit">
              {error}
            </div>
          </div>
          <div className="absolute bottom-4 right-4 z-10" onClick={handleRetry}>
            <p className="text-sm text-neutral-400 hover:text-white underline cursor-pointer transition-all">
              Retry
            </p>
          </div>
        </div>
      )}

      {authResult && authResult.success && authResult.user && (
        <div className="mt-8 p-4 relative md:p-8 bg-gradient-to-br from-neutral-900 from-50% to-green-900 rounded-3xl shadow-2xl max-w-lg w-full mx-auto">
          <div className=" text-neutral-400 flex flex-col md:flex-row items-start md:items-end justify-between w-full mb-6 gap-4">
            <h2 className="text-2xl font-medium text-white tracking-tight">
              Authentication Successful
            </h2>
            <div className="bg-green-500 text-black px-4 py-1.5 rounded-full text-sm w-fit shadow-lg shadow-green-500/20">
              {(authResult.user.score * 100).toFixed(2)}% Match
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 w-full text-neutral-400 mt-6">
            {authResult.user && (
              <>
                <div className="flex flex-col">
                  <p className="text-sm">Name</p>
                  <p className="text-white">
                    {authResult.user.firstName} {authResult.user.lastName}
                  </p>
                </div>
                {authResult.user.id && (
                  <div className="flex flex-col">
                    <p className="text-sm">ID</p>
                    <p className="text-white">{authResult.user.id}</p>
                  </div>
                )}
                {authResult.user.email && (
                  <div className="flex flex-col">
                    <p className="text-sm">Email</p>
                    <p className="text-white">{authResult.user.email}</p>
                  </div>
                )}
                {authResult.user.phone && (
                  <div className="flex flex-col">
                    <p className="text-sm">Phone</p>
                    <p className="text-white">{authResult.user.phone}</p>
                  </div>
                )}
                {authResult.user.age && (
                  <div className="flex flex-col">
                    <p className="text-sm">Age</p>
                    <p className="text-white">{authResult.user.age}</p>
                  </div>
                )}
                {authResult.user.gender && (
                  <div className="flex flex-col">
                    <p className="text-sm">Gender</p>
                    <p className="text-white">{authResult.user.gender}</p>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="absolute bottom-4 right-4 z-10" onClick={handleRetry}>
            <p className="text-sm text-neutral-400 hover:text-white underline cursor-pointer transition-all">
              Retry
            </p>
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
