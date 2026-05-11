'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CEUploadProps {
  onUploadComplete?: () => void;
}

export default function CEUpload({ onUploadComplete }: CEUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionResult, setExtractionResult] = useState<any>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [manualEdit, setManualEdit] = useState({
    title: '',
    provider: '',
    dateCompleted: '',
    hours: '',
    category: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const processFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    setExtractionResult(null);
    setConfidence(null);

    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      // Call the OCR API route
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/ocr/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process certificate');
      }

      const result = await response.json();

      if (result.success && result.data) {
        setExtractionResult(result.data);
        setConfidence(result.confidence);
        
        // Pre-populate manual edit form
        setManualEdit({
          title: result.data.title || '',
          provider: result.data.provider || '',
          dateCompleted: result.data.dateCompleted ? result.data.dateCompleted.split('T')[0] : '',
          hours: result.data.hours ? result.data.hours.toString() : '',
          category: result.data.category || '',
        });
      } else {
        console.error('OCR processing failed:', result.error);
        alert('Failed to process the certificate. Please try again.');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      alert('An error occurred while processing the file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const saveCECredit = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }

      // Get the user's license
      const { data: licenses } = await supabase
        .from('licenses')
        .select('id')
        .eq('profile_id', session.user.id)
        .limit(1);

      if (!licenses || licenses.length === 0) {
        throw new Error('No license found for user');
      }

      const { error } = await supabase
        .from('ce_credits')
        .insert([{
          profile_id: session.user.id,
          license_id: licenses[0].id,
          title: manualEdit.title,
          provider: manualEdit.provider,
          date_completed: manualEdit.dateCompleted,
          hours: parseFloat(manualEdit.hours) || 0,
          category: manualEdit.category,
          ocr_confidence: confidence,
          verified: true,
        }]);

      if (error) {
        throw error;
      }

      alert('CE Credit saved successfully!');
      if (onUploadComplete) onUploadComplete();
      
      // Reset form
      setFile(null);
      setExtractionResult(null);
      setConfidence(null);
      setManualEdit({
        title: '',
        provider: '',
        dateCompleted: '',
        hours: '',
        category: '',
      });
    } catch (error) {
      console.error('Error saving CE credit:', error);
      alert('Failed to save CE credit. Please try again.');
    }
  };

  const handleManualEditChange = (field: keyof typeof manualEdit, value: string) => {
    setManualEdit(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload CE Certificate</CardTitle>
        <CardDescription>Upload your continuing education certificate to automatically extract details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          
          {file && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{file.name}</span>
              <Button onClick={processFile} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Process Certificate'}
              </Button>
            </div>
          )}
        </div>

        {extractionResult && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-medium mb-2">Extracted Information</h3>
            
            {confidence !== null && (
              <div className="mb-3">
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                  confidence > 80 ? 'bg-green-100 text-green-800' :
                  confidence > 60 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  Confidence: {confidence}%
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block">Title</label>
                <input
                  type="text"
                  value={manualEdit.title}
                  onChange={(e) => handleManualEditChange('title', e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-500 block">Provider</label>
                <input
                  type="text"
                  value={manualEdit.provider}
                  onChange={(e) => handleManualEditChange('provider', e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-500 block">Date Completed</label>
                <input
                  type="date"
                  value={manualEdit.dateCompleted}
                  onChange={(e) => handleManualEditChange('dateCompleted', e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-500 block">Hours</label>
                <input
                  type="number"
                  step="0.1"
                  value={manualEdit.hours}
                  onChange={(e) => handleManualEditChange('hours', e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="text-xs text-gray-500 block">Category</label>
                <input
                  type="text"
                  value={manualEdit.category}
                  onChange={(e) => handleManualEditChange('category', e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                />
              </div>
            </div>

            <Button 
              onClick={saveCECredit} 
              className="mt-4 w-full"
              disabled={!manualEdit.title || !manualEdit.provider || !manualEdit.dateCompleted || !manualEdit.hours}
            >
              Save CE Credit
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
