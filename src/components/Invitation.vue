<template>
  <v-card>
    <v-card-title class="headline grey lighten-2" primary-title>Share console</v-card-title>

    <v-card-text class="mt-3">Share this link to your friend and start sending LETTERS!!! 🚀🚀🚀</v-card-text>
    <v-card-text
      class="blue--text"
    >https://goldenletter-22f0b.firebaseapp.com/invitation/{{getUserID()}}</v-card-text>

    <v-divider></v-divider>

    <v-card-actions>
      <div class="flex-grow-1"></div>
      <v-btn color="primary" text @click="closeFromParent()">Done</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import firebase from "firebase";
export default {
  data() {
    return {};
  },
  methods: {
    closeFromParent() {
      this.$emit("CloseInvite", "dfdfa");
    },
    getUserID() {
      return firebase.auth().currentUser.uid;
    }
  }
};
</script>