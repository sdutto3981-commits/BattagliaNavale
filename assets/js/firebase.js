import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  set,
  push,
  query,
  orderByChild,
  limitToLast,
  onValue,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";
import {
  getAuth,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
  linkWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDux-C2znjXzD1x-MR6t340GTgUhk6m9Ho",
  authDomain: "battaglianavale-f9c34.firebaseapp.com",
  databaseURL: "https://battaglianavale-f9c34-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "battaglianavale-f9c34",
  storageBucket: "battaglianavale-f9c34.firebasestorage.app",
  messagingSenderId: "359622454307",
  appId: "1:359622454307:web:fcbd7f48ec3228198fd596",
  measurementId: "G-KB1X9FH4QT",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

await signInAnonymously(auth);

console.log(
  "Utente attuale:",
  auth.currentUser?.uid,
  auth.currentUser?.isAnonymous ? "(anonimo)" : "(Google)",
);

export function getCurrentUser() {
  return auth.currentUser;
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}


export async function signInWithGoogle() {
  try {
    if (auth.currentUser && auth.currentUser.isAnonymous) {
      await linkWithPopup(auth.currentUser, googleProvider);
    } else {
      await signInWithPopup(auth, googleProvider);
    }
    return { success: true };
  } catch (error) {
    if (error.code === "auth/credential-already-in-use") {
      try {
        await signInWithPopup(auth, googleProvider);
        return { success: true };
      } catch (innerError) {
        return { success: false, errorCode: innerError.code, errorMessage: innerError.message };
      }
    }
    return { success: false, errorCode: error.code, errorMessage: error.message };
  }
}

export async function signOutToAnonymous() {
  await signOut(auth);
  await signInAnonymously(auth);
}

export async function getUsername(uid) {
  const snapshot = await get(ref(db, `users/${uid}`));
  if (snapshot.exists() && snapshot.val().username) {
    return snapshot.val().username;
  }
  return null;
}

export async function saveUsername(user, username) {
  await set(ref(db, `users/${user.uid}`), {
    username: username,
    email: user.email || null,
    updatedAt: Date.now(),
  });
}

export async function saveScore(nome, punteggio, uid) {
  const nuovoPunteggio = push(ref(db, "leaderboard"));
  await set(nuovoPunteggio, {
    nome: nome,
    punteggio: punteggio,
    timestamp: Date.now(),
    uid: uid,
  });
}


export function subscribeToLeaderboard(callback) {
  const leaderboardQuery = query(ref(db, "leaderboard"), orderByChild("punteggio"), limitToLast(10));
  onValue(leaderboardQuery, (snapshot) => {
    let entries = [];
    snapshot.forEach((childSnapshot) => {
      entries.push(childSnapshot.val());
    });
    entries.reverse();
    callback(entries);
  });
}