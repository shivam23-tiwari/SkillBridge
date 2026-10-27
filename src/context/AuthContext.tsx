import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DataService, initializeStore } from '../services/store';
import { EmailService, OWNER_EMAIL } from '../services/emailService';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  college?: string;
  role?: 'student' | 'client' | 'admin';
}

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  isLoading: boolean;
  isOwner: boolean;
  welcomeModalOpen: boolean;
  dismissWelcomeModal: () => void;
  login: (email: string, password?: string, optionalMessage?: string) => Promise<void>;
  signup: (
    name: string,
    email: string,
    password?: string,
    college?: string,
    registrationMethod?: string
  ) => Promise<AuthUser>;
  signupWithGoogle: (
    name: string,
    email: string,
    college?: string
  ) => Promise<{ user: AuthUser; isNewUser: boolean }>;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  updateCurrentProfile: (updates: Partial<Profile>) => Promise<Profile>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'skillbridge_current_user';
const CREDENTIALS_KEY = 'skillbridge_user_credentials';
const WELCOME_SEEN_KEY = 'skillbridge_welcome_dismissed_users';

interface StoredCredential {
  password?: string;
  name: string;
  college?: string;
  role?: 'student' | 'client' | 'admin';
  createdAt: string;
}

const memoryCredentials = new Map<string, Record<string, StoredCredential>>();

function getStoredCredentials(): Record<string, StoredCredential> {
  try {
    const raw = localStorage.getItem(CREDENTIALS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Reading credentials from localStorage failed, using memory cache:', err);
  }

  if (memoryCredentials.has(CREDENTIALS_KEY)) {
    return memoryCredentials.get(CREDENTIALS_KEY)!;
  }

  // Pre-seed owner and default verified student accounts with known test password
  const initial: Record<string, StoredCredential> = {
    [OWNER_EMAIL.toLowerCase()]: {
      password: 'password123',
      name: 'Shivam Tiwari',
      college: 'SkillBridge Platform Admin',
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
    'alex.chen@berkeley.edu': {
      password: 'password123',
      name: 'Alex Chen',
      college: 'UC Berkeley',
      role: 'student',
      createdAt: new Date().toISOString(),
    },
    'priya.sharma@stanford.edu': {
      password: 'password123',
      name: 'Priya Sharma',
      college: 'Stanford University',
      role: 'student',
      createdAt: new Date().toISOString(),
    },
    'marcus.vance@mit.edu': {
      password: 'password123',
      name: 'Marcus Vance',
      college: 'MIT',
      role: 'student',
      createdAt: new Date().toISOString(),
    },
    'sarah.lin@cmu.edu': {
      password: 'password123',
      name: 'Sarah Lin',
      college: 'Carnegie Mellon University',
      role: 'student',
      createdAt: new Date().toISOString(),
    },
  };

  memoryCredentials.set(CREDENTIALS_KEY, initial);
  try {
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(initial));
  } catch {
    // Quota safe
  }
  return initial;
}

function saveCredentials(creds: Record<string, StoredCredential>): void {
  memoryCredentials.set(CREDENTIALS_KEY, creds);
  try {
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(creds));
  } catch (err) {
    console.warn('Saving credentials to localStorage failed, persisting in-memory:', err);
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [welcomeModalOpen, setWelcomeModalOpen] = useState(false);

  const dismissWelcomeModal = () => {
    setWelcomeModalOpen(false);
    if (user?.email) {
      try {
        const raw = localStorage.getItem(WELCOME_SEEN_KEY);
        const list: string[] = raw ? JSON.parse(raw) : [];
        const normalized = user.email.toLowerCase();
        if (!list.includes(normalized)) {
          list.push(normalized);
          localStorage.setItem(WELCOME_SEEN_KEY, JSON.stringify(list));
        }
      } catch {
        // Ignore storage error
      }
    }
  };

  // Initialize store and restore session
  useEffect(() => {
    initializeStore();
    getStoredCredentials();

    async function initAuth() {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const isOwner = (session.user.email || '').toLowerCase() === OWNER_EMAIL.toLowerCase();
            const authUser: AuthUser = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.full_name || 'Student Developer',
              role: isOwner ? 'admin' : 'student',
            };
            setUser(authUser);
            const userProfile = await DataService.getProfileById(session.user.id);
            setProfile(userProfile);
            setIsLoading(false);
            return;
          }
        }

        // Restore explicitly authenticated session
        const savedUserJson = localStorage.getItem(AUTH_USER_KEY);
        if (savedUserJson) {
          const savedUser = JSON.parse(savedUserJson) as AuthUser;
          setUser(savedUser);
          const p = await DataService.getProfileById(savedUser.id);
          setProfile(p);
        } else {
          // NO auto-login! Visitors start as unauthenticated guests.
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Failed to initialize auth state:', err);
        setUser(null);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email: string, password?: string, optionalMessage?: string) => {
    setIsLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      if (isSupabaseConfigured && supabase && password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (error) throw error;
        if (data.user) {
          const isOwner = normalizedEmail === OWNER_EMAIL.toLowerCase();
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || normalizedEmail,
            name: data.user.user_metadata?.full_name || normalizedEmail.split('@')[0],
            role: isOwner ? 'admin' : 'student',
          };
          setUser(authUser);
          const p = await DataService.getProfileById(data.user.id);
          setProfile(p);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));

          await DataService.recordLogin({
            userId: authUser.id,
            userName: authUser.name,
            email: authUser.email,
            message: optionalMessage,
            status: 'success',
          });
          return;
        }
      }

      // Check registered credentials and profiles
      const creds = getStoredCredentials();
      const allProfiles = await DataService.getProfiles();
      const matchedProfile = allProfiles.find(p => p.email?.toLowerCase() === normalizedEmail);
      const matchedCred = creds[normalizedEmail];

      // If user does not exist anywhere
      if (!matchedProfile && !matchedCred && normalizedEmail !== OWNER_EMAIL.toLowerCase()) {
        throw new Error('No account found for this email address. Please create an account first.');
      }

      // Validate password if credentials exist
      if (password && matchedCred?.password && matchedCred.password !== password) {
        throw new Error('Incorrect password. Please verify your credentials and try again.');
      }

      const isOwner = normalizedEmail === OWNER_EMAIL.toLowerCase();

      let targetUser: AuthUser;
      let targetProfile: Profile | null = null;

      if (isOwner) {
        targetUser = {
          id: matchedProfile?.id || 'user-owner',
          email: OWNER_EMAIL,
          name: matchedProfile?.full_name || matchedCred?.name || 'Shivam Tiwari',
          college: 'SkillBridge Platform Admin',
          role: 'admin',
        };
        targetProfile = matchedProfile || await DataService.updateProfile('user-owner', {
          email: OWNER_EMAIL,
          full_name: 'Shivam Tiwari',
          college: 'Platform Administrator',
          role: 'admin',
          available_for_work: false,
        });
      } else if (matchedProfile) {
        targetUser = {
          id: matchedProfile.id,
          email: matchedProfile.email || normalizedEmail,
          name: matchedProfile.full_name,
          college: matchedProfile.college,
          role: 'student',
        };
        targetProfile = matchedProfile;
      } else {
        // Credential existed but profile was pending
        const newId = 'student-' + Math.random().toString(36).substring(2, 9);
        targetProfile = await DataService.updateProfile(newId, {
          email: normalizedEmail,
          full_name: matchedCred?.name || normalizedEmail.split('@')[0],
          college: matchedCred?.college || 'University Student',
          available_for_work: true,
          skills: ['Web Development', 'React'],
        });
        targetUser = {
          id: newId,
          email: normalizedEmail,
          name: targetProfile.full_name,
          college: targetProfile.college,
          role: 'student',
        };
      }

      setUser(targetUser);
      setProfile(targetProfile);
      setWelcomeModalOpen(false);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(targetUser));

      // Record login and dispatch instant owner notification
      await DataService.recordLogin({
        userId: targetUser.id,
        userName: targetUser.name,
        email: targetUser.email,
        message: optionalMessage,
        status: 'success',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    name: string,
    email: string,
    password?: string,
    college?: string,
    registrationMethod: string = 'Email / Password'
  ): Promise<AuthUser> => {
    setIsLoading(true);
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim() || normalizedEmail.split('@')[0];

    try {
      if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        throw new Error('Please provide a valid email address.');
      }

      // 1. One Account Per Gmail / Email check:
      const creds = getStoredCredentials();
      const allProfiles = await DataService.getProfiles();
      const existingProfile = allProfiles.find(p => p.email?.toLowerCase() === normalizedEmail);

      if (creds[normalizedEmail] || existingProfile) {
        throw new Error('You already have an account with this Gmail/email. Please sign in instead.');
      }

      const isOwner = normalizedEmail === OWNER_EMAIL.toLowerCase();

      // Register credentials
      creds[normalizedEmail] = {
        password: password || 'password123',
        name: trimmedName,
        college: college?.trim() || '',
        role: isOwner ? 'admin' : 'student',
        createdAt: new Date().toISOString(),
      };
      saveCredentials(creds);

      const newId = isOwner ? 'user-owner' : 'student-' + Math.random().toString(36).substring(2, 9);
      const newProfile = await DataService.updateProfile(newId, {
        email: normalizedEmail,
        full_name: trimmedName,
        college: college?.trim() || 'University Student',
        skills: ['Software Engineering', 'React'],
        available_for_work: true,
        bio: 'Student creator and freelance builder on SkillBridge.',
      });

      const authUser: AuthUser = {
        id: newId,
        email: normalizedEmail,
        name: trimmedName,
        college: newProfile.college,
        role: isOwner ? 'admin' : 'student',
      };

      setUser(authUser);
      setProfile(newProfile);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));

      // Show welcome notification modal for newly registered user (only once)
      try {
        const seenRaw = localStorage.getItem(WELCOME_SEEN_KEY);
        const seenList: string[] = seenRaw ? JSON.parse(seenRaw) : [];
        if (!seenList.includes(normalizedEmail)) {
          setWelcomeModalOpen(true);
        }
      } catch {
        setWelcomeModalOpen(true);
      }

      // Create an in-app welcome notification item for the user's dashboard activity tab
      try {
        await DataService.createNotification(
          authUser.id,
          'user-owner',
          'collaboration_request',
          `🎉 Welcome to SkillBridge, ${authUser.name}! Your account has been created successfully and a confirmation email was sent to ${authUser.email}.`
        );
      } catch {
        // Non-blocking
      }

      // Notify owner of new registered user + trigger server-side Admin & User Welcome emails
      try {
        EmailService.sendSignupEmailNotification({
          userId: authUser.id,
          name: authUser.name,
          email: authUser.email,
          college: authUser.college,
          registrationMethod,
          idempotencyKey: `signup:${authUser.id}:${authUser.email}`,
        });
      } catch (emailErr) {
        console.warn('Non-blocking signup email notification error:', emailErr);
      }

      await DataService.recordLogin({
        userId: authUser.id,
        userName: authUser.name,
        email: authUser.email,
        message: `New account registered via ${registrationMethod}`,
        status: 'success',
      });

      return authUser;
    } finally {
      setIsLoading(false);
    }
  };

  const signupWithGoogle = async (
    name: string,
    email: string,
    college?: string
  ): Promise<{ user: AuthUser; isNewUser: boolean }> => {
    const normalizedEmail = email.trim().toLowerCase();
    const creds = getStoredCredentials();
    const allProfiles = await DataService.getProfiles();
    const existingProfile = allProfiles.find(p => p.email?.toLowerCase() === normalizedEmail);

    // If user already exists, log them in without sending duplicate registration emails or showing the new-user welcome modal
    if (creds[normalizedEmail] || existingProfile) {
      await login(normalizedEmail, creds[normalizedEmail]?.password, 'Signed in with Google');
      const savedUserJson = localStorage.getItem(AUTH_USER_KEY);
      const loggedInUser: AuthUser = savedUserJson
        ? JSON.parse(savedUserJson)
        : {
            id: existingProfile?.id || 'student-google',
            email: normalizedEmail,
            name: existingProfile?.full_name || creds[normalizedEmail]?.name || name,
            college: existingProfile?.college || creds[normalizedEmail]?.college,
            role: normalizedEmail === OWNER_EMAIL.toLowerCase() ? 'admin' : 'student',
          };
      return { user: loggedInUser, isNewUser: false };
    }

    const newUser = await signup(name, normalizedEmail, undefined, college, 'Google');
    return { user: newUser, isNewUser: true };
  };

  const resetPassword = async (email: string, newPassword: string): Promise<void> => {
    setIsLoading(true);
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const creds = getStoredCredentials();
      const allProfiles = await DataService.getProfiles();
      const matchedProfile = allProfiles.find(p => p.email?.toLowerCase() === normalizedEmail);
      const matchedCred = creds[normalizedEmail];

      if (!matchedProfile && !matchedCred && normalizedEmail !== OWNER_EMAIL.toLowerCase()) {
        throw new Error('No account found for this email address.');
      }

      if (creds[normalizedEmail]) {
        creds[normalizedEmail].password = newPassword;
      } else {
        creds[normalizedEmail] = {
          password: newPassword,
          name: matchedProfile?.full_name || normalizedEmail.split('@')[0],
          college: matchedProfile?.college || '',
          role: normalizedEmail === OWNER_EMAIL.toLowerCase() ? 'admin' : 'student',
          createdAt: new Date().toISOString(),
        };
      }
      saveCredentials(creds);

      if (isSupabaseConfigured && supabase) {
        await supabase.auth.updateUser({ password: newPassword });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(AUTH_USER_KEY);
    setWelcomeModalOpen(false);
    setUser(null);
    setProfile(null);
  };

  const updateCurrentProfile = async (updates: Partial<Profile>): Promise<Profile> => {
    if (!user) throw new Error('Not authenticated');
    const updated = await DataService.updateProfile(user.id, updates);
    setProfile(updated);

    if (updates.full_name && updates.full_name !== user.name) {
      const updatedUser: AuthUser = { ...user, name: updates.full_name };
      setUser(updatedUser);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));

      // Update stored credentials name
      const creds = getStoredCredentials();
      if (creds[user.email.toLowerCase()]) {
        creds[user.email.toLowerCase()].name = updates.full_name;
        saveCredentials(creds);
      }
    }

    return updated;
  };

  const isOwner = user?.email.toLowerCase() === OWNER_EMAIL.toLowerCase();

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isOwner,
        welcomeModalOpen,
        dismissWelcomeModal,
        login,
        signup,
        signupWithGoogle,
        resetPassword,
        logout,
        updateCurrentProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
