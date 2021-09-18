<template>
  <v-card class="mt-4 mx-auto">
    <v-sheet
      class="v-sheet--offset mx-auto"
      color="cyan"
      elevation="12"
      max-width="calc(100% - 32px)"
    >
      <v-sparkline :labels="labels" :value="value" color="white" line-width="2" padding="16"></v-sparkline>
    </v-sheet>

    <v-card-text class="pt-0">
      <div class="title font-weight-light mb-2">My Activity</div>
      <div class="subheading font-weight-light grey--text">In a course of the most recent week</div>
      <v-divider class="my-2"></v-divider>
      <v-icon class="mr-2" small>mdi-clock</v-icon>
      <span class="caption grey--text font-weight-light">last updated a second ago</span>
    </v-card-text>
  </v-card>
</template>

<script>
import firebase from "firebase";
export default {
  data: () => ({
    labels: ["-6", "-5", "-4", "-3", "-2", "-1", "Today"],
    value: [],
    groups: []
  }),
  methods: {
    updateValues() {
      const now = new Date();
      const one = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
      const two = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      const three = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      const four = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
      const five = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
      const six = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
      const week = [now, one, two, three, four, five, six];
      for (let x = 1; x < week.length; x++) {
        let count = 0;
        this.groups.forEach(group => {
          if (group["letters"]) {
            group["letters"].forEach(letter => {
              // console.log(letter.created.toDate())
              // console.log(six)
              // console.log(now)
              if (
                letter.created.toDate() >= week[x] &&
                letter.created.toDate() <= week[x - 1]
              ) {
                count += 1;
              }
            });
          }
        });
        // console.log(count);
        this.value.push(count);
      }
      this.value = this.value.reverse();
    }
  },
  created() {
    const db = firebase.firestore();
    db.collection("groups")
      .where(
        "attendants_uid",
        "array-contains",
        firebase.auth().currentUser.uid
      )
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          this.groups.push({
            ...doc.data()
          });
        });

        this.updateValues();
      });
  }
};
</script>


<style>
.v-sheet--offset {
  top: -24px;
  position: relative;
}
</style>
