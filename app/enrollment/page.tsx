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
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EnrollmentPage() {
  const [capturedFrames, setCapturedFrames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      // router.push('/enrollment/success');
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

  const handleRetry = () => {
    setCapturedFrames([]);
    form.reset();
    setSuccess(null);
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
          setCapturedFrames={setCapturedFrames}
          isLoading={isLoading}
          capturedFrames={capturedFrames}
          error={error}
          success={success}
        />
        {!success ? (
          <EnterDataUI
            form={form}
            onSubmit={onSubmit}
            isLoading={isLoading}
            capturedFrames={capturedFrames}
          />
        ) : (
          <div className="mt-8 p-4 relative md:p-8 bg-gradient-to-br from-neutral-900 from-50% to-green-900 rounded-3xl shadow-2xl max-w-lg w-full mx-auto">
            <div className=" text-neutral-400 flex flex-col md:flex-row items-start md:items-end justify-between w-full mb-6 gap-4">
              <h2 className="text-2xl font-medium text-white tracking-tight">
                Enrollment Successful
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-6 w-full text-neutral-400 mt-6">
              <div className="flex flex-col">
                <p className="text-sm">Name</p>
                <p className="text-white">
                  {form.getValues('firstName')} {form.getValues('lastName')}
                </p>
              </div>
              {form.getValues('id') && (
                <div className="flex flex-col">
                  <p className="text-sm">ID</p>
                  <p className="text-white">{form.getValues('id')}</p>
                </div>
              )}
              {form.getValues('email') && (
                <div className="flex flex-col">
                  <p className="text-sm">Email</p>
                  <p className="text-white">{form.getValues('email')}</p>
                </div>
              )}
              {form.getValues('phone') && (
                <div className="flex flex-col">
                  <p className="text-sm">Phone</p>
                  <p className="text-white">{form.getValues('phone')}</p>
                </div>
              )}
              {(form.getValues('age') ?? 0) > 0 && (
                <div className="flex flex-col">
                  <p className="text-sm">Age</p>
                  <p className="text-white">{form.getValues('age')}</p>
                </div>
              )}
              {form.getValues('gender') && (
                <div className="flex flex-col">
                  <p className="text-sm">Gender</p>
                  <p className="text-white">{form.getValues('gender')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {error && <ErrorAlert error={error} />}
      </div>
      <div className="flex flex-row gap-8  absolute bottom-8 z-10">
        {success && (
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
