import { z } from 'zod';

export const formSchema = z.object({
  id: z.string().optional(),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name cannot exceed 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name cannot exceed 50 characters'),
  age: z.number().optional(),
  gender: z.string().optional(),
  email: z
    .union([
      z.string().email('Please enter a valid email address'),
      z.string().length(0),
    ])
    .optional(),
  phone: z
    .union([
      z
        .string()
        .regex(/^[0-9+]+$/, 'Phone number can only contain + and numbers'),
      z.string().length(0),
    ])
    .optional(),
});

export enum EnrollmentCode {
  SUCCESS = 0,
  FUNCTION_ERROR = 1,
  NO_FACE_DETECTED = 2,
  MULTIPLE_FACES_DETECTED = 3,
  SPOOFING_DETECTED = 4,
  STORAGE_ERROR = 5,
  UNEXPECTED_ERROR = 6,
}

export enum AuthenticateCode {
  SUCCESS = 0,
  FUNCTION_ERROR = 1,
  NO_FACE_DETECTED = 2,
  MULTIPLE_FACES_DETECTED = 3,
  SPOOFING_DETECTED = 4,
  NO_MATCH = 5,
  BELOW_THRESHOLD = 6,
  UNEXPECTED_ERROR = 7,
}

// Interface for processing times
interface ProcessingTimesEnrollment {
  total: number;
  face_processing: number | null;
  database_storage: number | null;
}

// Interface for processing times
interface ProcessingTimesAuthenticate {
  total: number;
  face_processing: number | null;
  vector_search: number | null;
}

// Interface for anti-spoofing details
interface AntiSpoofing {
  is_real: boolean;
  antispoof_score: number;
  confidence: number;
}

// Interface for match metadata
interface MatchMetadata {
  id: string;
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  email: string;
  phone: string;
  timestamp: number;
  embedding_number: number;
  total_embeddings: number;
}

// Interface for match details
interface Match {
  id: string;
  score: number;
  metadata: MatchMetadata;
}

// Interface for response details
interface ResponseDetailsEnrollment {
  processing_times: ProcessingTimesEnrollment;
  error_type?: 'validation' | 'runtime' | 'unexpected';
}

// Interface for response details
interface ResponseDetailsAuthenticate {
  processing_times: ProcessingTimesAuthenticate;
  error_type?: 'validation' | 'runtime' | 'unexpected';
}

// Main response interface
export interface EnrollmentResponse {
  code: EnrollmentCode;
  message: string;
  anti_spoofing: AntiSpoofing | null;
  details: ResponseDetailsEnrollment | null;
}

// Main response interface
export interface AuthenticateResponse {
  code: AuthenticateCode;
  message: string;
  match: Match | null;
  similarity_score: number | null;
  anti_spoofing: AntiSpoofing | null;
  details: ResponseDetailsAuthenticate | null;
}
