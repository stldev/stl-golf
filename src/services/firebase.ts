import { FirebaseOptions, initializeApp } from 'firebase/app';

const firebaseConfig: FirebaseOptions = {
  apiKey: 'AIzaSyBDVyGbyl7fHEKmPOkVGR8mjgLgqigj2zY',
  authDomain: 'woodchopper-golf.firebaseapp.com',
  databaseURL: 'https://woodchopper-golf-default-rtdb.firebaseio.com',
  projectId: 'woodchopper-golf',
  storageBucket: 'woodchopper-golf.appspot.com',
  messagingSenderId: '1038321925318',
  appId: '1:1038321925318:web:5d1637514a022894cbebc7',
};

initializeApp(firebaseConfig);
