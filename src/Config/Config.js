import firebase from 'firebase'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB7AgERG-tI5-_g4mQmXFX9RI6LLDclvv4",
  authDomain: "ecommercereact-d3f04.firebaseapp.com",
  projectId: "ecommercereact-d3f04",
  storageBucket: "ecommercereact-d3f04.appspot.com",
  messagingSenderId: "407342713154",
  appId: "1:407342713154:web:99d62c2a24cd0bdb5fe0db",
  measurementId: "G-DEYZ914P1X"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const fs = firebase.firestore();
const storage = firebase.storage();

export {auth,fs,storage}