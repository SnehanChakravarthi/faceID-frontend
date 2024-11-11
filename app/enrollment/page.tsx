'use client';

import CaptureImageUI from '@/components/CaptureUI';
import EnterDataUI from '@/components/EnterDataUI';
import ErrorAlert from '@/components/errorAlert';
import { compressImage } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { formSchema } from '@/lib/schema';

export default function EnrollmentPage() {
  const [capturedFrames, setCapturedFrames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

      const endTime = performance.now(); // Stop the timer
      console.log(`Request took ${endTime - startTime} milliseconds.`); // Log the time taken

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Server error: ${response.status}`);
      }

      const result = await response.json();

      if (Array.isArray(result) && result[0]?.error) {
        setError(result[0].error);
        return;
      }

      console.log('Enrollment successful:', result);
      setSuccess(true);
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

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-neutral-50 min-h-screen py-10 px-4">
      <div className="flex flex-col items-start max-w-lg w-full gap-8">
        <h1 className="text-5xl font-semibold text-neutral-900 tracking-tight">
          Face ID Enrollment
          <span className="block text-xl font-normal text-neutral-500">
            Quick and secure registration
          </span>
        </h1>
        <CaptureImageUI
          setCapturedFrames={setCapturedFrames}
          isLoading={isLoading}
          capturedFrames={capturedFrames}
        />
        <EnterDataUI
          form={form}
          onSubmit={onSubmit}
          isLoading={isLoading}
          capturedFrames={capturedFrames}
        />
      </div>

      {error && <ErrorAlert error={error} />}
    </div>
  );
}
