import { NextResponse } from 'next/server';
import axios from 'axios';

const AWS_BACKEND_URL =
  process.env.AWS_BACKEND_URL || 'http://34.229.123.10:5000/';
// const AWS_BACKEND_URL = 'http://34.229.123.10:5000/';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    console.log(formData);

    if (!AWS_BACKEND_URL) {
      throw new Error('AWS_BACKEND_URL is not defined');
    }

    const response = await axios.post(
      `${AWS_BACKEND_URL}/api/v1/enroll`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const data = response.data;
    console.log(data);

    if (response.status !== 200) {
      console.error('Enrollment failed:', data);
      return NextResponse.json(
        { error: data.error || 'Failed to enroll' }, // Use data.error to capture the specific error message
        { status: response.status }
      );
    }

    return NextResponse.json({ message: 'success' }); // Return a JSON object for consistency
  } catch (error) {
    console.error('Enrollment error:', error);

    // Type assertion to specify the error type
    const errorMessage =
      (error as any).response?.data?.error || 'Internal server error';

    return NextResponse.json(
      { error: errorMessage },
      { status: (error as any).response?.status || 500 }
    );
  }
}
