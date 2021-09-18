<template>
  <div class="signin container">
    <v-container>
      <v-layout row wrap>
        <v-snackbar v-model="snackbar" :timeout="10000" top>
          <span>{{errorMesseage}}</span>
          <v-btn text color="error" @click.prevent="snackbar = false">Close</v-btn>
        </v-snackbar>
      </v-layout>
    </v-container>
    <v-row justify="center">
      <v-col cols="12" sm="10" md="8" lg="6">
        <v-card>
          <v-card-title>Sign In</v-card-title>
          <v-card-text>
            <v-form ref="signin_form">
              <v-text-field
                ref="email"
                v-model="email"
                :rules="[
              () => !!email || 'This field is required']"
                label="Email"
                counter="25"
                required
                clearable
              ></v-text-field>
              <v-text-field
                v-model="password"
                :append-icon="shouldShowPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :rules="[passRules.required]"
                :type="shouldShowPassword ? 'text' : 'password'"
                ref="password"
                label="Password"
                @click:append="shouldShowPassword = !shouldShowPassword"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn color="mx-2 error" @click="goToSignUp()">Sign Up</v-btn>
            <div class="flex-grow-1"></div>
            <v-btn color="mx-2 success" @click.prevent="login" :loading="loading">Sign In</v-btn>
          </v-card-actions>
          <v-divider></v-divider>
          <v-card-actions>
            <div class="flex-grow-1"></div>
            <v-btn
              :loading="loadGoogle"
              color="warning"
              class="mx-2 white--text"
              @click.prevent="signinWithGoogle()"
            >
              <v-icon left dark>mdi-google</v-icon>Google
            </v-btn>
            <v-btn
              :loading="loadFacebook"
              color="blue"
              class="mx-2 white--text"
              @click.prevent="registerWithFacebook()"
            >
              <v-icon left dark>mdi-facebook-box</v-icon>
              <span>facebook</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import axios from "axios";
import firebase from "firebase";
export default {
  data() {
    return {
      shouldShowPassword: false,
      passRules: {
        required: value => !!value || "Required.",
        min: v => v.length >= 8 || "Min 8 characters",
        emailMatch: () => "The email and password you entered don't match"
      },
      password: "",
      email: "",
      loading: false,
      errorMesseage: "",
      snackbar: false,
      loadFacebook: false,
      loadGoogle: false
    };
  },
  methods: {
    login() {
      if (this.$refs.signin_form.validate()) {
        this.loading = true;
        firebase
          .auth()
          .signInWithEmailAndPassword(this.email, this.password)
          .then(user => {
            // eslint-disable-next-line
            console.log(`Logged in for ${user.user.toJSON()}`);
            // * Fix navbar not reloading
            this.loading = false;
            this.$router.go({ path: this.$router.path });
          })
          .catch(err => {
            this.errorMesseage = err;
            this.snackbar = true;
            this.loading = false;
          });
      } else {
        this.errorMesseage = "Please fill up missing fields!";
        this.snackbar = true;
      }
    },
    signinWithGoogle() {
      this.loadGoogle = true;
      firebase
        .auth()
        .signInWithPopup(new firebase.auth.GoogleAuthProvider())
        .then(user => {
          // eslint-disable-next-line
          console.log(user.user.uid);
          const db = firebase.firestore();
          db.collection("users")
            .doc(user.user.uid)
            .set({
              uid: user.user.uid,
              ava_url: user.user.photoURL,
              full_name: user.user.displayName,
              email: user.user.email
            })
            .then(() => {
              this.loadGoogle = false;
              this.$router.go({ path: this.$router.path });
            })
            .catch(err => {
              this.errorMesseage = err;
              this.snackbar = true;
              this.loadGoogle = false;
            });
        })
        .catch(err => {
          this.errorMesseage = err;
          this.snackbar = true;
          this.loadGoogle = false;
        });
    },
    registerWithFacebook() {
      this.loadFacebook = true;
      var provider = new firebase.auth.FacebookAuthProvider();
      provider.addScope("email");
      firebase
        .auth()
        .signInWithPopup(provider)
        .then(user => {
          //   // eslint-disable-next-line
          //   console.log(user.user.uid);
          //   const db = firebase.firestore();
          //   db.collection("users")
          //     .doc(user.user.uid)
          //     .set({
          //       uid: user.user.uid,
          //       ava_url: user.user.photoURL + "?width=500&height=500",
          //       full_name: user.user.displayName,
          //       email: user.user.email
          //     })
          //     .then(() => {
          //       this.loadFacebook = false;
          //       this.$router.go({ path: this.$router.path });
          //     })
          //     .catch(err => {
          //       this.errorMesseage = err;
          //       this.snackbar = true;
          //       this.loadFacebook = false;
          //     });
          // })
          // .catch(err => {
          //   this.errorMesseage = err;
          //   this.snackbar = true;
          //   this.loadFacebook = false;
          // ! For facebook profile, download image first, there seems like no fix
          axios
            .get(user.user.photoURL + "?width=1000&height=1000", {
              responseType: "blob"
            })
            .then(responseFile => {
              firebase
                .storage()
                .ref("avatars/" + user.user.uid)
                .put(responseFile.data)
                .then(() => {
                  firebase
                    .storage()
                    .ref()
                    .child(`avatars/${user.user.uid}`)
                    .getDownloadURL()
                    .then(downloadURL => {
                      //   this.imgURL = downloadURL;
                      // eslint-disable-next-line
                      console.log(user.user.uid);
                      const db = firebase.firestore();
                      db.collection("users")
                        .doc(user.user.uid)
                        .set({
                          uid: user.user.uid,
                          ava_url: downloadURL,
                          full_name: user.user.displayName,
                          email: user.user.email
                        })
                        .then(() => {
                          this.loadFacebook = false;
                          // * Fix navbar not reloading

                          this.$router.go({ path: this.$router.path });
                          //   this.$router.go({ path: this.$router.path });
                        })
                        .catch(err => {
                          this.errorMesseage = err;
                          this.snackbar = true;
                          this.loadFacebook = false;
                        });
                    })
                    .catch(err => {
                      this.errorMesseage = err;
                      this.snackbar = true;
                      this.loadFacebook = false;
                    });
                })
                .catch(err => {
                  this.errorMesseage = err;
                  this.snackbar = true;
                  this.loadFacebook = false;
                });
            })
            .catch(err => {
              this.errorMesseage = err;
              this.snackbar = true;
              this.loadFacebook = false;
            });
        })
        .catch(err => {
          this.errorMesseage = err;
          this.snackbar = true;
          this.loadFacebook = false;
        });
    },
    goToSignUp() {
      this.$router.push("/signup");
    }
  }
};
</script>