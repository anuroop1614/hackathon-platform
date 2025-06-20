import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../firebase';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forceShow, setForceShow] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setForceShow(true);
        console.warn('AuthContext: Loading took too long, forcing UI to show.');
      }
    }, 5000); // 5 seconds
    return () => clearTimeout(timeout);
  }, [loading]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Fetch user role from backend
        try {
          const response = await fetch(`https://hackathon-platform-1.onrender.com/api/users/${firebaseUser.uid}`);
          if (response.ok) {
            const userData = await response.json();
            setUserRole(userData.role);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }

      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (email, password, role) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // Create user in backend with role
    await fetch('https://hackathon-platform-1.onrender.com/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: cred.user.uid,
        email: cred.user.email,
        role: role
      })
    });

    setUserRole(role);
    return { user: cred.user };
  };

  const signIn = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);

    // Fetch user role after successful login
    try {
      const response = await fetch(`https://hackathon-platform-1.onrender.com/api/users/${cred.user.uid}`);
      if (response.ok) {
        const userData = await response.json();
        setUserRole(userData.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }

    return { user: cred.user };
  };

  const signInWithGoogle = async (role) => {
    const cred = await signInWithPopup(auth, googleProvider);

    // Check if user already exists
    try {
      const response = await fetch(`https://hackathon-platform-1.onrender.com/api/users/${cred.user.uid}`);

      if (response.ok) {
        // User exists, get their role
        const userData = await response.json();
        setUserRole(userData.role);
      } else {
        // User doesn't exist, create with selected role
        await fetch('https://hackathon-platform-1.onrender.com/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: cred.user.uid,
            email: cred.user.email,
            role: role
          })
        });
        setUserRole(role);
      }
    } catch (error) {
      console.error('Error handling Google sign-in:', error);
      // Fallback: create user with selected role
      await fetch('https://hackathon-platform-1.onrender.com/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: cred.user.uid,
          email: cred.user.email,
          role: role
        })
      });
      setUserRole(role);
    }

    return { user: cred.user };
  };

  const signOutUser = () => firebaseSignOut(auth);

  return (
    <AuthContext.Provider value={{
      user,
      userRole,
      loading: loading && !forceShow,
      signUp,
      signIn,
      signInWithGoogle,
      signOut: signOutUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
