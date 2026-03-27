import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDrdLaKis9v2Yu1MzGU22VFKqZ5CL-u5ho",
    authDomain: "financer-e1a78.firebaseapp.com",
    projectId: "financer-e1a78",
    storageBucket: "financer-e1a78.firebasestorage.app",
    messagingSenderId: "249334360577",
    appId: "1:249334360577:web:ee9a848d52c947cd452e00"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()
export const db = getFirestore(app)