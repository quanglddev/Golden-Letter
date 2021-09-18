<template>
  <nav class="overflow-hidden">
    <v-app-bar flat app src="http://pavbca.com/walldb/original/2/e/3/6247.jpg" dark>
      <v-app-bar-nav-icon v-if="shouldHaveDrawer" @click="navigation_drawer = !navigation_drawer"></v-app-bar-nav-icon>
      <v-toolbar-title class="headline text-uppercase">
        <span>Golden</span>
        <span class="font-weight-light">Letter</span>
        <span>__🍄</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text v-if="canLogOut" @click="logout()">
        <span class="mr-3">Log Out</span>
        <v-icon left>mdi-logout-variant</v-icon>
      </v-btn>
      <!-- <v-app-bar-nav-icon v-if="shouldHaveDrawer" @click="friends_drawer = !friends_drawer" right></v-app-bar-nav-icon> -->
    </v-app-bar>

    <v-navigation-drawer
      app
      v-model="navigation_drawer"
      class="primary"
      width="95"
      dark
      src="http://cdn.iphonehacks.com/wp-content/uploads/2017/05/minimal_wallpaper_5_iphone.jpg"
    >
      <v-list>
        <v-list-item v-for="link in links" :key="link.title" link router :to="link.route">
          <v-list-item-content>
            <v-icon class="title" left>{{ link.icon }}</v-icon>
            <v-list-item-title class="caption text-center">{{ link.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- <v-navigation-drawer
      v-if="shouldHaveDrawer"
      app
      v-model="friends_drawer"
      class="success"
      right
      dark
      src="https://cdn.wallpapersafari.com/17/69/0Icvst.jpg"
    >
      <template v-slot:prepend>
        <v-list v-for="group in groups" :key="group.gid">
          <v-list-item router :to="{name: 'letters', params: {all_letters: group.letters}}">
            <v-list-item-avatar>
              <img :src="group.attendants_ava_url[0]" />
              <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                </v-row>
              </template>
            </v-list-item-avatar>
          </v-list-item>
          <v-list-item link two-line router :to="{name: 'letters', params: {all_letters: group.letters}}">
            <v-list-item-content>
              <v-list-item-title class="title">{{group.attendants_full_name[0]}}</v-list-item-title>
              <v-list-item-subtitle>{{group.attendants_email[0]}}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-icon>mdi-email-newsletter</v-icon>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </template>
    </v-navigation-drawer>-->
  </nav>
</template>

<script>
import firebase from "firebase";
export default {
  data() {
    return {
      navigation_drawer: true,
      friends_drawer: true,
      links: [
        { title: "Dashboard", icon: "mdi-view-dashboard", route: "/" },
        { title: "Letters", icon: "mdi-email-newsletter", route: "/letters" },
        { title: "Account", icon: "mdi-account", route: "/account" },
        { title: "Settings", icon: "mdi-settings", route: "/settings" },
        { title: "Report", icon: "mdi-bug", route: "/report" }
      ],
      canLogOut: true,
      shouldHaveDrawer: false,
      groups: [],
      user: null
    };
  },
  methods: {
    logout: function() {
      firebase
        .auth()
        .signOut()
        .then(() => {
          this.$router.go({ path: this.$router.path });
        });
    },
  },
  created() {
    this.user = firebase.auth().currentUser;
    if (!firebase.auth().currentUser) {
      // * Disable logout button
      this.canLogOut = false;
      this.navigation_drawer = false;
      this.friends_drawer = false;
      this.shouldHaveDrawer = false;
    } else {
      this.canLogOut = true;
      this.navigation_drawer = true;
      this.friends_drawer = true;
      this.shouldHaveDrawer = true;
    }
  }
};
</script>

<style scoped>
.v-list-item--active {
  color: #f98c24 !important;
}

.router-link-active {
  color: #f98c24 !important;
}
</style>