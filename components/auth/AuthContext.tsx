import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  role: 'customer' | 'seller';
  name: string | null;
}

export type AuthContextType = {
  user: User | null;
  isSeller: boolean;
  signin: (email: string, password: string) => Promise<boolean>;
  signout: () => Promise<void>;
  signup: (email: string, password: string, role: 'customer' | 'seller', name: string) => Promise<boolean>;
  isLoading: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isSeller: false,
  signin: async () => false,
  signout: async () => {},
  signup: async () => false,
  isLoading: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isSeller = user?.role === 'seller';

  // Load session on mount
  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (data.session?.user) {
          await fetchProfile(data.session.user.id);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    getSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile from "profiles" table
  const fetchProfile = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, name')
        .eq('id', id)
        .maybeSingle(); // Changed from single() to maybeSingle()
      
      if (error) throw error;
      
      if (data) {
        setUser(data as User);
      } else {
        // If no profile exists, create one
        const { data: authData } = await supabase.auth.getUser();
        if (authData.user) {
          const { error: upsertError } = await supabase
            .from('profiles')
            .upsert({
              id: authData.user.id,
              email: authData.user.email,
              role: 'customer',
              name: authData.user.user_metadata?.name || null,
              updated_at: new Date().toISOString()
            });
          
          if (upsertError) throw upsertError;
          
          // Fetch the newly created profile
          const { data: newProfile } = await supabase
            .from('profiles')
            .select('id, email, role, name')
            .eq('id', id)
            .single();
            
          setUser(newProfile as User);
        } else {
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', {
        message: error.message,
        code: error.code,
        details: error.details
      });
      setUser(null);
    }
  };

  // Sign in
  const signin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      if (!data.user) {
        return false;
      }
      
      await fetchProfile(data.user.id);
      return true;
    } catch (error) {
      console.error('Signin error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up
  const signup = async (email: string, password: string, role: 'customer' | 'seller', name: string) => {
    setIsLoading(true);
    try {
      // 1. Sign up the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });

      if (error) throw error;
      
      if (!data.user) {
        return false;
      }

      // 2. Get the session to ensure we have a valid JWT
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!sessionData.session) throw new Error('No session created');

      // 3. Insert profile data into the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id, 
          email, 
          role,
          name,
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      // 4. Fetch the newly created profile
      await fetchProfile(data.user.id);
      return true;
    } catch (error) {
      console.error('Signup error:', {
        message: error.message,
        code: error.code,
        details: error.details
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Signout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isSeller, signin, signout, signup, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}