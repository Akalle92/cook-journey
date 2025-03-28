
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, UserCircle } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

interface AvatarUploadProps {
  size?: 'sm' | 'md' | 'lg';
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ size = 'md' }) => {
  const { profile, uploadAvatar } = useProfile();
  const [isHovering, setIsHovering] = useState(false);
  
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }
    
    uploadAvatar.mutate(file);
  };

  const initials = profile?.username 
    ? profile.username.substring(0, 2).toUpperCase() 
    : '?';

  return (
    <div className="relative">
      <Avatar 
        className={`${sizeClasses[size]} bg-teal/20 relative`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <AvatarImage src={profile?.avatar_url || ''} alt="Profile" />
        <AvatarFallback className="font-serif text-xl">
          {profile ? initials : <UserCircle className="h-8 w-8" />}
        </AvatarFallback>
      </Avatar>
      
      {isHovering && (
        <div className="absolute inset-0 flex items-center justify-center bg-charcoal/70 rounded-full">
          <label 
            htmlFor="avatar-upload" 
            className="cursor-pointer flex items-center justify-center"
          >
            <Camera className="text-offwhite h-6 w-6" />
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
      )}
      
      {size !== 'sm' && (
        <div className="mt-2">
          <label 
            htmlFor="avatar-upload-btn" 
            className="cursor-pointer"
          >
            <Button variant="ghost" size="sm" className="text-xs">
              {profile?.avatar_url ? 'Change' : 'Upload'} Photo
              <input
                id="avatar-upload-btn"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </Button>
          </label>
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;
