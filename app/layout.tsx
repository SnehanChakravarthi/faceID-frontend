import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import Image from 'next/image';
import Link from 'next/link';
const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Face ID',
  description: 'Face ID Enrollment and Authentication',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* <head>
        <script
          src="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.js"
          crossOrigin="anonymous"
        ></script>
      </head> */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased  min-h-dvh w-screen h-full`}
      >
        <Link className="fixed top-4 left-4 z-10" href="/">
          <Image src="/logo.png" alt="Face ID" width={100} height={100} />
        </Link>
        {children}
      </body>
    </html>
  );
}
