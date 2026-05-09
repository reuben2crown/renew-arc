/**
 * Google Vision API OCR Provider Implementation
 * Implements the OcrProvider contract using Google Cloud Vision
 */

import { google } from 'googleapis';
import type { OcrProvider, OcrResult, OcrImageInput, OcrField } from './types';
import { CE_CERTIFICATE_FIELDS } from './types';

export class GoogleVisionOcrProvider implements OcrProvider {
  private vision: any;
  private isConfiguredFlag: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize Google Vision client
   */
  private async initialize(): Promise<void> {
    try {
      const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      const projectId = process.env.GOOGLE_PROJECT_ID;

      if (!credentialsPath || !projectId) {
        console.warn('Google Vision API not configured - missing environment variables');
        this.isConfiguredFlag = false;
        return;
      }

      // Initialize Vision API
      this.vision = google.cloud.vision({
        version: 'v1',
        // Note: In production, use ADC or service account key
      });

      this.isConfiguredFlag = true;
    } catch (error) {
      console.error('Failed to initialize Google Vision API:', error);
      this.isConfiguredFlag = false;
    }
  }

  /**
   * Check if provider is properly configured
   */
  isConfigured(): boolean {
    return this.isConfiguredFlag;
  }

  /**
   * Process an image and extract CE certificate fields
   */
  async processImage(image: OcrImageInput): Promise<OcrResult> {
    const startTime = Date.now();

    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          fields: [],
          overallConfidence: 0,
          rawText: '',
          error: 'OCR provider not configured',
          processingTimeMs: Date.now() - startTime,
        };
      }

      // Remove data URL prefix if present
      const base64Data = image.base64Data.replace(/^data:image\/\w+;base64,/, '');

      // Call Google Vision API for document text detection
      const response = await this.vision.images.annotate({
        requestBody: {
          requests: [
            {
              image: {
                content: base64Data,
              },
              features: [
                {
                  type: 'DOCUMENT_TEXT_DETECTION',
                },
                {
                  type: 'TEXT_DETECTION',
                },
              ],
            },
          ],
        },
      });

      const annotations = response.data.responses[0];
      
      if (!annotations) {
        return {
          success: false,
          fields: [],
          overallConfidence: 0,
          rawText: '',
          error: 'No OCR response received',
          processingTimeMs: Date.now() - startTime,
        };
      }

      // Extract full text annotation
      const fullText = annotations.fullTextAnnotation?.text || '';
      const textAnnotations = annotations.textAnnotations || [];

      // Parse fields from extracted text
      const fields = this.parseCertificateFields(fullText, textAnnotations);

      // Calculate overall confidence
      const overallConfidence = fields.length > 0
        ? fields.reduce((sum, f) => sum + f.confidence, 0) / fields.length
        : 0;

      return {
        success: fields.length > 0,
        fields,
        overallConfidence,
        rawText: fullText,
        processingTimeMs: Date.now() - startTime,
      };
    } catch (error) {
      console.error('Google Vision OCR error:', error);
      return {
        success: false,
        fields: [],
        overallConfidence: 0,
        rawText: '',
        error: error instanceof Error ? error.message : 'Unknown OCR error',
        processingTimeMs: Date.now() - startTime,
      };
    }
  }

  /**
   * Parse certificate fields from extracted text
   * Uses pattern matching and heuristics to identify fields
   */
  private parseCertificateFields(fullText: string, annotations: any[]): OcrField[] {
    const fields: OcrField[] = [];
    const lines = fullText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    // Helper to find field by pattern
    const findField = (patterns: RegExp[], fieldName: string): OcrField | null => {
      for (const line of lines) {
        for (const pattern of patterns) {
          const match = line.match(pattern);
          if (match) {
            return {
              name: fieldName,
              value: match[1] || match[0],
              confidence: 0.75, // Base confidence for pattern matches
            };
          }
        }
      }
      return null;
    };

    // Provider Name patterns
    const providerPatterns = [
      /provider[:\s]+(.+)/i,
      /presented by[:\s]+(.+)/i,
      /offered by[:\s]+(.+)/i,
      /organization[:\s]+(.+)/i,
    ];
    const provider = findField(providerPatterns, 'provider_name');
    if (provider) fields.push(provider);

    // Course Title patterns
    const titlePatterns = [
      /title[:\s]+(.+)/i,
      /course[:\s]+(.+)/i,
      /program[:\s]+(.+)/i,
      /training[:\s]+(.+)/i,
    ];
    const title = findField(titlePatterns, 'course_title');
    if (title) fields.push(title);

    // Hours patterns
    const hoursPatterns = [
      /hours[:\s]+(\d+(?:\.\d+)?)/i,
      /credits[:\s]+(\d+(?:\.\d+)?)/i,
      /ceu[:\s]+(\d+(?:\.\d+)?)/i,
      /^(\d+(?:\.\d+)?)\s*(?:hours?|credits?|ceu)/i,
    ];
    const hours = findField(hoursPatterns, 'hours');
    if (hours) fields.push(hours);

    // Completion Date patterns
    const datePatterns = [
      /completed[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /date[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /issued[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
    ];
    const date = findField(datePatterns, 'completion_date');
    if (date) fields.push(date);

    // Category/Ethics patterns
    const categoryPatterns = [
      /(ethics)/i,
      /(core)/i,
      /(elective)/i,
    ];
    const category = findField(categoryPatterns, 'category');
    if (category) fields.push(category);

    // If no structured fields found, try to extract from first few lines
    if (fields.length === 0 && lines.length > 0) {
      // Assume first non-empty line might be provider or title
      fields.push({
        name: 'course_title',
        value: lines[0].substring(0, 100),
        confidence: 0.40,
      });
    }

    return fields;
  }
}

/**
 * Singleton instance of Google Vision OCR provider
 */
export const googleVisionProvider = new GoogleVisionOcrProvider();
