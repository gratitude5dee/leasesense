
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: userData, isLoading } = useUserData();
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    
    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (!isLoading && isMounted) {
      // If user has already set up their profile, go to dashboard
      if (userData && userData.user_type) {
        navigate("/dashboard");
      } 
      // If not, direct them to onboarding
      else if (userData) {
        navigate("/onboarding");
      }
    }
  }, [userData, isLoading, navigate, isMounted]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">LeaseSense Dashboard</h1>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <div className="animate-pulse">
            <h2 className="text-lg font-medium mb-4">Loading your profile...</h2>
            <p className="text-gray-600">Please wait while we prepare your personalized dashboard.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
