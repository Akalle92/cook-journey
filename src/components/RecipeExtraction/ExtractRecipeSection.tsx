
import React, { useState } from 'react';
import RecipeUrlInput from '@/components/RecipeUrlInput';
import ExtractionError from './ExtractionError';
import DebugInfo from './DebugInfo';
import { useRecipeExtraction } from '@/hooks/useRecipeExtraction';

const ExtractRecipeSection: React.FC = () => {
  const [url, setUrl] = useState('');
  const {
    extractionError,
    debugInfo,
    isLoading,
    retries,
    maxRetries,
    handleRecipeExtraction,
    handleRetry,
    handleTryWithClaude,
    handleTryWithFreeModel,
    resetRetries
  } = useRecipeExtraction();

  const onSubmit = (submittedUrl: string, useClaude: boolean = false, useFreeModel: boolean = false, debugMode: boolean = false) => {
    setUrl(submittedUrl);
    resetRetries();
    handleRecipeExtraction(submittedUrl, useClaude, useFreeModel, debugMode);
  };

  const onRetry = () => {
    if (url) {
      handleRetry(url);
    }
  };

  const onTryWithClaude = () => {
    if (url) {
      handleTryWithClaude(url);
    }
  };

  const onTryWithFreeModel = () => {
    if (url) {
      handleTryWithFreeModel(url);
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
          onTryWithClaude={onTryWithClaude}
          onTryWithFreeModel={onTryWithFreeModel}
          isLoading={isLoading}
          retries={retries}
          maxRetries={maxRetries}
        />
      )}
      
      {debugInfo && <DebugInfo debugInfo={debugInfo} />}
    </div>
  );
};

export default ExtractRecipeSection;
