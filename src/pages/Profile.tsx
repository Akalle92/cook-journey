
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import ProfileForm from '@/components/Profile/ProfileForm';
import PreferencesForm from '@/components/Profile/PreferencesForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfile } from '@/hooks/useProfile';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/Auth/AuthModal';
import { Button } from '@/components/ui/button';

const Profile = () => {
  const { user } = useAuth();
  const { isLoading } = useProfile();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  
  React.useEffect(() => {
    if (!user) {
      setShowAuthModal(true);
    }
  }, [user]);

  return (
    <div className="min-h-screen grid-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <h1 className="font-serif text-3xl font-bold mb-8">My Profile</h1>
        
        {!user && (
          <Card>
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                Please sign in to access your profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowAuthModal(true)}>Sign In</Button>
            </CardContent>
          </Card>
        )}
        
        {isLoading && user && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          </div>
        )}
        
        {!isLoading && user && (
          <Tabs defaultValue="profile" className="glass p-6 w-full max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-4">
              <ProfileForm />
            </TabsContent>
            
            <TabsContent value="preferences" className="space-y-4">
              <PreferencesForm />
            </TabsContent>
          </Tabs>
        )}
      </main>
      
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default Profile;
