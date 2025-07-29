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
  signin: (email: string, password: string) => Promise<boolean>;
  signout: () => Promise<void>;
  signup: (email: string, password: string, role: 'customer' | 'seller') => Promise<boolean>;
  isLoading: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  signin: async () => false,
  signout: async () => {},
  signup: async () => false,
  isLoading: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session on mount
  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.auth.getSession();
      if (data.session?.user) {
        await fetchProfile(data.session.user.id);
      }
      setIsLoading(false);
    };
    getSession();

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile from "profiles" table
  const fetchProfile = async (id: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role, name')
      .eq('id', id)
      .single();
    if (data) {
      setUser(data as User);
    } else {
      setUser(null);
    }
  };

  // Sign in
  const signin = async (email: string, password: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      setIsLoading(false);
      return false;
    }
    await fetchProfile(data.user.id);
    setIsLoading(false);
    return true;
  };

  // Sign up
  const signup = async (email: string, password: string, role: 'customer' | 'seller') => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) {
      setIsLoading(false);
      return false;
    }
    // Insert profile row
    await supabase.from('profiles').upsert([
      { id: data.user.id, email, role, name: null }
    ]);
    await fetchProfile(data.user.id);
    setIsLoading(false);
    return true;
  };

  // Sign out
  const signout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, signin, signout, signup, isLoading }}>
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