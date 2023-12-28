import { FirebaseOptions, getApp, initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider as _GoogleAuthProvider,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyBDfuQqSECA3H8KCF4afIArtG0-G69r1as",
  authDomain: "launchpad-2e510.firebaseapp.com",
  projectId: "launchpad-2e510",
  storageBucket: "launchpad-2e510.appspot.com",
  messagingSenderId: "382262848299",
  appId: "1:382262848299:web:bcea83b666a342c410f36e"
};

export const firebase = (function createFirebaseApp(config: FirebaseOptions) {
  try {
    return getApp();
  } catch {
    return initializeApp(config);
  }
})(firebaseConfig);

export const firestore = getFirestore(firebase, 'europe-west1');
export const functions = getFunctions(firebase, 'europe-west1');
export const auth = getAuth(firebase);
export const GoogleAuthProvider = new _GoogleAuthProvider();
