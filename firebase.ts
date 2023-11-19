import { FirebaseOptions, getApp, initializeApp } from "firebase/app";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyBRdum-eBB1GDhg4YrfMPNVlsI21OFe_jk",
  authDomain: "brady-sandbox-877da.firebaseapp.com",
  projectId: "brady-sandbox-877da",
  storageBucket: "brady-sandbox-877da.appspot.com",
  messagingSenderId: "148555366920",
  appId: "1:148555366920:web:40ce542bfbd5ae0243c7bd"
};

export const firebase = (function createFirebaseApp(config: FirebaseOptions) {
  try {
    return getApp();
  } catch {
    return initializeApp(config);
  }
})(firebaseConfig);
