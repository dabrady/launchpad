'use client';

import { signInWithPopup, User } from "firebase/auth";
import { createContext } from 'react';

import { auth, GoogleAuthProvider } from "#/firebase";
import useAuth from '@/_components/utils/useAuth';

import Loading from '@/loading';

export const AUTH_CONTEXT = createContext({} as User);

interface Props {
  children: React.ReactNode;
}
export default function AuthGuard({ children }: Props) {
  var currentUser = useAuth({
    onLogout: function login() {
      // Force a login
      signInWithPopup(auth, GoogleAuthProvider).then(() => console.log('signed in'));
    },
  });

  if (!currentUser) {
    return <Loading />;
  }

  return (
    <AUTH_CONTEXT.Provider value={currentUser}>
      {children}
    </AUTH_CONTEXT.Provider>
  );
}
