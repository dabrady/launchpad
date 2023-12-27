import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";

import { auth } from "#/firebase";

export default function useAuth({
  onAuthenticated,
  onLogout,
}: {
  onAuthenticated?: (user: User) => void;
  onLogout?: () => void;
}) {
  var [currentUser, setCurrentUser] = useState<null | User>(null);
  useEffect(function monitorAuthentication() {
    // This triggers on mount as well, to get initial user authentication status..
    return onAuthStateChanged(auth, function react(user: null | User) {
      if (user) {
        setCurrentUser(user);
        // User is signed in.
        if (onAuthenticated) {
          onAuthenticated(user);
        }
      } else {
        // User is signed out.
        console.log("user is logged out");
        if (onLogout) {
          onLogout();
        }
      }
    });
  }, []);
  return currentUser;
}
