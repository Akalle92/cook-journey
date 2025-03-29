
import React from 'react';
import { ExtractionMethod } from '@/components/RecipeCard';

interface DebugInfoProps {
  debugInfo: {
    method?: string;
    confidence?: number;
    results?: ExtractionMethod[];
  };
}

const DebugInfo: React.FC<DebugInfoProps> = ({ debugInfo }) => {
  if (!debugInfo) return null;
  
  return (
    <div className="my-8 p-4 bg-gray-900/70 border border-gray-800 rounded-md">
      <h3 className="text-lg font-mono text-yellow-400 mb-2">Debug Information</h3>
      <div className="text-xs font-mono text-gray-300 space-y-2">
        <p>Extraction Method: <span className="text-green-400">{debugInfo.method}</span></p>
        <p>Confidence Score: <span className="text-green-400">{debugInfo.confidence || 'N/A'}</span></p>
        
        {debugInfo.results && (
          <div className="mt-4">
            <p className="text-yellow-400 mb-2">Extraction Attempts:</p>
            <div className="space-y-2">
              {debugInfo.results.map((result: any, index: number) => (
                <div key={index} className="p-2 bg-gray-800/50 rounded border border-gray-700">
                  <p>Method: <span className={result.success ? 'text-green-400' : 'text-red-400'}>{result.method}</span></p>
                  <p>Success: <span className={result.success ? 'text-green-400' : 'text-red-400'}>{result.success ? 'Yes' : 'No'}</span></p>
                  {result.confidence && <p>Confidence: {result.confidence.toFixed(2)}</p>}
                  {result.error && (
                    <div className="mt-1 text-red-400">
                      <p>Error: {result.error.message}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugInfo;
