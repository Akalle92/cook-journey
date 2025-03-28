
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Profile, UserPreferences } from '@/types/profile';
import { toast } from '@/hooks/use-toast';

export const useProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchProfile = async (): Promise<Profile | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    
    // Ensure the data conforms to our Profile type
    return data as Profile;
  };

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: fetchProfile,
    enabled: !!user,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates as any)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as Profile;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', user?.id], data);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating profile',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    },
  });

  const updatePreferences = useMutation({
    mutationFn: async (preferences: Partial<UserPreferences>) => {
      if (!user || !profile) throw new Error('Not authenticated or profile not loaded');

      const updatedPreferences = {
        ...profile.preferences,
        ...preferences,
      };

      const { data, error } = await supabase
        .from('profiles')
        .update({ preferences: updatedPreferences as any })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as Profile;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', user?.id], data);
      toast({
        title: 'Preferences updated',
        description: 'Your preferences have been successfully updated',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating preferences',
        description: error.message || 'Failed to update preferences',
        variant: 'destructive',
      });
    },
  });

  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // Upload image to storage
      const { error: uploadError } = await supabase.storage
        .from('avatar')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: publicURL } = supabase.storage
        .from('avatar')
        .getPublicUrl(filePath);

      // Update the profile with the new avatar URL
      const { data, error } = await supabase
        .from('profiles')
        .update({ avatar_url: publicURL.publicUrl })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as Profile;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', user?.id], data);
      toast({
        title: 'Avatar updated',
        description: 'Your avatar has been successfully updated',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating avatar',
        description: error.message || 'Failed to update avatar',
        variant: 'destructive',
      });
    },
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    updatePreferences,
    uploadAvatar,
  };
};
