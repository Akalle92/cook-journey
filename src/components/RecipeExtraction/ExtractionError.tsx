
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExtractionErrorProps {
  error: {
    message: string;
    suggestion?: string;
  };
  onRetry: () => void;
  onTryWithAI: () => void;
  isLoading: boolean;
  retries: number;
  maxRetries: number;
}

const ExtractionError: React.FC<ExtractionErrorProps> = ({
  error,
  onRetry,
  onTryWithAI,
  isLoading,
  retries,
  maxRetries
}) => {
  return (
    <div className="bg-red-900/30 border border-red-800 rounded-md p-4 flex items-start gap-3 mt-4">
      <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-red-300 font-medium text-sm">Extraction failed</p>
        <p className="text-red-200/80 text-xs mt-1">{error.message}</p>
        {error.suggestion && (
          <p className="text-red-200/80 text-xs mt-1">{error.suggestion}</p>
        )}
        
        <div className="flex gap-2 mt-3">
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={onRetry}
            disabled={retries >= maxRetries || isLoading}
          >
            Retry Extraction
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onTryWithAI}
            disabled={isLoading}
          >
            Try with AI
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExtractionError;
