import {
  User,
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
  signOut,
} from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AuthMeResponse } from "@shared/api";
import { ApiError, getCurrentUserProfile } from "@/lib/api";
import { readProfileCache, writeProfileCache } from "@/lib/profileCache";
import { firebaseAuth, googleProvider } from "@/lib/firebase";

interface AuthContextValue {
  firebaseUser: User | null;
  profile: AuthMeResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<AuthMeResponse | null>;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function buildFallbackProfile(user: User): AuthMeResponse {
  return {
    uid: user.uid,
    email: user.email ?? undefined,
    displayName: user.displayName ?? undefined,
    photoURL: user.photoURL ?? undefined,
    needsProfileSetup: true,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthMeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getIdToken = useCallback(async (forceRefresh = false) => {
    if (!firebaseAuth.currentUser) return null;
    return firebaseAuth.currentUser.getIdToken(forceRefresh);
  }, []);

  const refreshProfile = useCallback(async () => {
    const activeUser = firebaseAuth.currentUser;
    if (!activeUser) {
      setProfile(null);
      return null;
    }

    try {
      const token = await activeUser.getIdToken();
      if (!token) throw new Error("Authentication token missing");

      let backendProfile: AuthMeResponse;

      try {
        backendProfile = await getCurrentUserProfile(token);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          const refreshedToken = await activeUser.getIdToken(true);
          if (!refreshedToken) throw error;
          backendProfile = await getCurrentUserProfile(refreshedToken);
        } else {
          throw error;
        }
      }

      const mergedProfile: AuthMeResponse = {
        ...backendProfile,
        uid: backendProfile.uid ?? activeUser.uid,
        email: backendProfile.email ?? activeUser.email ?? undefined,
        displayName: backendProfile.displayName ?? activeUser.displayName ?? undefined,
        photoURL: backendProfile.photoURL ?? activeUser.photoURL ?? undefined,
      };
      writeProfileCache(mergedProfile);
      setProfile(mergedProfile);
      return mergedProfile;
    } catch {
      const cached = readProfileCache<AuthMeResponse>(activeUser.uid);
      if (cached) {
        setProfile(cached);
        return cached;
      }

      const fallback = buildFallbackProfile(activeUser);
      setProfile(fallback);
      return fallback;
    }
  }, []);

  useEffect(() => {
    // Pick up the result from a signInWithRedirect() that completed
    // after the Google OAuth redirect returned to this page.
    getRedirectResult(firebaseAuth).catch(() => {
      // Silently ignore — no redirect in progress is the normal case
    });

    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      setFirebaseUser(user);

      if (!user) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      await refreshProfile();
      setIsLoading(false);
    });

    return () => unsub();
  }, [refreshProfile]);

  const signInWithGoogle = useCallback(async () => {
    // signInWithRedirect navigates away to Google and returns here after auth.
    // onAuthStateChanged will fire with the signed-in user automatically.
    await signInWithRedirect(firebaseAuth, googleProvider);
  }, []);

  const logout = useCallback(async () => {
    await signOut(firebaseAuth);
    setProfile(null);
    setFirebaseUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      profile,
      isLoading,
      isAuthenticated: Boolean(firebaseUser),
      signInWithGoogle,
      logout,
      refreshProfile,
      getIdToken,
    }),
    [firebaseUser, profile, isLoading, signInWithGoogle, logout, refreshProfile, getIdToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
