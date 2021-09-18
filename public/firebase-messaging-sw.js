importScripts('https://www.gstatic.com/firebasejs/6.4.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/6.4.1/firebase-messaging.js');

var firebaseConfig = {
    apiKey: "AIzaSyC5cEz7tyAf20SZ_BhtNaEwi2Rn8Qs4CGU",
    authDomain: "goldenletter-22f0b.firebaseapp.com",
    databaseURL: "https://goldenletter-22f0b.firebaseio.com",
    projectId: "goldenletter-22f0b",
    storageBucket: "goldenletter-22f0b.appspot.com",
    messagingSenderId: "1034355181357", 
    appId: "1:1034355181357:web:48158f9778c662a3"
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
