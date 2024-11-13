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
    if (data.success) {
      const matches = data.data.matches || [];
      const bestMatch = matches.reduce(
        (prev: AuthenticationMatch, current: AuthenticationMatch) =>
          prev.score > current.score ? prev : current,
        { score: 0 } as AuthenticationMatch
      );

      // Check if the best match similarity score meets the threshold (90%)
      if (bestMatch.score >= 0.7) {
        return NextResponse.json(
          {
            success: true,
            message: data.message,
            user: {
              firstName: bestMatch.metadata.firstName,
              lastName: bestMatch.metadata.lastName,
              score: bestMatch.score,
              ...bestMatch.metadata,
            },
            isReal: data.data.is_real,
            antispoofScore: parseFloat(data.data.antispoof_score.toFixed(2)),
            confidence: data.data.confidence,
          },
          { status: 200 }
        );
      }

      // If no match meets the threshold, return as authentication failure
      return NextResponse.json(
        {
          success: false,
          message: 'No match found',
          similarityScore: bestMatch.score,
        },
        { status: 401 }
      );
    }

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
