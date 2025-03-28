
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeType } from './BackgroundTypes';

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
type CuisineType = 'italian' | 'japanese' | 'mexican' | 'nordic' | 'default';
type RecipeStage = 'prep' | 'cooking' | 'plating' | 'default';
type Mood = 'peaceful' | 'energetic' | 'cozy' | 'elegant' | 'default';

interface BackgroundContextType {
  timeOfDay: TimeOfDay;
  cuisineType: CuisineType;
  recipeStage: RecipeStage;
  mood: Mood;
  theme: ThemeType;
  setCuisineType: (type: CuisineType) => void;
  setRecipeStage: (stage: RecipeStage) => void;
  setMood: (mood: Mood) => void;
  setTheme: (theme: ThemeType) => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};

export const BackgroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('afternoon');
  const [cuisineType, setCuisineType] = useState<CuisineType>('default');
  const [recipeStage, setRecipeStage] = useState<RecipeStage>('default');
  const [mood, setMood] = useState<Mood>('default');
  const [theme, setTheme] = useState<ThemeType>('default');

  // Determine time of day based on current time
  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      
      if (hour >= 5 && hour < 11) {
        setTimeOfDay('morning');
      } else if (hour >= 11 && hour < 17) {
        setTimeOfDay('afternoon');
      } else if (hour >= 17 && hour < 22) {
        setTimeOfDay('evening');
      } else {
        setTimeOfDay('night');
      }
    };

    // Set initial time of day
    updateTimeOfDay();

    // Update time of day every minute
    const interval = setInterval(updateTimeOfDay, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <BackgroundContext.Provider
      value={{
        timeOfDay,
        cuisineType,
        recipeStage,
        mood,
        theme,
        setCuisineType,
        setRecipeStage,
        setMood,
        setTheme,
      }}
    >
      {children}
    </BackgroundContext.Provider>
  );
};
