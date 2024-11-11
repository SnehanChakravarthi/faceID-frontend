'use client';

import CaptureImageUI from '@/components/CaptureUI';
import ErrorAlert from '@/components/errorAlert';
import React, { useState, useEffect } from 'react';
import { compressImage } from '@/lib/utils';
import Link from 'next/link';

interface AuthenticationMatch {
  id: string;
  score: number; // Changed from similarityScore
  metadata: {
    firstName: string; // Moved to metadata
    lastName: string; // Moved to metadata
    age: string;
    gender: string;
    email: string;
    phone: string;
    embedding_number: number;
    id: string;
    timestamp: number;
  };
  sparse_values: {
    indices: any[];
    values: any[];
  };
  values: any[];
}

interface AuthenticationResponse {
  success: boolean;
  message: string;
  matches?: AuthenticationMatch[];
  user?: AuthenticationMatch;
  error?: string;
}

const AuthenticationPage = () => {
  const [capturedFrames, setCapturedFrames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [requestTime, setRequestTime] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [authResult, setAuthResult] = useState<AuthenticationMatch | null>(
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

      if (!response.ok) {
        throw new Error(
          result.error || `Authenticatssion failed: ${response.status}`
        );
      }

      const endTime = performance.now(); // Stop the timer
      setRequestTime(endTime - startTime);

      if (result.success && result.matches?.[0]) {
        // Use the first match from the matches array
        setAuthResult(result.matches[0]);
      } else {
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
    <div className="h-full w-full flex flex-col items-center justify-start pt-20 bg-neutral-50 min-h-screen py-10 px-4">
      <div className="flex flex-col items-start max-w-lg w-full gap-8">
        <h1 className="text-3xl md:text-5xl font-semibold text-neutral-900 tracking-tight">
          Face ID Authentication
          <span className="block text-base md:text-base font-normal text-neutral-500">
            Quick and secure authentication
          </span>
        </h1>
        <CaptureImageUI
          setCapturedFrames={setCapturedFrames}
          isLoading={isLoading}
          capturedFrames={capturedFrames}
          isAuthentication={true}
        />
      </div>

      {isLoading && (
        <div className="text-center p-4 mt-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Authenticating...</p>
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

      {authResult && (
        <div className="mt-8 p-4 relative md:p-8 bg-gradient-to-br from-neutral-900 from-50% to-sky-900 rounded-3xl shadow-2xl max-w-lg w-full mx-auto">
          <div className=" text-neutral-400 flex flex-col md:flex-row items-start md:items-end justify-between w-full mb-6 gap-4">
            <h2 className="text-2xl font-medium  text-white tracking-tight">
              Authentication Successful
            </h2>
            <div className="bg-blue-500 text-white px-4 py-1.5 rounded-full text-sm w-fit ">
              {(authResult.score * 100).toFixed(2)}% Match
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 w-full text-neutral-400 mt-6">
            <div className="flex flex-col">
              <p className="text-sm">Name</p>
              <p className="text-white">
                {authResult.metadata.firstName} {authResult.metadata.lastName}
              </p>
            </div>
            {authResult.metadata.id && (
              <div className="flex flex-col">
                <p className="text-sm">ID</p>
                <p className="text-white">{authResult.metadata.id}</p>
              </div>
            )}
            {authResult.metadata.email && (
              <div className="flex flex-col">
                <p className="text-sm">Email</p>
                <p className="text-white">{authResult.metadata.email}</p>
              </div>
            )}
            {authResult.metadata.phone && (
              <div className="flex flex-col">
                <p className="text-sm">Phone</p>
                <p className="text-white">{authResult.metadata.phone}</p>
              </div>
            )}
            {authResult.metadata.age && (
              <div className="flex flex-col">
                <p className="text-sm">Age</p>
                <p className="text-white">{authResult.metadata.age}</p>
              </div>
            )}
            {authResult.metadata.gender && (
              <div className="flex flex-col">
                <p className="text-sm">Gender</p>
                <p className="text-white">{authResult.metadata.gender}</p>
              </div>
            )}
          </div>
          <div className="absolute bottom-4 right-4 z-10" onClick={handleRetry}>
            <p className="text-sm text-neutral-400 hover:text-white underline cursor-pointer transition-all">
              Retry
            </p>
          </div>
        </div>
      )}

      {/* {error && <ErrorAlert error={error} />} */}
    </div>
  );
};

export default AuthenticationPage;
