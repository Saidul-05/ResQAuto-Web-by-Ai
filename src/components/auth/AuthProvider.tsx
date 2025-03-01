import React, { createContext, useContext, useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  User as FirebaseUser,
  updateProfile,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-bucket.appspot.com",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef",
};

// Initialize Firebase (with safeguards for development)
let app;
let auth;
let db;
let googleProvider;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
} catch (error) {
  console.error("Firebase initialization error", error);
}

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: "user" | "mechanic" | "admin";
  phone?: string;
  location?: string;
}

interface AuthContextType {
  currentUser: UserData | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<UserData>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
    role: "user" | "mechanic",
  ) => Promise<UserData>;
  signInWithGoogle: () => Promise<UserData>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Convert Firebase user to our UserData format
  const formatUser = async (user: FirebaseUser): Promise<UserData> => {
    // Get additional user data from Firestore
    let userData: Partial<UserData> = {};
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        userData = userDoc.data() as Partial<UserData>;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: userData.role || "user",
      phone: userData.phone,
      location: userData.location,
    };
  };

  // Listen for auth state changes
  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const formattedUser = await formatUser(user);
        setCurrentUser(formattedUser);
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<UserData> => {
    if (!auth) throw new Error("Firebase auth not initialized");

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const formattedUser = await formatUser(result.user);
      setCurrentUser(formattedUser);
      return formattedUser;
    } catch (error: any) {
      console.error("Sign in error:", error);
      throw new Error(error.message || "Failed to sign in");
    }
  };

  // Sign up with email and password
  const signUp = async (
    email: string,
    password: string,
    displayName: string,
    role: "user" | "mechanic",
  ): Promise<UserData> => {
    if (!auth || !db) throw new Error("Firebase not initialized");

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Update profile with display name
      await updateProfile(result.user, { displayName });

      // Create user document in Firestore
      const userData: UserData = {
        uid: result.user.uid,
        email: result.user.email,
        displayName,
        photoURL: null,
        role,
      };

      await setDoc(doc(db, "users", result.user.uid), userData);

      setCurrentUser(userData);
      return userData;
    } catch (error: any) {
      console.error("Sign up error:", error);
      throw new Error(error.message || "Failed to sign up");
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (): Promise<UserData> => {
    if (!auth || !db || !googleProvider)
      throw new Error("Firebase not initialized");

    try {
      const result = await signInWithPopup(auth, googleProvider);

      // Check if user exists in Firestore
      const userDocRef = doc(db, "users", result.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create new user document if it doesn't exist
        const userData: UserData = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          role: "user", // Default role for Google sign-ins
        };

        await setDoc(userDocRef, userData);
        setCurrentUser(userData);
        return userData;
      } else {
        // User exists, return existing data
        const userData = userDoc.data() as UserData;
        setCurrentUser(userData);
        return userData;
      }
    } catch (error: any) {
      console.error("Google sign in error:", error);
      throw new Error(error.message || "Failed to sign in with Google");
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    if (!auth) throw new Error("Firebase auth not initialized");

    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (error: any) {
      console.error("Logout error:", error);
      throw new Error(error.message || "Failed to log out");
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<void> => {
    if (!auth) throw new Error("Firebase auth not initialized");

    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error("Password reset error:", error);
      throw new Error(error.message || "Failed to send password reset email");
    }
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<UserData>): Promise<void> => {
    if (!auth || !db || !currentUser)
      throw new Error("Not authenticated or Firebase not initialized");

    try {
      // Update Firestore document
      await setDoc(
        doc(db, "users", currentUser.uid),
        { ...currentUser, ...data },
        { merge: true },
      );

      // Update local state
      setCurrentUser({ ...currentUser, ...data });

      // Update Firebase auth profile if display name or photo URL changed
      if (auth.currentUser && (data.displayName || data.photoURL)) {
        await updateProfile(auth.currentUser, {
          displayName: data.displayName || currentUser.displayName,
          photoURL: data.photoURL || currentUser.photoURL,
        });
      }
    } catch (error: any) {
      console.error("Profile update error:", error);
      throw new Error(error.message || "Failed to update profile");
    }
  };

  const value = {
    currentUser,
    isLoading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
