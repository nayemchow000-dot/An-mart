import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { User } from '../types';

export function useFirebaseAuth() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Fetch additional user details from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              name: userData.name || firebaseUser.displayName || 'User',
              role: userData.role || 'customer',
              phone: userData.phone,
              createdAt: userData.createdAt,
              addresses: userData.addresses || [],
            });
          } else {
            // Fallback if no firestore doc exists yet
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              name: firebaseUser.displayName || 'User',
              role: 'customer',
              createdAt: new Date().toISOString(),
            });
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth state error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);
}
