<template>
  <div class="letters container">
    <v-container>
      <v-layout row wrap>
        <v-snackbar v-model="snackbar" :timeout="10000" top>
          <span>{{errorMessage}}</span>
          <v-btn text color="error" @click.prevent="snackbar = false">Close</v-btn>
        </v-snackbar>
        <v-snackbar v-model="snackbar_success" :timeout="10000" bottom>
          <span>Letter successfully sent!</span>
          <v-btn text color="success" @click.prevent="snackbar_success = false">Awesome!</v-btn>
        </v-snackbar>
      </v-layout>
      <v-layout row wrap>
        <v-flex xs12>
          <v-sheet elevation="10" class="px-2">
            <v-chip-group active-class="primary--text" v-model="selectedGroupIndex">
              <v-chip pill v-for="(group, index) in groups" :key="group.gid" class="ma-3">
                <v-badge>
                  <template
                    v-slot:badge
                  >{{getUnreadLetters(group['letters'])}}/{{group['letters'].length}}</template>
                  <v-avatar left>
                    <v-img :src="group['attendants_ava_url'][receiversIndexes[index]]"></v-img>
                  </v-avatar>
                  {{ group['attendants_full_name'][receiversIndexes[index]] }}
                </v-badge>
              </v-chip>
              <v-chip
                pill
                class="ma-3"
                v-if="groups.length != 0 || groupIsEmpty"
                @click="openInvitation()"
              >
                <v-avatar left>
                  <v-img
                    src="data:image/png;base64,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"
                  ></v-img>
                </v-avatar>Add friend
              </v-chip>
            </v-chip-group>
          </v-sheet>
        </v-flex>
      </v-layout>
      <v-layout row wrap>
        <v-flex xs12 md6>
          <v-btn
            class="my-3 pa-3"
            dark
            large
            color="#8438A7"
            v-if="selectedGroupIndex != undefined && selectedGroupIndex != groups.length"
            @click="writingNew = !writingNew"
          >
            <v-icon dark left>mdi-pencil</v-icon>
            Message {{groups[selectedGroupIndex]['attendants_full_name'][receiversIndexes[selectedGroupIndex]]}}
          </v-btn>
          <NewLetter
            v-if="selectedGroupIndex != undefined && selectedGroupIndex != groups.length"
            :writingNew="writingNew"
            :group="groups[selectedGroupIndex]"
            :currentUserID="user.uid"
          />
        </v-flex>
        <v-flex xs12 md6>
          <v-card
            v-if="selectedGroupIndex != undefined && selectedGroupIndex != groups.length"
            class="pa-5 my-3"
            :max-height="getAppropriateHeightForTimeline()"
            style="overflow-y: auto"
          >
            <LettersTimeline :group="groups[selectedGroupIndex]" :currentUserID="user.uid" />
          </v-card>
        </v-flex>
      </v-layout>
      <v-dialog v-model="dialog" width="500">
        <template v-slot:activator="{ on }">
          <v-btn
            color="red lighten-2"
            dark
            v-on="on"
            style="display: none"
            ref="dummyInviteBtn"
          >Click Me</v-btn>
        </template>
        <Invitation @CloseInvite="dialog = false"/>
      </v-dialog>
    </v-container>
  </div>
</template>

<script>
import firebase from "firebase";
import LettersTimeline from "@/components/LettersTimeline.vue";
import NewLetter from "@/components/NewLetter.vue";
import Invitation from "@/components/Invitation.vue";
export default {
  components: {
    LettersTimeline,
    NewLetter,
    Invitation
  },
  data() {
    return {
      groups: [],
      selectedGroupIndex: null,
      user: null,
      receiversIndexes: [],
      writingNew: false,
      snackbar: false,
      errorMessage: "",
      snackbar_success: false,
      groupIsEmpty: false,
      dialog: false
    };
  },
  methods: {
    sortLettersByDate() {
      this.groups.forEach(group => {
        group.letters.sort((letter1, letter2) => {
          if (letter1.created.toDate() < letter2.created.toDate()) return 1;
          if (letter1.created.toDate() > letter2.created.toDate()) return -1;
          return 0;
        });
      });
    },
    whoareTheReceivers() {
      this.receiversIndexes = [];
      this.groups.forEach(group => {
        const selfIndex = group["attendants_uid"].indexOf(this.user.uid);
        const receiverIndex = selfIndex == 0 ? 1 : 0;
        this.receiversIndexes.push(receiverIndex);
      });
    },
    getAppropriateHeightForTimeline() {
      return screen.height - 280;
    },
    getUnreadLetters(letters) {
      // console.log(letters)
      const currentUserID = firebase.auth().currentUser.uid;
      const result = letters.reduce((accumulator, letter) => {
        return (
          accumulator +
          (letter.is_read ? 0 : letter.by_id == currentUserID ? 0 : 1)
        );
      }, 0);
      return result;
    },
    openInvitation() {
      this.$refs.dummyInviteBtn.click();
    }
  },
  created() {
    this.user = firebase.auth().currentUser;

    // ! Getting groups
    const db = firebase.firestore();
    db.collection("groups").onSnapshot(res => {
      const changes = res.docChanges();
      changes.forEach(change => {
        if (change.type === "added") {
          if (change.doc.data()["attendants_uid"].includes(this.user.uid)) {
            this.groups.push({
              ...change.doc.data()
            });
          }
        }
      });

      this.sortLettersByDate();

      this.whoareTheReceivers();

      if (this.groups.length == 0) {
        this.groupIsEmpty = true;
      } else {
        this.groupIsEmpty = false;
      }
    });

    this.$on("OpenAppropriateSnack", response => {
      if (response == true) {
        this.snackbar_success = true;
        this.writingNew = false;
      } else {
        this.errorMessage = response;
        this.snackbar = true;
      }
    });
  }
};
</script>