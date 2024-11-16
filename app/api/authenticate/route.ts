import { NextResponse } from 'next/server';
import axios from 'axios';

const AWS_BACKEND_URL =
  process.env.AWS_BACKEND_URL || 'http://3.234.226.80:5000/';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    if (!AWS_BACKEND_URL) {
      throw new Error('AWS_BACKEND_URL is not defined');
    }

    const response = await axios.post(
      `${AWS_BACKEND_URL}/api/v1/authenticate`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000,
        validateStatus: (status) => status < 500,
      }
    );

    const data = response.data;

    console.dir(data, { depth: null });

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Authentication error:', error);

    // Check if it's an Axios error
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const errorMessage = error.response?.data?.message || error.message;

      let errorCode = 'INTERNAL_ERROR';
      if (error.code === 'ECONNABORTED') errorCode = 'TIMEOUT_ERROR';
      else if (!error.response) errorCode = 'NETWORK_ERROR';
      else if (status === 404) errorCode = 'NOT_FOUND';
      else if (status === 401) errorCode = 'UNAUTHORIZED';
      else if (status === 403) errorCode = 'FORBIDDEN';

      return NextResponse.json(
        {
          message: 'Authentication failed',
          details: {
            errorCode,
            errorMessage,
            timestamp: new Date().toISOString(),
          },
        },
        { status }
      );
    }

    // Handle non-Axios errors
    return NextResponse.json(
      {
        message: 'Internal server error',
        details: {
          errorCode: 'INTERNAL_ERROR',
          errorMessage:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
