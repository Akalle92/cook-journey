
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { ExtractionMethod } from '@/components/RecipeCard';

interface ExtractionErrorProps {
  error: {
    status: string;
    message: string;
    extractionResults?: ExtractionMethod[];
    suggestion?: string;
  };
  onRetry: () => void;
  onTryWithClaude: () => void;
  isLoading: boolean;
  retries: number;
  maxRetries: number;
}

const ExtractionError: React.FC<ExtractionErrorProps> = ({
  error,
  onRetry,
  onTryWithClaude,
  isLoading,
  retries,
  maxRetries
}) => {
  return (
    <div className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded-md">
      <h3 className="text-lg font-medium text-red-300 mb-2">Extraction Error</h3>
      <p className="text-red-200 text-sm mb-3">{error.message}</p>
      
      {error.suggestion && (
        <p className="text-yellow-300 text-sm">{error.suggestion}</p>
      )}
      
      {error.extractionResults && error.extractionResults.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-red-300 mb-2">Details:</p>
          <div className="space-y-2">
            {error.extractionResults.map((result, index) => (
              <div key={index} className="text-xs bg-red-900/20 p-2 rounded">
                <p>Method: {result.method} - <span className={result.success ? "text-green-400" : "text-red-400"}>
                  {result.success ? "Success" : "Failed"}
                </span></p>
                {result.error && <p className="text-red-400">{result.error.message}</p>}
              </div>
            ))}
          </div>
        </div>
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
          onClick={onTryWithClaude}
          disabled={isLoading}
        >
          Try with Claude AI
        </Button>
      </div>
    </div>
  );
};

export default ExtractionError;
