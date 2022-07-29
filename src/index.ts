import { FirebaseOptions, initializeApp } from 'firebase/app';
import './router';

const firebaseConfig: FirebaseOptions = {
  apiKey: 'AIzaSyBkvTfAcVuKxT_uLc6wj66I4uWppK-hJYE',
  authDomain: 'rbb-cleaning.firebaseapp.com',
  databaseURL: 'https://rbb-cleaning-default-rtdb.firebaseio.com',
  projectId: 'rbb-cleaning',
  storageBucket: 'rbb-cleaning.appspot.com',
  messagingSenderId: '751365085821',
  appId: '1:751365085821:web:88bf4fd16ae090b1036f14',
};

initializeApp(firebaseConfig);
