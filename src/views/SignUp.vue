<template>
  <div class="signup container">
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
          <v-card-title>Sign Up</v-card-title>
          <v-card-text>
            <v-form ref="signup_form">
              <v-file-input
                v-model="file"
                :rules="[value => !value || value.size < 5000000 || 'Avatar size should be less than 5 MB!']"
                accept="image/png, image/jpeg, image/jpg"
                placeholder="Pick an avatar"
                prepend-icon="mdi-camera"
                label="Avatar"
                required
                show-size
                hint="We promise to keep this data secured"
                counter
              ></v-file-input>
              <v-text-field
                ref="name"
                v-model="name"
                :rules="[() => !!name || 'This field is required']"
                label="Full Name"
                required
                hint="For your friends to identify you, please use your real name"
                clearable
              ></v-text-field>
              <v-text-field
                ref="email"
                v-model="email"
                :rules="[
              () => !!email || 'This field is required',
              () => !!email && email.length <= 25 || 'Email must be less than 25 characters']"
                label="Email"
                counter="25"
                required
                clearable
                hint="This is how you send and receive letters"
              ></v-text-field>
              <v-text-field
                v-model="password"
                :append-icon="shouldShowPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :rules="[passRules.required, passRules.min]"
                :type="shouldShowPassword ? 'text' : 'password'"
                ref="password"
                label="Password"
                hint="At least 8 characters"
                counter
                @click:append="shouldShowPassword = !shouldShowPassword"
                loading
              >
                <template v-slot:progress>
                  <v-progress-linear :value="progress" :color="color" absolute height="7"></v-progress-linear>
                </template>
              </v-text-field>
            </v-form>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn color="mx-2 error" @click="goToSignIn()">Sign In</v-btn>
            <div class="flex-grow-1"></div>
            <v-btn color="mx-2 success" @click.prevent="register" :loading="loading">Sign Up</v-btn>
          </v-card-actions>
          <v-divider></v-divider>
          <v-card-actions>
            <div class="flex-grow-1"></div>
            <v-btn
              :loading="loadGoogle"
              color="warning"
              class="mx-2 white--text"
              @click.prevent="registerWithGoogle()"
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
      name: "",
      email: "",
      loading: false,
      errorMesseage: "",
      snackbar: false,
      file: [],
      imgURL: "",
      loadFacebook: false,
      loadGoogle: false
    };
  },
  computed: {
    progress() {
      return Math.min(100, this.password.length * 12.5);
    },
    color() {
      return ["error", "warning", "success"][Math.floor(this.progress / 40)];
    }
  },
  methods: {
    register() {
      if (this.$refs.signup_form.validate()) {
        this.loading = true;
        firebase
          .auth()
          .createUserWithEmailAndPassword(this.email, this.password)
          .then(user => {
            // eslint-disable-next-line
            console.log(`Account created for ${user.user}`);

            // ! Upload avatar to storage
            this.uploadAvatarToStorage(user.user.uid)
              .then(() => {
                const newUser = {
                  uid: user.user.uid,
                  ava_url: this.imgURL,
                  full_name: this.name,
                  email: this.email
                };
                const db = firebase.firestore();
                db.collection("users")
                  .doc(user.user.uid)
                  .set(newUser)
                  .then(() => {
                    this.snackbar = false;
                    this.$router.go({ path: this.$router.path });
                  })
                  .catch(err => {
                    this.errorMesseage = err;
                    this.snackbar = true;
                    this.loading = false;
                  });
              })
              .catch(err => {
                this.errorMesseage = err;
                this.snackbar = true;
                this.loading = false;
              });
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
    registerWithGoogle() {
      // TODO: unfinished, upload to firestore also
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
              this.loading = false;
            });
        })
        .catch(err => {
          this.errorMesseage = err;
          this.snackbar = true;
          this.loading = false;
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
          // eslint-disable-next-line
          // console.log(user.user.uid);
          // const db = firebase.firestore();
          // db.collection("users")
          //   .doc(user.user.uid)
          //   .set({
          //     uid: user.user.uid,
          //     ava_url: user.user.photoURL + "?width=500&height=500",
          //     full_name: user.user.displayName,
          //     email: user.user.email
          //   })
          //   .then(() => {
          //     this.loadFacebook = false;
          //     this.$router.go({ path: this.$router.path });
          //   })
          //   .catch(err => {
          //     this.errorMesseage = err;
          //     this.snackbar = true;
          //     this.loadFacebook = false;
          //   });
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
    goToSignIn() {
      this.$router.push("/dashboard");
    },
    uploadAvatarToStorage(uid) {
      return new Promise((resolve, error) => {
        firebase
          .storage()
          .ref("avatars/" + uid + "." + this.file.name.split(".")[1])
          .put(this.file)
          .then(() => {
            firebase
              .storage()
              .ref()
              .child(`avatars/${uid + "." + this.file.name.split(".")[1]}`)
              .getDownloadURL()
              .then(downloadURL => {
                this.imgURL = downloadURL;
                resolve();
              })
              .catch(err => {
                error(err);
              });
          })
          .catch(err => {
            error(err);
          });
      });
    }
  }
};
</script>