
import React from 'react';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPreferences } from '@/types/profile';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';

const PreferencesForm: React.FC = () => {
  const { profile, updatePreferences } = useProfile();
  const [newItem, setNewItem] = React.useState<string>('');
  const [activeField, setActiveField] = React.useState<keyof Pick<UserPreferences, 'dietary_restrictions' | 'allergies' | 'preferred_cuisines'> | null>(null);

  if (!profile) return null;

  const handleMeasurementChange = (value: 'metric' | 'imperial') => {
    updatePreferences.mutate({ measurement_units: value });
  };

  const handleSkillLevelChange = (value: 'beginner' | 'intermediate' | 'advanced') => {
    updatePreferences.mutate({ skill_level: value });
  };

  const handleThemeChange = (value: 'light' | 'dark') => {
    updatePreferences.mutate({ theme: value });
  };

  const handleAddItem = () => {
    if (!activeField || !newItem.trim()) return;

    const updatedItems = [...profile.preferences[activeField], newItem.trim()];
    updatePreferences.mutate({ [activeField]: updatedItems });
    setNewItem('');
  };

  const handleRemoveItem = (field: keyof Pick<UserPreferences, 'dietary_restrictions' | 'allergies' | 'preferred_cuisines'>, item: string) => {
    const updatedItems = profile.preferences[field].filter(i => i !== item);
    updatePreferences.mutate({ [field]: updatedItems });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-lg font-medium">Measurement Units</h3>
        <RadioGroup
          defaultValue={profile.preferences.measurement_units}
          onValueChange={handleMeasurementChange as (value: string) => void}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="metric" id="metric" />
            <Label htmlFor="metric">Metric (g, ml)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="imperial" id="imperial" />
            <Label htmlFor="imperial">Imperial (oz, cups)</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-medium">Cooking Skill Level</h3>
        <Select
          defaultValue={profile.preferences.skill_level}
          onValueChange={handleSkillLevelChange as (value: string) => void}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Select level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-medium">App Theme</h3>
        <RadioGroup
          defaultValue={profile.preferences.theme}
          onValueChange={handleThemeChange as (value: string) => void}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="dark" id="dark" />
            <Label htmlFor="dark">Dark</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="light" id="light" />
            <Label htmlFor="light">Light</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-medium">Dietary Restrictions</h3>
        <div className="flex flex-wrap gap-2">
          {profile.preferences.dietary_restrictions.map((item) => (
            <Badge key={item} variant="secondary" className="flex items-center gap-1 py-1">
              {item}
              <button 
                onClick={() => handleRemoveItem('dietary_restrictions', item)}
                className="ml-1 rounded-full hover:bg-charcoal/20 p-1"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Add dietary restriction..."
            value={activeField === 'dietary_restrictions' ? newItem : ''}
            onChange={(e) => setNewItem(e.target.value)}
            onFocus={() => setActiveField('dietary_restrictions')}
            className="max-w-xs"
          />
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleAddItem}
            disabled={!newItem.trim() || activeField !== 'dietary_restrictions'}
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-medium">Allergies</h3>
        <div className="flex flex-wrap gap-2">
          {profile.preferences.allergies.map((item) => (
            <Badge key={item} variant="secondary" className="flex items-center gap-1 py-1">
              {item}
              <button 
                onClick={() => handleRemoveItem('allergies', item)}
                className="ml-1 rounded-full hover:bg-charcoal/20 p-1"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Add allergy..."
            value={activeField === 'allergies' ? newItem : ''}
            onChange={(e) => setNewItem(e.target.value)}
            onFocus={() => setActiveField('allergies')}
            className="max-w-xs"
          />
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleAddItem}
            disabled={!newItem.trim() || activeField !== 'allergies'}
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-medium">Preferred Cuisines</h3>
        <div className="flex flex-wrap gap-2">
          {profile.preferences.preferred_cuisines.map((item) => (
            <Badge key={item} variant="secondary" className="flex items-center gap-1 py-1">
              {item}
              <button 
                onClick={() => handleRemoveItem('preferred_cuisines', item)}
                className="ml-1 rounded-full hover:bg-charcoal/20 p-1"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Add cuisine..."
            value={activeField === 'preferred_cuisines' ? newItem : ''}
            onChange={(e) => setNewItem(e.target.value)}
            onFocus={() => setActiveField('preferred_cuisines')}
            className="max-w-xs"
          />
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleAddItem}
            disabled={!newItem.trim() || activeField !== 'preferred_cuisines'}
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PreferencesForm;
