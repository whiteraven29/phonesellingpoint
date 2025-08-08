import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'seller';
}

export type AuthContextType = {
  user: User | null;
  isSeller: boolean;
  signin: (name: string, password: string) => Promise<boolean>;
  signout: () => Promise<void>;
  signup: (name: string, email: string, password: string, role: 'customer' | 'seller') => Promise<boolean>;
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
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (session?.user) await fetchProfile(session.user.id);
      } catch (error) {
        console.error('Session error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, email, name, role')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUser(profile as User);
    } catch (error) {
      console.error('Profile fetch error:', error);
      setUser(null);
    }
  };

  const signin = async (name: string, password: string) => {
    setIsLoading(true);
    try {
      // First find the email associated with the username
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('name', name)
        .single();

      if (profileError || !profile?.email) {
        throw new Error('Invalid username or password');
      }

      // Then sign in with email/password
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password,
      });

      if (error || !session?.user) {
        throw error || new Error('Login failed');
      }

      // Verify email confirmation
      if (!session.user.confirmed_at) {
        await supabase.auth.signOut();
        throw new Error('Please verify your email first');
      }

      await fetchProfile(session.user.id);
      return true;
    } catch (error: any) {
      Alert.alert('Login Error', error.message || 'Failed to sign in');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, role: 'customer' | 'seller') => {
    setIsLoading(true);
    try {
      // Check username availability
      const { count, error: nameError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('name', name);

      if (nameError) throw nameError;
      if (count && count > 0) throw new Error('Username already taken');

      // Create auth user first
      const { data: { user: authUser }, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role },
          emailRedirectTo: 'your-app://callback'
        }
      });

      if (authError || !authUser) throw authError || new Error('Signup failed');

      // Create profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authUser.id,
          email,
          name,
          role,
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      Alert.alert(
        'Verify Your Email',
        'A confirmation link has been sent to your email address.'
      );
      return true;
    } catch (error: any) {
      Alert.alert(
        'Signup Error',
        error.message || 'Failed to create account. Please try again.'
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
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