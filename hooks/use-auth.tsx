'use client';

import React, { createContext, useContext } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';

interface UserProfile {
  customerId: string;
  email: string;
  companyName: string;
  contactName: string;
  phone?: string;
}

// Minimal user shape — uid maps to customerId so existing page code stays unchanged.
interface AuthUser {
  uid: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthReady: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAuthReady: false,
});

function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  const loading = status === 'loading';
  const isAuthReady = status !== 'loading';

  const user: AuthUser | null =
    session?.user?.customerId
      ? { uid: session.user.customerId, email: session.user.email ?? '' }
      : null;

  const profile: UserProfile | null =
    session?.user?.customerId
      ? {
          customerId:  session.user.customerId,
          email:       session.user.email ?? '',
          companyName: session.user.companyName ?? '',
          contactName: session.user.contactName ?? '',
          phone:       session.user.phone,
        }
      : null;

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAuthReady }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextProvider>{children}</AuthContextProvider>
    </SessionProvider>
  );
}

export const useAuth = () => useContext(AuthContext);
