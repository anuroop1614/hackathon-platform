import { useState, useEffect } from 'react'
import { auth, googleProvider } from '../firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const signUp = async (email, password) => {
    await createUserWithEmailAndPassword(auth, email, password)
    return { user: auth.currentUser }
  }

  const signIn = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password)
    return { user: auth.currentUser }
  }

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider)
    return { user: result.user }
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  return {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut
  }
}
