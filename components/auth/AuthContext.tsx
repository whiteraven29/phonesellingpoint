import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  name: string; // This will serve as username
  role: 'customer' | 'seller';
}

export type AuthContextType = {
  user: User | null;
  isSeller: boolean;
  signin: (username: string, password: string) => Promise<boolean>;
  signout: () => Promise<void>;
  signup: (username: string, email: string, password: string, role: 'customer' | 'seller') => Promise<boolean>;
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, name, role')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    
    if (data) {
      setUser(data as User);
    } else {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      
      if (authData.user) {
        // Handle potential undefined email
        const userEmail = authData.user.email;
        if (!userEmail) {
          throw new Error('User email is missing');
        }

        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: userEmail,
            name: authData.user.user_metadata?.name || userEmail.split('@')[0],
            role: 'customer',
            updated_at: new Date().toISOString()
          });
        
        if (upsertError) throw upsertError;
        
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, name, role')
          .eq('id', id)
          .single();
          
        if (profileError) throw profileError;
        
        setUser(newProfile as User);
      } else {
        setUser(null);
      }
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
    setUser(null);
  }
};

  const signin = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // First get the email associated with the username (name field)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('name', username)
        .maybeSingle();

      if (profileError || !profileData) {
        throw new Error('Invalid username or password');
      }

      // Then sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: profileData.email,
        password
      });

      if (error || !data.user) throw error || new Error('Sign in failed');
      
      await fetchProfile(data.user.id);
      return true;
    } catch (error) {
      console.error('Signin error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (username: string, email: string, password: string, role: 'customer' | 'seller') => {
    setIsLoading(true);
    try {
      // Check if username (name) already exists
      const { data: existingUser, error: usernameError } = await supabase
        .from('profiles')
        .select('name')
        .eq('name', username)
        .maybeSingle();

      if (usernameError) throw usernameError;
      if (existingUser) throw new Error('Username already exists');

      // Create auth user
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name: username,
            role
          }
        }
      });

      if (error || !data.user) throw error || new Error('Signup failed');

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email,
          name: username,
          role,
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

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