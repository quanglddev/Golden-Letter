import firebase from 'firebase';
import 'firebase/firestore';

import firebaseConfig from '@/plugins/firebase_config';

// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);
export default firebaseApp.firestore();
