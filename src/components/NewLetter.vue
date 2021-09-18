<template>
  <v-card class="my-3 pa-0 mr-3" color="primary" dark v-if="writingNew">
    <v-card-title>
      <v-list-item class="grow">
        <v-list-item-avatar color="grey darken-3">
          <v-img class="elevation-6" :src="getPropsFor('receiver', 'attendants_ava_url')"></v-img>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>To {{getPropsFor('receiver', 'attendants_full_name')}}:</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-card-title>

    <v-card-text class="body-2">
      <v-form ref="new_letter_form">
        <v-text-field
          v-model="new_letter_title"
          :rules="[
        value => !!value || 'Required.',
        () => new_letter_title.length <= 50 || 'Max 50 characters']"
          counter
          maxlength="50"
          hint="This should be as concise as possible"
          label="Title"
        ></v-text-field>

        <v-textarea
          placeholder="You can write as long as you like!!!"
          auto-grow
          counter
          v-model="new_letter_body"
          :rules="[value => !!value || 'At lease say something nice']"
        ></v-textarea>

        <v-menu
          v-model="menu2"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          full-width
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              v-model="date"
              label="When should the letter be opened?"
              prepend-icon="mdi-alarm-check"
              readonly
              v-on="on"
              hint="YYYY/MM/DD format"
            ></v-text-field>
          </template>
          <v-date-picker v-model="date" @input="menu2 = false"></v-date-picker>
        </v-menu>

        <v-file-input
          show-size
          counter
          multiple
          label="Attached photos (optional)"
          prepend-icon="mdi-image-plus"
          v-model="attached_pictures"
          accept="image/png, image/jpeg, image/jpg"
          hint="We promise to keep this data secured"
        ></v-file-input>
      </v-form>
    </v-card-text>

    <v-card-actions>
      <v-list-item class="grow">
        <v-list-item-avatar color="grey darken-3">
          <v-img class="elevation-6" :src="getPropsFor('user', 'attendants_ava_url')"></v-img>
        </v-list-item-avatar>

        <v-list-item-content>
          <!-- {{getPropsFor('user', 'attendants_full_name')}} -->
          <v-list-item-title>From me</v-list-item-title>
        </v-list-item-content>

        <v-btn class="mx-2" fab dark color="warning" @click.prevent="previewNewLetter()">
          <v-icon dark>mdi-eye</v-icon>
        </v-btn>
        <!-- <v-btn class="mx-2" fab dark color="error">
          <v-icon dark>mdi-alarm-check</v-icon>
        </v-btn>-->
        <v-dialog width="500">
          <template v-slot:activator="{ on }">
            <v-btn text v-on="on" ref="dummyBtn" style="display: none;"></v-btn>
          </template>
          <Envelope
            :letter_sender="getPropsFor('user', 'attendants_full_name')"
            :letter_title="new_letter_title"
            :letter_body="new_letter_body"
            :letter_sender_ava="getPropsFor('user', 'attendants_ava_url')"
            :letter_attached_photos="attached_pictures"
          />
        </v-dialog>
        <v-btn
          class="mx-2"
          fab
          dark
          color="teal"
          @click.prevent="confirm_and_send_letter()"
          :disabled="dialog"
          :loading="dialog"
        >
          <v-icon dark>mdi-send</v-icon>
        </v-btn>
        <v-dialog v-model="dialog" persistent>
          <v-card color="primary" dark>
            <v-card-text>
              Sending your letter 💌 🛩🚀🚁
              <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-list-item>
    </v-card-actions>
  </v-card>
</template>

<script>
import firebase from "firebase";
import Envelope from "@/components/Envelope.vue";
export default {
  name: "NewLetter",
  components: {
    Envelope
  },
  data() {
    return {
      new_letter_title: "",
      new_letter_body: "",
      attached_pictures: [],
      menu2: false,
      date: new Date().toISOString().substr(0, 10),
      dialog: false
    };
  },
  props: {
    writingNew: Boolean,
    currentUserID: String,
    group: Object
  },
  methods: {
    getPropsFor(person, props) {
      const currentUserIndex = this.group.attendants_uid.indexOf(
        this.currentUserID
      );
      const receiverIndex = currentUserIndex == 0 ? 1 : 0;

      if (person == "user") return this.group[props][currentUserIndex];
      if (person == "receiver") return this.group[props][receiverIndex];
      return -1;
    },
    previewNewLetter() {
      if (this.$refs.new_letter_form.validate()) {
        const elem = this.$refs.dummyBtn;
        elem.click();
      }
    },
    confirm_and_send_letter() {
      if (this.$refs.new_letter_form.validate()) {
        this.dialog = true;
        // setTimeout(() => {
        //   this.dialog = false
        // }, 3000)
        this.send_letter();
      }
    },
    upload_attached_photos_and_get_urls() {
      String.prototype.hashCode = function() {
        var hash = 0,
          i,
          chr;
        if (this.length === 0) return hash;
        for (i = 0; i < this.length; i++) {
          chr = this.charCodeAt(i);
          hash = (hash << 5) - hash + chr;
          hash |= 0; // Convert to 32bit integer
        }
        return hash;
      };
      return new Promise((resolve, error) => {
        let count = 0;
        let result = [];
        if (this.attached_pictures.length == 0) {
          resolve(result);
        }
        this.attached_pictures.forEach((attached_photo, index) => {
          firebase
            .storage()
            .ref(
              "attached_photos/" +
                this.new_letter_title +
                " - " +
                attached_photo.name.hashCode().toString() +
                " - " +
                index.toString() +
                " - " +
                this.new_letter_body.hashCode().toString() +
                "." +
                attached_photo.name.split(".")[1]
            )
            .put(attached_photo)
            .then(() => {
              count += 1;
              if (count == this.attached_pictures.length) {
                this.attached_pictures.forEach((attached_pic, min_index) => {
                  firebase
                    .storage()
                    .ref()
                    .child(
                      "attached_photos/" +
                        this.new_letter_title +
                        " - " +
                        attached_pic.name.hashCode().toString() +
                        " - " +
                        min_index.toString() +
                        " - " +
                        this.new_letter_body.hashCode().toString() +
                        "." +
                        attached_pic.name.split(".")[1]
                    )
                    .getDownloadURL()
                    .then(downloadURL => {
                      result.push(downloadURL);
                      if (result.length == this.attached_pictures.length) {
                        resolve(result);
                      }
                    })
                    .catch(err => {
                      error(err);
                    });
                });
              }
            })
            .catch(err => {
              error(err);
            });
        });
      });
    },
    send_letter() {
      const db = firebase.firestore();

      this.upload_attached_photos_and_get_urls()
        .then(photo_urls => {
          const data = {
            body: [this.new_letter_body],
            title: [this.new_letter_title],
            by_id: this.currentUserID,
            created: firebase.firestore.Timestamp.fromDate(new Date()),
            time_restrict: firebase.firestore.Timestamp.fromDate(
              new Date(this.date)
            ),
            is_read: false,
            lid: this.generateQuickUUID(),
            photos: photo_urls
          };

          db.collection("groups")
            .doc(this.group.gid)
            .update({
              letters: firebase.firestore.FieldValue.arrayUnion(data)
            })
            .then(() => {
              this.dialog = false;
              this.$parent.$emit("OpenAppropriateSnack", true);

              this.group["letters"].push(data);

              this.sortLettersByDate();

              this.new_letter_title = "";
              this.new_letter_body = "";
              this.attached_pictures = [];
              this.date = new Date().toISOString().substr(0, 10);
            })
            .catch(err => {
              this.$parent.$emit("OpenAppropriateSnack", err);
              // alert(err);
            });
        })
        .catch(err => {
          this.$parent.$emit("OpenAppropriateSnack", err);
        });
    },
    generateQuickUUID() {
      return (
        Math.random()
          .toString(36)
          .substring(2, 15) +
        Math.random()
          .toString(36)
          .substring(2, 15)
      );
    },
    sortLettersByDate() {
      this.group.letters.sort((letter1, letter2) => {
        if (letter1.created.toDate() < letter2.created.toDate()) return 1;
        if (letter1.created.toDate() > letter2.created.toDate()) return -1;
        return 0;
      });
    }
  }
};
</script>