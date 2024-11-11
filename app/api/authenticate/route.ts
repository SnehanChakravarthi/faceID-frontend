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
      `${AWS_BACKEND_URL}/api/v1/authenticate`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const data = response.data;
    console.dir(data, { depth: 3 });

    // If the response is successful
    if (data.success) {
      const firstMatch = data.data.matches?.[0];
      const similarityScore = firstMatch?.score || 0;

      // Check if similarity score meets the threshold (90%)
      if (similarityScore >= 0.7) {
        return NextResponse.json(
          {
            success: true,
            message: data.message,
            matches: data.data.matches,
            user: firstMatch
              ? {
                  firstName: firstMatch.metadata.firstName,
                  lastName: firstMatch.metadata.lastName,
                  similarityScore: firstMatch.score,
                  ...firstMatch.metadata,
                }
              : null,
          },
          { status: 200 }
        );
      }

      // If similarity score is below threshold, return as authentication failure
      return NextResponse.json(
        {
          success: false,
          message: 'No match found',
          similarityScore: similarityScore,
        },
        { status: 401 }
      );
    }
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
