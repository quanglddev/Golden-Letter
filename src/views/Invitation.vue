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
          <v-card-title>
            You have been invited by:
            <br />
            <span class="font-weight-bold">{{name_of_inviter}}</span>
          </v-card-title>
          <v-card-title>Sign Up/In to connect:</v-card-title>
          <v-divider></v-divider>
          <v-card-actions>
            <p class="headline ma-2">With:</p>
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
            </v-form>
            <v-form ref="signin_form">
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
            <v-btn color="mx-2 error" @click.prevent="signIn()">Sign In</v-btn>
            <div class="flex-grow-1"></div>
            <v-btn color="mx-2 success" @click.prevent="register()" :loading="loading">Sign Up</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import firebase from "firebase";
import axios from "axios";
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
      loadGoogle: false,
      name_of_inviter: "...",
      inviter: null
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
      if (
        this.$refs.signup_form.validate() &&
        this.$refs.signin_form.validate()
      ) {
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
                    this.createNewGroup(user)
                      .then(() => {
                        this.snackbar = false;
                        this.loading = false;
                        // * Fix navbar not reloading

                        this.$router.push("/");
                        // this.$router.go({ path: this.$router.path });
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
              this.createNewGroup(user)
                .then(() => {
                  this.loadGoogle = false;
                  // * Fix navbar not reloading

                  this.$router.push("/");
                  // this.$router.go({ path: this.$router.path });
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
                          user.user.photoURL = downloadURL;
                          this.createNewGroup(user)
                            .then(() => {
                              this.loadFacebook = false;
                              // * Fix navbar not reloading

                              this.$router.push("/");
                              // this.$router.go({ path: this.$router.path });
                            })
                            .catch(err => {
                              this.errorMesseage = err;
                              this.snackbar = true;
                              this.loadFacebook = false;
                            });
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
    signIn() {
      if (this.$refs.signin_form.validate()) {
        this.loading = true;
        firebase
          .auth()
          .signInWithEmailAndPassword(this.email, this.password)
          .then(user => {
            user.user.console // eslint-disable-next-line
              .log(`Logged in for ${user.user.toJSON()}`);
            this.createNewGroup(user)
              .then(() => {
                this.loading = false;
                // * Fix navbar not reloading

                this.$router.push("/");
                // this.$router.go({ path: this.$router.path });
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
    },
    createNewGroup(newUser) {
      return new Promise((resolve, reject) => {
        const db = firebase.firestore();
        db.collection("groups")
          .add({
            attendants_ava_url: [
              newUser.user.photoURL,
              this.inviter["ava_url"]
            ],
            attendants_email: [newUser.user.email, this.inviter["email"]],
            attendants_full_name: [
              newUser.user.displayName,
              this.inviter["full_name"]
            ],
            attendants_uid: [newUser.user.uid, this.inviter["uid"]],
            letters: []
          })
          .then(docRef => {
            db.collection("groups")
              .doc(docRef.id)
              .update({
                gid: docRef.id
              })
              .then(() => {
                // ! Redirect to home page
                resolve();
              })
              .catch(err => {
                reject(err);
              });
          })
          .catch(err => {
            reject(err);
          });
      });
    }
  },
  created() {
    // ! GO THROUGH MANY TEST
    // * If the user already has an account, create a box and redirect right away
    // * If the user is themselves, redirect to dashboard
    // * If not, let them sign
    const inviter_id = this.$route.params.sender_id;

    if (inviter_id == firebase.auth().currentUser.uid) {
      this.$router.push("/");
    }
    const db = firebase.firestore();

    // * Also, if they already grouped, redirect
    db.collection("groups")
      .where("attendants_uid", "array-contains", inviter_id)
      .where(
        "attendants_uid",
        "array-contains",
        firebase.auth().currentUser.uid
      )
      .get()
      .then(querySnapshot => {
        if (querySnapshot.length >= 1) {
          alert("You are already connected")
          this.$router.push("/");
        }
      });

    // console.log(this.$route.params.sender_id);
    db.collection("users")
      .doc(inviter_id)
      .get()
      .then(doc => {
        if (doc.exists) {
          this.name_of_inviter = doc.data()["full_name"];
          this.inviter = doc.data();
        } else {
          this.errorMesseage =
            "The invitation is not available, please try again!";
          this.snackbar = true;
          this.loadFacebook = false;
        }
      })
      .catch(err => {
        this.errorMesseage = err;
        this.snackbar = true;
        this.loadFacebook = false;
      });
  }
};
</script>