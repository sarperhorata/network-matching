import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';
import { api } from '../utils/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  session: any;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        
        if (existingSession) {
          setSession(existingSession);
          const userData = await api.getMe(existingSession.access_token);
          setUser(userData.user);
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      // Create user via server (uses admin.createUser)
      const response = await api.signup({ email, password, ...userData });
      
      // Sign in immediately after signup using Supabase client
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Post-signup login error:', error);
        throw new Error(error.message);
      }

      if (!data.session) {
        throw new Error('No session returned after signup');
      }

      setSession(data.session);
      setUser(response.user);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Use Supabase client for authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase auth error:', error);
        throw new Error(error.message);
      }

      if (!data.session) {
        throw new Error('No session returned from login');
      }

      setSession(data.session);

      // Fetch user data from server
      try {
        const userData = await api.getMe(data.session.access_token);
        setUser(userData.user);
      } catch (userError) {
        console.error('Failed to fetch user data:', userError);
        // If user data doesn't exist in KV store, create a basic user object
        setUser({
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.name || '',
          role: 'participant',
          industry: '',
          interests: [],
          goals: [],
          profileImage: '',
          createdAt: new Date().toISOString(),
          profileCompletion: 0,
          stats: {
            eventsAttended: 0,
            totalMatches: 0,
            acceptedMatches: 0,
            totalMeetings: 0,
          }
        });
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const updateProfile = async (data: any) => {
    if (!session) return;
    
    try {
      const response = await api.updateMe(data, session.access_token);
      setUser(response.user);
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, updateProfile }}>
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
