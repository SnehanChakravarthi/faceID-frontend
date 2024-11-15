import { NextResponse } from 'next/server';
import axios from 'axios';

interface Metadata {
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  email: string;
  phone: string;
  id: string;
  timestamp: number;
  embedding_number?: number;
}

interface SparseValues {
  indices: any[];
  values: any[];
}

interface AuthenticationMatch {
  id: string;
  score: number;
  metadata: Metadata;
  sparse_values: SparseValues;
  values: any[];
}

const AWS_BACKEND_URL =
  process.env.AWS_BACKEND_URL || 'http://3.234.226.80:5000/';
// const AWS_BACKEND_URL = 'http://34.229.123.10:5000/';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    console.log(formData);

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
      }
    );

    const data = response.data;
    console.dir(data, { depth: 4 });

    // If the response is successful
    // If authentication is successful
    if (data.success && data.match) {
      return NextResponse.json(
        {
          success: true,
          message: data.message,
          user: {
            firstName: data.match.metadata.firstName,
            lastName: data.match.metadata.lastName,
            score: data.match.score,
            ...data.match.metadata,
          },
          isReal: data.details.anti_spoofing.is_real,
          antispoofScore: parseFloat(
            data.details.anti_spoofing.antispoof_score.toFixed(2)
          ),
          confidence: data.details.anti_spoofing.confidence,
        },
        { status: 200 }
      );
    }

    // If no match meets the threshold, return as authentication failure
    // If no match is found or authentication fails
    return NextResponse.json(
      {
        success: false,
        message: data.message || data.error?.error || 'Authentication failed',
        similarityScore: data.details?.similarity_score || null,
      },
      { status: 401 }
    );

    // If similarity score is below threshold, return as authentication failure
  } catch (error) {
    console.error('Authentication error:', error);

    // Handle different types of errors
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status || 500;
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Authentication failed';
      const errorDetails = error.response?.data || {};

      return NextResponse.json(
        {
          success: false,
          message: errorMessage,
          error: errorDetails,
          code: error.code,
        },
        { status: statusCode }
      );
    }

    // Generic error handling
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
