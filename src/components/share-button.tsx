import { useState } from 'react';
import { saveQueryPlan } from '@/lib/supabase';
import { useLocation } from 'react-router-dom';

interface ShareButtonProps {
  queryPlan: string;
}

export function ShareButton({ queryPlan }: ShareButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const location = useLocation();

  // Only show the share button on the main route
  if (location.pathname !== '/') {
    return null;
  }

  const handleShare = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { shortCode } = await saveQueryPlan(queryPlan);
      const url = `${window.location.origin}/plan/${shortCode}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
    } catch (err) {
      setError('Failed to create share link');
      console.error('Share error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleShare}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isLoading ? 'Sharing...' : 'Share Plan'}
      </button>
      
      {shareUrl && (
        <div className="mt-2 text-sm text-green-600">
          Link copied to clipboard!
        </div>
      )}
      
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}