
import React, { useState } from 'react';
import RecipeUrlInput from '@/components/RecipeUrlInput';
import ExtractionError from './ExtractionError';
import { useRecipeExtraction } from '@/hooks/useRecipeExtraction';

const ExtractRecipeSection: React.FC = () => {
  const [url, setUrl] = useState('');
  const {
    extractionError,
    isLoading,
    retries,
    maxRetries,
    handleRecipeExtraction,
    handleRetry,
    handleTryWithAI,
    resetRetries
  } = useRecipeExtraction();

  const onSubmit = (submittedUrl: string, useAI: boolean = false) => {
    setUrl(submittedUrl);
    resetRetries();
    handleRecipeExtraction(submittedUrl, useAI);
  };

  const onRetry = () => {
    if (url) {
      handleRetry(url);
    }
  };

  const onTryWithAI = () => {
    if (url) {
      handleTryWithAI(url);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mb-12">
      <RecipeUrlInput 
        onSubmit={onSubmit} 
        isLoading={isLoading} 
      />
      
      {extractionError && (
        <ExtractionError
          error={extractionError}
          onRetry={onRetry}
          onTryWithAI={onTryWithAI}
          isLoading={isLoading}
          retries={retries}
          maxRetries={maxRetries}
        />
      )}
    </div>
  );
};

export default ExtractRecipeSection;
