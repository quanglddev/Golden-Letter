import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify';
import firebase from 'firebase';
import './plugins/firebase_init';
import { firestorePlugin } from 'vuefire';
import 'viewerjs/dist/viewer.css'
import Viewer from 'v-viewer'
Vue.use(Viewer)

Vue.use(firestorePlugin);

Vue.config.productionTip = false

let messaging;

try {
  messaging = firebase.messaging()
}
catch {
  /* eslint-disable */
  console.log("Doesn't support push notification")
  messaging = null
}

let app;
firebase.auth().onAuthStateChanged(function (user) {
  /* eslint-disable */
  if (user) {
    if (messaging) {
      if (firebase.messaging.isSupported()) {
        // ! Configure FCM token on every new logged in
        messaging.requestPermission().then(function () {
          // * Cool we have fcm now
          return messaging.getToken()
        })
          .then(token => {
            console.log(token)
            firebase.firestore().collection('users').doc(user.uid).update({
              fcmToken: token
            })
          })
          .catch(err => {
            // TODO: handle error here
            alert(err)
          })

        messaging.onMessage(function (payload) {
          console.log("On message:", payload)
        })

        messaging.onTokenRefresh(() => {
          messaging.getToken().then(token => {
            console.log(token)
            firebase.firestore().collection('users').doc(user.uid).update({
              fcmToken: token
            })
          })
            .catch(err => {
              // TODO: handle error here
              alert(err)
            })
        })
      }
    }
    console.log(user.email)
    console.log(user.uid)
  }
  if (!app) {
    /* eslint-disable no-new */
    app = new Vue({
      router,
      vuetify,
      render: h => h(App)
    }).$mount('#app')
  }


  // ! Fix for iPhone
  this.$router.go({ path: this.$router.path });
});