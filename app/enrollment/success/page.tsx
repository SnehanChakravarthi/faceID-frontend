import React from 'react';
import Link from 'next/link';
const EnrollmentSuccessPage = () => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-neutral-50 min-h-screen py-10 px-4">
      <h1 className="text-5xl font-semibold text-neutral-900 tracking-tight">
        Enrollment Successful
        <span className="block text-xl font-normal text-neutral-500">
          Your Face ID has been enrolled successfully
        </span>
      </h1>
      <div className="flex flex-col gap-4 max-w-md mx-auto mt-12">
        <Link
          className="w-full px-8 py-4 text-lg font-medium text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-all duration-200 shadow-sm"
          href="/enrollment"
        >
          Enroll Another Face
        </Link>

        <Link
          className="w-full px-8 py-4 text-lg font-medium text-blue-500 border border-blue-500 rounded-full hover:bg-blue-500 hover:text-white transition-all duration-200"
          href="/authentication"
        >
          Sign In with Face ID
        </Link>
      </div>
    </div>
  );
};

export default EnrollmentSuccessPage;
