/**
 * OCR Service Facade
 * Provides a unified interface for OCR operations with error handling and logging
 */

import type { OcrProvider, OcrResult, OcrImageInput } from './types';
import { googleVisionProvider } from './google-vision-provider';
import { getConfidenceStatus, formatConfidenceScore } from './types';

/**
 * Main OCR service class
 * Manages provider selection and fallback strategies
 */
export class OcrService {
  private primaryProvider: OcrProvider;
  private fallbackProvider: OcrProvider | null = null;

  constructor(primaryProvider: OcrProvider = googleVisionProvider) {
    this.primaryProvider = primaryProvider;
  }

  /**
   * Process an image with automatic fallback to manual entry if needed
   */
  async processCertificate(image: OcrImageInput): Promise<OcrResult> {
    // Validate input
    if (!this.validateImageInput(image)) {
      return {
        success: false,
        fields: [],
        overallConfidence: 0,
        rawText: '',
        error: 'Invalid image input',
        processingTimeMs: 0,
      };
    }

    // Try primary provider
    let result = await this.primaryProvider.processImage(image);

    // If primary fails and fallback is available, try fallback
    if (!result.success && this.fallbackProvider) {
      console.log('Primary OCR failed, attempting fallback provider');
      result = await this.fallbackProvider.processImage(image);
    }

    // Log result with confidence score (no PII)
    this.logOcrResult(result, image.filename);

    return result;
  }

  /**
   * Check if OCR service is available
   */
  isAvailable(): boolean {
    return this.primaryProvider.isConfigured();
  }

  /**
   * Get confidence status for UI display
   */
  getConfidenceDisplay(confidence: number): {
    status: 'high' | 'medium' | 'low' | 'failed';
    percentage: string;
    requiresReview: boolean;
  } {
    const status = getConfidenceStatus(confidence);
    return {
      status,
      percentage: formatConfidenceScore(confidence),
      requiresReview: confidence < 0.85,
    };
  }

  /**
   * Validate image input format
   */
  private validateImageInput(image: OcrImageInput): boolean {
    if (!image.base64Data || typeof image.base64Data !== 'string') {
      return false;
    }

    if (!image.mimeType || !/^image\/(jpeg|png|gif|webp)$/.test(image.mimeType)) {
      return false;
    }

    // Check size (max 10MB)
    const sizeInBytes = Math.ceil((image.base64Data.length * 3) / 4);
    if (sizeInBytes > 10 * 1024 * 1024) {
      return false;
    }

    return true;
  }

  /**
   * Log OCR results for monitoring (without PII)
   */
  private logOcrResult(result: OcrResult, filename?: string): void {
    const logData = {
      timestamp: new Date().toISOString(),
      filename: filename || 'unknown',
      success: result.success,
      fieldCount: result.fields.length,
      overallConfidence: result.overallConfidence,
      processingTimeMs: result.processingTimeMs,
      hasError: !!result.error,
    };

    // In production, send to monitoring service
    console.log('OCR Processing Complete:', JSON.stringify(logData));
  }
}

/**
 * Singleton OCR service instance
 */
export const ocrService = new OcrService();
