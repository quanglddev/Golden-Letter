<template>
  <v-timeline :dense="$vuetify.breakpoint.mdAndDown" reverse>
    <v-timeline-item v-for="(letter, index) in group['letters']" :key="index" large>
      <template v-slot:icon>
        <v-avatar>
          <img :src="getPropsFor(whoseLetter(index), 'attendants_ava_url')" />
        </v-avatar>
      </template>
      <template v-slot:opposite>
        <span>{{getPropsFor(whoseLetter(index), 'attendants_full_name')}}</span>
      </template>

      <!-- green darken-4 -->
      <v-card
        class="mx-auto elevation-20"
        :color="determineColorForLetter(letter)"
        dark
        style="max-width: 400px;"
      >
        <v-row justify="space-between">
          <v-col cols="8">
            <v-card-text class="white--text">
              <div>
                <div class="title">{{letter.title.slice(-1)[0]}}</div>
                <div class="overline my-1 grey--text">{{letter.created.toDate().toString()}}</div>
              </div>
            </v-card-text>
            <v-card-actions>
              <v-dialog width="500">
                <template v-slot:activator="{ on }">
                  <v-btn
                    text
                    v-on="on"
                    @click.prevent="markLetterAsRead(letter, index)"
                    :disabled="shouldBtnDisabled(letter)"
                  >
                    {{determineButtonTitle(letter)}}
                    <v-icon right>{{determineButtonIcon(letter)}}</v-icon>
                  </v-btn>
                </template>
                <Envelope
                  :letter_sender="getPropsFor(whoseLetter(index), 'attendants_full_name')"
                  :letter_title="letter.title.slice(-1)[0]"
                  :letter_body="letter.body.slice(-1)[0]"
                  :letter_sender_ava="getPropsFor(whoseLetter(index), 'attendants_ava_url')"
                  :letter_attached_photos="letter.photos"
                />
                <!-- <v-card>
                  <p>Hello</p>
                </v-card>-->
              </v-dialog>
            </v-card-actions>
          </v-col>
        </v-row>
      </v-card>
    </v-timeline-item>
  </v-timeline>
</template>

<script>
import Envelope from "@/components/Envelope.vue";
import firebase from "firebase";
export default {
  name: "LettersTimeline",
  components: {
    Envelope
  },
  data() {
    return {
      dialog: false
    };
  },
  props: {
    group: Object,
    currentUserID: String
  },
  methods: {
    whoseLetter(letterIndex) {
      const writerID = this.group["letters"][letterIndex]["by_id"];
      if (writerID == this.currentUserID) return "user";
      else return "receiver";
    },
    getPropsFor(person, props) {
      const currentUserIndex = this.group.attendants_uid.indexOf(
        this.currentUserID
      );
      const receiverIndex = currentUserIndex == 0 ? 1 : 0;

      if (person == "user") return this.group[props][currentUserIndex];
      if (person == "receiver") return this.group[props][receiverIndex];
      return -1;
    },
    markLetterAsRead(letter, letterIndex) {
      // ! Don't mark as read if you're the writer
      const writerID = letter["by_id"];
      if (writerID == firebase.auth().currentUser.uid) {
        return;
      }
      const db = firebase.firestore();

      // TODO: MARK AS Read (well remove then re-add)
      db.collection("groups")
        .doc(this.group["gid"])
        .update({
          letters: firebase.firestore.FieldValue.arrayRemove(letter)
        })
        .then(() => {
          let newReadLetter = letter;
          newReadLetter.is_read = true;
          db.collection("groups")
            .doc(this.group["gid"])
            .update({
              letters: firebase.firestore.FieldValue.arrayUnion(newReadLetter)
            })
            .then(() => {
              // * Success
              this.group["letters"][letterIndex].is_read = true;
            });
        });
    },
    determineColorForLetter(letter) {
      if (letter.by_id == firebase.auth().currentUser.uid) {
        return "#385F73";
      } else {
        if (letter.is_read) {
          return "#385F73";
        } else {
          if (letter.time_restrict != 1) {
            // console.log(letter.time_restrict.toDate() > new Date());
            if (letter.time_restrict.toDate() > new Date()) {
              // Lock it
              return "green darken-4";
            } else {
              return "red darken-3";
            }
          }
          // if (letter.time_restrict > new Date().)
          return "red darken-3";
        }
      }
    },
    determineButtonIcon(letter) {
      if (letter.by_id == firebase.auth().currentUser.uid) {
        return "mdi-home-heart";
      } else {
        if (letter.is_read) {
          return "mdi-history";
        } else {
          if (letter.time_restrict != 1) {
            // console.log(letter.time_restrict.toDate() > new Date());
            if (letter.time_restrict.toDate() > new Date()) {
              // Lock it
              return "mdi-shield-lock";
            } else {
              return "mdi-book-open";
            }
          }
          // if (letter.time_restrict > new Date().)
          return "mdi-book-open";
        }
      }
    },
    determineButtonTitle(letter) {
      if (letter.by_id == firebase.auth().currentUser.uid) {
        return "Read my";
      } else {
        if (letter.is_read) {
          return "read again";
        } else {
          if (letter.time_restrict != 1) {
            // console.log(letter.time_restrict.toDate() > new Date());
            if (letter.time_restrict.toDate() > new Date()) {
              // Lock it
              return letter.time_restrict
                .toDate()
                .toISOString()
                .substr(0, 10);
            } else {
              return "read now";
            }
          }
          // if (letter.time_restrict > new Date().)
          return "read now";
        }
      }
    },
    shouldBtnDisabled(letter) {
      if (letter.by_id == firebase.auth().currentUser.uid) {
        return false;
      } else {
        if (letter.is_read) {
          return false;
        } else {
          if (letter.time_restrict != 1) {
            // console.log(letter.time_restrict.toDate() > new Date());
            if (letter.time_restrict.toDate() > new Date()) {
              // Lock it
              return true;
            } else {
              return false;
            }
          }
          // if (letter.time_restrict > new Date().)
          return false;
        }
      }
    }
  }
};
</script>