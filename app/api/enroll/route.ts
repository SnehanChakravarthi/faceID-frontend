import { NextResponse } from 'next/server';

const AWS_BACKEND_URL = process.env.AWS_BACKEND_URL; // Add this to your .env file

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    console.log(formData);

    // const response = await fetch(`${AWS_BACKEND_URL}/enroll`, {
    //   method: 'POST',
    //   body: formData,
    //   headers: {
    //     // Add any necessary authentication headers here
    //     Authorization: `Bearer ${process.env.AWS_API_KEY}`,
    //   },
    // });

    // const data = await response.json();

    // if (!response.ok) {
    //   return NextResponse.json(
    //     { error: data.message || 'Failed to enroll' },
    //     { status: response.status }
    //   );
    // }

    return NextResponse.json({ message: 'Enrolled' });
  } catch (error) {
    console.error('Enrollment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
