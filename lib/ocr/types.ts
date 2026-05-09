/**
 * OCR Service Contract Interface
 * Defines the contract for OCR providers (Google Vision, etc.)
 * Ensures interchangeable implementations with consistent error handling
 */

/**
 * Represents a detected text field from OCR processing
 */
export interface OcrField {
  /** Field name (e.g., 'provider_name', 'course_title', 'hours', 'completion_date') */
  name: string;
  /** Extracted value */
  value: string;
  /** Confidence score 0-1 */
  confidence: number;
}

/**
 * Complete OCR extraction result
 */
export interface OcrResult {
  /** Whether extraction was successful */
  success: boolean;
  /** Extracted fields */
  fields: OcrField[];
  /** Overall confidence score (average of all fields) */
  overallConfidence: number;
  /** Raw extracted text for manual review */
  rawText: string;
  /** Error message if extraction failed */
  error?: string;
  /** Processing time in milliseconds */
  processingTimeMs: number;
}

/**
 * Image data for OCR processing
 */
export interface OcrImageInput {
  /** Base64-encoded image data */
  base64Data: string;
  /** MIME type (e.g., 'image/jpeg', 'image/png') */
  mimeType: string;
  /** Optional filename for logging */
  filename?: string;
}

/**
 * OCR Provider Contract
 * All OCR implementations must adhere to this interface
 */
export interface OcrProvider {
  /**
   * Process an image and extract CE certificate fields
   * @param image - Image data to process
   * @returns OCR extraction result with confidence scores
   */
  processImage(image: OcrImageInput): Promise<OcrResult>;
  
  /**
   * Validate that the provider is properly configured
   * @returns true if provider is ready to use
   */
  isConfigured(): boolean;
}

/**
 * Confidence threshold constants
 */
export const OCR_CONFIDENCE_THRESHOLDS = {
  /** Minimum confidence to auto-accept without review */
  AUTO_ACCEPT: 0.85,
  /** Minimum confidence to suggest auto-fill (requires review) */
  MINIMUM_ACCEPTABLE: 0.60,
  /** Below this threshold, mark as failed extraction */
  REJECTION: 0.40,
} as const;

/**
 * Fields we attempt to extract from CE certificates
 */
export const CE_CERTIFICATE_FIELDS = [
  'provider_name',
  'course_title',
  'hours',
  'completion_date',
  'category',
  'participant_name',
] as const;

/**
 * Get confidence status label based on score
 */
export function getConfidenceStatus(confidence: number): 'high' | 'medium' | 'low' | 'failed' {
  if (confidence >= OCR_CONFIDENCE_THRESHOLDS.AUTO_ACCEPT) {
    return 'high';
  }
  if (confidence >= OCR_CONFIDENCE_THRESHOLDS.MINIMUM_ACCEPTABLE) {
    return 'medium';
  }
  if (confidence >= OCR_CONFIDENCE_THRESHOLDS.REJECTION) {
    return 'low';
  }
  return 'failed';
}

/**
 * Format confidence score as percentage string
 */
export function formatConfidenceScore(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}
