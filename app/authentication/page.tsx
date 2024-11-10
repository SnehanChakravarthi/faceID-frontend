'use client';

import CaptureImageUI from '@/components/CaptureUI';
import ErrorAlert from '@/components/errorAlert';
import React, { useState, useEffect } from 'react';
import { compressImage } from '@/lib/utils';

const AuthenticationPage = () => {
  const [capturedFrames, setCapturedFrames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (capturedFrames.length > 0) {
      handleAuthentication();
    }
  }, [capturedFrames]);

  async function handleAuthentication() {
    setIsLoading(true);
    setError('');

    try {
      // Process images in chunks similar to enrollment
      const CHUNK_SIZE = 3;
      const imageChunks = [];

      for (let i = 0; i < capturedFrames.length; i += CHUNK_SIZE) {
        const chunk = capturedFrames.slice(i, i + CHUNK_SIZE);
        const processedChunk = await Promise.all(
          chunk.map(async (dataUrl, index) => {
            const compressedBlob = await compressImage(dataUrl);
            return new File([compressedBlob], `frame_${i + index}.jpg`, {
              type: 'image/jpeg',
            });
          })
        );
        imageChunks.push(...processedChunk);
      }

      const formData = new FormData();
      imageChunks.forEach((file) => {
        formData.append('images', file);
      });

      const response = await fetch('/api/authenticate', {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Authentication failed: ${response.status}`
        );
      }

      const result = await response.json();

      if (Array.isArray(result) && result[0]?.error) {
        setError(result[0].error);
        return;
      }

      // Handle successful authentication
      console.log('Authentication successful:', result);
      // You might want to redirect or update UI state here
    } catch (error) {
      console.error('Authentication error:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Authentication failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-neutral-50 min-h-screen py-10 px-4">
      <div className="flex flex-col items-start max-w-lg w-full gap-8">
        <h1 className="text-5xl font-semibold text-neutral-900 tracking-tight">
          Face ID Authentication
          <span className="block text-xl font-normal text-neutral-500">
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

      {error && <ErrorAlert error={error} />}
    </div>
  );
};

export default AuthenticationPage;
