import Link from 'next/link';

export default function Home() {
  return (
    <div className="h-dvh w-full flex flex-col items-center justify-center bg-neutral-50 max-h-dvh">
      <div className="max-w-2xl w-full text-center space-y-12 p-12">
        <h1 className=" text-4xl md:text-5xl font-semibold text-neutral-900 tracking-tight">
          Facial Recognition
          <span className="block text-2xl font-normal md:mt-2 text-neutral-500">
            Seamless. Secure. Simple.
          </span>
        </h1>

        <p className="text-xl text-neutral-500 md:leading-normal leading-snug max-w-xl mx-auto ">
          Experience the next generation of identity verification with our
          state‑of‑the‑art facial recognition system.
        </p>

        <div className="flex flex-col gap-4 max-w-md mx-auto">
          <Link
            className="w-full px-4 py-3 text-lg font-medium text-white bg-green-500 rounded-full hover:bg-green-600 transition-all duration-200 shadow-sm"
            href="/enrollment"
          >
            Enroll Now
          </Link>

          <Link
            className="w-full px-4 py-3 text-lg font-medium text-green-500 border border-green-500 rounded-full hover:bg-green-500 hover:text-white transition-all duration-200"
            href="/authentication"
          >
            Sign In with Face ID
          </Link>
        </div>

        <p className="text-sm text-neutral-405 max-w-md mx-auto leading-relaxed">
          New to facial recognition? Start with enrollment to set up your
          profile. Already enrolled? Use Face ID to instantly verify your
          identity.
        </p>
      </div>
    </div>
  );
}
