
export interface UserPreferences {
  measurement_units: 'metric' | 'imperial';
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  dietary_restrictions: string[];
  allergies: string[];
  preferred_cuisines: string[];
  theme: 'light' | 'dark';
  [key: string]: string | string[] | number | boolean | null;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
}
