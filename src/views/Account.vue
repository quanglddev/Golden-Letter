<template>
  <div class="account container">
    <v-container>
      <p class="body-1 grey--text">Account page</p>
      <v-card class="mx-auto" max-width="434" tile>
        <v-img height="100%" src="https://cdn.vuetifyjs.com/images/cards/server-room.jpg">
          <v-row align="end" class="fill-height">
            <v-col align-self="start" class="pa-0" cols="12">
              <v-avatar class="profile" color="grey" size="164" tile>
                <v-img v-if="user" :src="user.ava_url"></v-img>
              </v-avatar>
            </v-col>
            <v-col class="py-0">
              <v-list-item color="rgba(0, 0, 0, .4)" dark>
                <v-list-item-content>
                  <v-list-item-title class="title" v-if="user">{{user.full_name}}</v-list-item-title>
                  <v-list-item-subtitle v-if="user">ID: {{user.uid}}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-col>
          </v-row>
        </v-img>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import firebase from 'firebase'
export default {
  data() {
    return {
      user: null
    }
  },
  created() {
    const db = firebase.firestore()
    const currentUserID = firebase.auth().currentUser.uid
    db.collection('users').doc(currentUserID).get().then(doc => {
      this.user = doc.data()
    })
  }
}
</script>
