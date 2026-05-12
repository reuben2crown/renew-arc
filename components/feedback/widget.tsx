'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FeedbackWidgetProps {
  userId: string;
}

/**
 * In-App Feedback Widget
 * Allows users to submit feedback, report bugs, or request support directly from the app.
 */
export default function FeedbackWidget({ userId }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'support'>('support');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call to your backend
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type: feedbackType,
          message,
          timestamp: new Date().toISOString(),
          url: window.location.href,
        }),
      });

      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        setMessage('');
      }, 2000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to send feedback. Please try again or email support directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        aria-label="Open feedback widget"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80 shadow-xl z-50">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Feedback & Support</CardTitle>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close widget"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <div className="text-center py-6">
            <p className="text-green-600 font-medium">Thank you for your feedback!</p>
            <p className="text-sm text-gray-500 mt-1">We'll get back to you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFeedbackType('bug')}
                className={`flex-1 text-xs py-1 px-2 rounded ${feedbackType === 'bug' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}
              >
                🐛 Bug
              </button>
              <button
                type="button"
                onClick={() => setFeedbackType('feature')}
                className={`flex-1 text-xs py-1 px-2 rounded ${feedbackType === 'feature' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}
              >
                💡 Feature
              </button>
              <button
                type="button"
                onClick={() => setFeedbackType('support')}
                className={`flex-1 text-xs py-1 px-2 rounded ${feedbackType === 'support' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
              >
                📞 Support
              </button>
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue or suggestion..."
              className="w-full p-2 border rounded text-sm min-h-[100px]"
              required
            />

            <Button type="submit" disabled={isSubmitting || !message.trim()} className="w-full">
              {isSubmitting ? 'Sending...' : 'Send Feedback'}
            </Button>

            <div className="text-xs text-center text-gray-500 pt-2 border-t">
              Or email us directly:{' '}
              <a href="mailto:support@renewpilot.com" className="text-blue-600 hover:underline">
                support@renewpilot.com
              </a>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
