import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GoogleVisionProvider } from '@/lib/ocr/google-vision-provider';

// Mock fetch globally
global.fetch = vi.fn();

describe('GoogleVisionProvider', () => {
  let provider: GoogleVisionProvider;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    provider = new GoogleVisionProvider(mockApiKey);
    vi.clearAllMocks();
  });

  it('should successfully extract CE info from image with high confidence', async () => {
    const mockImageData = Buffer.from('fake-image-data');
    const mockResponse = {
      ok: true,
      json: async () => ({
        responses: [{
          fullTextAnnotation: {
            text: 'Title: Advanced Counseling Techniques\nProvider: APA Institute\nDate: 01/15/2024\nHours: 6.0'
          }
        }]
      })
    };

    (fetch as any).mockResolvedValueOnce(mockResponse);

    const result = await provider.extractCEInfo(mockImageData);

    expect(result.success).toBe(true);
    expect(result.confidence).toBeGreaterThan(70);
    expect(result.data?.title).toContain('Advanced Counseling');
    expect(result.data?.provider).toContain('APA');
    expect(result.data?.hours).toBe(6.0);
  });

  it('should return low confidence when few fields are extracted', async () => {
    const mockImageData = Buffer.from('fake-image-data');
    const mockResponse = {
      ok: true,
      json: async () => ({
        responses: [{
          fullTextAnnotation: {
            text: 'Some random text without clear structure'
          }
        }]
      })
    };

    (fetch as any).mockResolvedValueOnce(mockResponse);

    const result = await provider.extractCEInfo(mockImageData);

    expect(result.success).toBe(true);
    expect(result.confidence).toBeLessThan(50);
  });

  it('should handle API errors gracefully', async () => {
    const mockImageData = Buffer.from('fake-image-data');
    const mockResponse = {
      ok: false,
      status: 500
    };

    (fetch as any).mockResolvedValueOnce(mockResponse);

    const result = await provider.extractCEInfo(mockImageData);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('OCR_ERROR');
    expect(result.confidence).toBe(0);
  });

  it('should handle network errors gracefully', async () => {
    const mockImageData = Buffer.from('fake-image-data');
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const result = await provider.extractCEInfo(mockImageData);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('OCR_ERROR');
  });
});
