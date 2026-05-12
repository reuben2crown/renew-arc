import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    const supabase = createClient();

    // Fetch license and CE data
    const { data: licenses, error } = await supabase
      .from('licenses')
      .select('*, ce_credits(*)')
      .eq('profile_id', userId);

    if (error || !licenses || licenses.length === 0) {
      return NextResponse.json({ error: 'No license data found' }, { status: 404 });
    }

    // Generate PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { width, height } = page.getSize();
    
    // Header
    page.drawText('RenewPilot Audit Report', { x: 50, y: height - 50, size: 24, font });
    page.drawText(`Generated: ${new Date().toLocaleDateString()}`, { x: 50, y: height - 80, size: 12, font });
    
    let y = height - 120;
    
    licenses.forEach((license: any) => {
      if (y < 100) {
        page = pdfDoc.addPage([600, 800]);
        y = height - 50;
      }
      
      page.drawText(`License Number: ${license.license_number}`, { x: 50, y, size: 14, font });
      y -= 25;
      page.drawText(`State: ${license.state_id}`, { x: 50, y, size: 12, font });
      y -= 20;
      page.drawText(`Renewal Date: ${license.renewal_date}`, { x: 50, y, size: 12, font });
      y -= 20;
      page.drawText(`Required CE Hours: ${license.required_ce_hours}`, { x: 50, y, size: 12, font });
      y -= 25;
      
      const totalHours = license.ce_credits?.reduce((sum: number, c: any) => sum + parseFloat(c.hours), 0) || 0;
      page.drawText(`Total Logged CE Hours: ${totalHours}`, { x: 50, y, size: 14, font, color: rgb(0, 0.5, 0) });
      y -= 30;
      
      if (license.ce_credits && license.ce_credits.length > 0) {
        page.drawText('CE Credits Details:', { x: 50, y, size: 12, font, color: rgb(0, 0, 0.5) });
        y -= 20;
        
        license.ce_credits.forEach((credit: any) => {
          if (y < 50) {
            page = pdfDoc.addPage([600, 800]);
            y = height - 50;
          }
          page.drawText(`• ${credit.title} - ${credit.provider} (${credit.hours} hrs)`, { x: 70, y, size: 10, font });
          y -= 15;
        });
        y -= 20;
      }
      y -= 30;
    });

    const pdfBytes = await pdfDoc.save();
    
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="renewpilot-audit-report.pdf"',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
