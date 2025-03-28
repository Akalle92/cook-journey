
import React, { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import AvatarUpload from './AvatarUpload';
import { toast } from '@/hooks/use-toast';

const ProfileForm: React.FC = () => {
  const { profile, updateProfile } = useProfile();
  const { user } = useAuth();
  
  const [username, setUsername] = useState(profile?.username || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!profile || !user) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast({
        title: 'Username required',
        description: 'Please enter a username',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await updateProfile.mutateAsync({ username });
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <AvatarUpload size="lg" />
        
        <div className="space-y-4 flex-1">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={user.email}
              disabled
              className="bg-charcoal/20"
            />
            <p className="text-xs text-muted-foreground">
              To change your email, use the account settings.
            </p>
          </div>
          
          <div className="pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ProfileForm;
