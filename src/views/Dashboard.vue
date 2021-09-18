<template>
  <div class="dashboard container">
    <v-container>
      <p class="body-1 grey--text">Dashboard</p>
      <v-layout row wrap class="justify-center">
        <v-flex xs12 md6 class="pa-5">
          <Graph />
        </v-flex>
      </v-layout>
      <p class="body-1 grey--text pt-5 pb-0">To-do List</p>
      <v-layout row wrap class="justify-center">
        <v-flex xs12 md8>
          <!-- <FriendsGroup /> -->
          <v-layout row class="mb-3">
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn small text class="grey lighten-3" @click="sortBy('title')" v-on="on">
                  <v-icon left small>mdi-folder</v-icon>
                  <span class="caption text-lowercase">By project name</span>
                </v-btn>
              </template>
              <span>Sort projects by project name</span>
            </v-tooltip>
          </v-layout>

          <v-card flat v-for="(todo, index) in todos" :key="index">
            <v-layout row wrap :class="`pa-3 project ${todo.status}`">
              <v-flex xs12 md6>
                <div class="caption grey--text">Todo Title</div>
                <div>{{todo.title}}</div>
              </v-flex>
              <v-flex xs6 sm4 md2>
                <div class="caption grey--text">Person</div>
                <div>Quang Luong</div>
              </v-flex>
              <v-flex xs6 sm4 md2>
                <div class="caption grey--text">Due by</div>
                <div>21-09-2019</div>
              </v-flex>
              <v-flex xs6 sm4 md2>
                <div>
                  <v-chip :class="`white--text caption my-2 ${todo.status}`">{{todo.status}}</v-chip>
                </div>
              </v-flex>
            </v-layout>
            <v-divider></v-divider>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import Graph from "@/components/Graph.vue";
// import FriendsGroup from "@/components/FriendsGroup.vue";

export default {
  data() {
    return {
      todos: [
        { title: "Fix 'mark as read' feature", status: "complete" },
        { title: "Make 'edit profile' function", status: "ongoing" },
        { title: "Make 'settings' page", status: "ongoing" },
        { title: "Make 'report' page", status: "ongoing" },
        { title: "Make 'feature submission' feature", status: "ongoing" },
        { title: "Make 'group' feature", status: "ongoing" }
      ],
      isAlphabetical: false
    };
  },
  components: {
    Graph
    // FriendsGroup
  },
  methods: {
    sortBy(prop) {
      if (!this.isAlphabetical) {
        this.todos.sort((a, b) =>
          a[prop].toLowerCase() < b[prop].toLowerCase() ? -1 : 1
        );
      } else {
        this.todos.sort((a, b) =>
          a[prop].toLowerCase() > b[prop].toLowerCase() ? -1 : 1
        );
      }
      this.isAlphabetical = !this.isAlphabetical
    }
  }
};
</script>

<style>
.project.complete {
  border-left: 4px solid #3cd1c2;
}
.project.ongoing {
  border-left: 4px solid orange;
}
.project.overdue {
  border-left: 4px solid tomato;
}

.v-chip.complete {
  background-color: #3cd1c2 !important;
}

.v-chip.ongoing {
  background: #ffaa2c !important;
}

.v-chip.overdue {
  background: #f83e70 !important;
}
</style>

