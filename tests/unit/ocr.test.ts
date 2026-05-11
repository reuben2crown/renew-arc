import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GoogleVisionProvider } from '../../lib/ocr/google-vision-provider';

describe('GoogleVisionProvider', () => {
  let provider: GoogleVisionProvider;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    provider = new GoogleVisionProvider(mockApiKey);
    vi.clearAllMocks();
  });

  describe('extractCEInfo', () => {
    it('should return success with extracted data when OCR succeeds', async () => {
      // Mock fetch response
      const mockText = 'Title: Advanced Therapy Techniques\nProvider: CE Institute\nDate: 01/15/2024\nHours: 3.5';
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          responses: [{
            fullTextAnnotation: {
              text: mockText,
            },
          }],
        }),
      });

      const imageData = Buffer.from('fake-image-data');
      const result = await provider.extractCEInfo(imageData);

      expect(result.success).toBe(true);
      expect(result.data?.title).toContain('Advanced Therapy Techniques');
      expect(result.data?.provider).toContain('CE Institute');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should return error when API call fails', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const imageData = Buffer.from('fake-image-data');
      const result = await provider.extractCEInfo(imageData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.confidence).toBe(0);
    });

    it('should return error when no text is detected', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          responses: [{}],
        }),
      });

      const imageData = Buffer.from('fake-image-data');
      const result = await provider.extractCEInfo(imageData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NO_TEXT_DETECTED');
      expect(result.confidence).toBe(0);
    });

    it('should calculate confidence based on fields extracted', async () => {
      const mockText = 'Title: Test Course\nProvider: Test Provider';
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          responses: [{
            fullTextAnnotation: {
              text: mockText,
            },
          }],
        }),
      });

      const imageData = Buffer.from('fake-image-data');
      const result = await provider.extractCEInfo(imageData);

      expect(result.success).toBe(true);
      expect(result.confidence).toBeLessThanOrEqual(100);
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe('parseCertificateText', () => {
    it('should extract title from various formats', async () => {
      const testCases = [
        { input: 'Title: Advanced Therapy', expected: 'Advanced Therapy' },
        { input: 'Course: Ethics in Counseling', expected: 'Ethics in Counseling' },
        { input: 'Program: Trauma-Informed Care', expected: 'Trauma-Informed Care' },
      ];

      for (const { input, expected } of testCases) {
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            responses: [{
              fullTextAnnotation: { text: input },
            }],
          }),
        });

        const result = await provider.extractCEInfo(Buffer.from('fake'));
        expect(result.data?.title).toBe(expected);
      }
    });

    it('should extract hours in various formats', async () => {
      const testCases = [
        { input: '3 hours', expected: 3 },
        { input: '2.5 hrs', expected: 2.5 },
        { input: '6 CREDIT HOURS', expected: 6 },
        { input: '1.5 credits', expected: 1.5 },
      ];

      for (const { input, expected } of testCases) {
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            responses: [{
              fullTextAnnotation: { text: input },
            }],
          }),
        });

        const result = await provider.extractCEInfo(Buffer.from('fake'));
        expect(result.data?.hours).toBe(expected);
      }
    });

    it('should extract dates in multiple formats', async () => {
      const testCases = [
        '01/15/2024',
        '01-15-2024',
        '2024-01-15',
      ];

      for (const dateStr of testCases) {
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            responses: [{
              fullTextAnnotation: { text: `Completed: ${dateStr}` },
            }],
          }),
        });

        const result = await provider.extractCEInfo(Buffer.from('fake'));
        expect(result.data?.dateCompleted).toBeDefined();
      }
    });
  });
});
