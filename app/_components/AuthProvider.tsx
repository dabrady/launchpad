'use client';

import { signInWithPopup } from "firebase/auth";
import { createContext } from 'react';

import { auth, GoogleAuthProvider } from "#/firebase";
import useAuth from '@/_components/utils/useAuth';

export const AUTH_CONTEXT = createContext();

export default function AuthProvider({ children }) {
  var currentUser = useAuth({
    onLogout: function login() {
      // Force a login
      signInWithPopup(auth, GoogleAuthProvider).then(() => console.log('signed in'));
    },
  });

  return (
    <AUTH_CONTEXT.Provider value={currentUser}>
      {children}
    </AUTH_CONTEXT.Provider>
  );
}
