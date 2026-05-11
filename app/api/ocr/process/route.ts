import { NextRequest, NextResponse } from 'next/server';

interface OCRExtractionResult {
  title?: string;
  provider?: string;
  dateCompleted?: string;
  hours?: number;
  category?: string;
}

interface OCRProcessingResponse {
  success: boolean;
  data?: OCRExtractionResult;
  error?: {
    message: string;
    code: string;
  };
  confidence: number;
}

/**
 * POST handler for processing CE certificate images with Google Vision OCR
 * Accepts multipart/form-data with a 'file' field
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'No file provided',
            code: 'NO_FILE',
          },
          confidence: 0,
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Call Google Vision API
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Image,
              },
              features: [
                {
                  type: 'TEXT_DETECTION',
                },
              ],
            },
          ],
        }),
      }
    );

    if (!visionResponse.ok) {
      throw new Error(`Google Vision API request failed: ${visionResponse.status}`);
    }

    const data = await visionResponse.json();

    if (!data.responses || data.responses.length === 0) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'No text detected in the image',
          code: 'NO_TEXT_DETECTED',
        },
        confidence: 0,
      });
    }

    const fullText = data.responses[0].fullTextAnnotation?.text || '';
    const parsedResult = parseCertificateText(fullText);

    return NextResponse.json(parsedResult);
  } catch (error) {
    console.error('Error processing OCR:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred during OCR',
        code: 'OCR_ERROR',
      },
      confidence: 0,
    });
  }
}

/**
 * Parse extracted text from CE certificate
 * Uses regex patterns to identify key fields
 */
function parseCertificateText(text: string): OCRProcessingResponse {
  // Clean up the text
  const cleanText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

  // Extract information using regex patterns
  const result: OCRExtractionResult = {};

  // Extract title/course name
  const titleMatch = cleanText.match(/(?:title|course|program|workshop|seminar):\s*([^\n\r.,;]+)/i);
  if (titleMatch) {
    result.title = titleMatch[1].trim();
  }

  // Extract provider name
  const providerMatch = cleanText.match(/(?:provider|organization|sponsored by|presented by):\s*([^\n\r.,;]+)/i);
  if (providerMatch) {
    result.provider = providerMatch[1].trim();
  }

  // Extract date (various formats)
  const datePattern = /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b|\b(\d{4}-\d{2}-\d{2})\b/;
  const dateMatch = cleanText.match(datePattern);
  if (dateMatch) {
    const dateStr = dateMatch[1] || dateMatch[2];
    const parsedDate = new Date(dateStr);
    if (!isNaN(parsedDate.getTime())) {
      result.dateCompleted = parsedDate.toISOString().split('T')[0];
    }
  }

  // Extract hours
  const hoursPattern = /(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|credit|credits|ceu|ceus)/i;
  const hoursMatch = cleanText.match(hoursPattern);
  if (hoursMatch) {
    const hours = parseFloat(hoursMatch[1]);
    if (!isNaN(hours)) {
      result.hours = hours;
    }
  }

  // Try to extract category/type
  const categoryPatterns = [
    /(?:category|type|area):\s*([^\n\r.,;]+)/i,
    /(ethics|cultural competence|trauma|assessment|diagnosis|treatment)/i,
  ];

  for (const pattern of categoryPatterns) {
    const categoryMatch = cleanText.match(pattern);
    if (categoryMatch) {
      result.category = categoryMatch[1]?.trim() || categoryMatch[0]?.trim();
      break;
    }
  }

  // Calculate confidence based on how many fields were extracted
  const fieldsFound = Object.keys(result).filter(
    (key) => result[key as keyof OCRExtractionResult] !== undefined
  ).length;
  const confidence = Math.min(100, fieldsFound * 25); // 25% per field

  return {
    success: true,
    data: result,
    confidence,
  };
}
