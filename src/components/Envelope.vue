<template>
  <v-card max-width="500" class="mx-auto">
    <v-list-item>
      <v-list-item-avatar color="grey">
        <v-img :src="letter_sender_ava"></v-img>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title class="headline">{{letter_title}}</v-list-item-title>
        <v-list-item-subtitle>by {{letter_sender}}</v-list-item-subtitle>
      </v-list-item-content>
      <v-badge class="mx-3">
        <template v-slot:badge>{{getNumberOfAttachedPhotos()}}</template>
        <v-btn dark color="purple" @click="showPhotos = !showPhotos">
          <v-icon>mdi-image-multiple</v-icon>
        </v-btn>
      </v-badge>
    </v-list-item>

    <v-img
      v-if="quote"
      :src="quote.background"
      height="100"
      lazy-src="https://picsum.photos/id/11/10/6"
    ></v-img>

    <v-card-actions>
      <div class="flex-grow-1"></div>

      <v-btn icon @click="show = !show">
        <v-icon>{{ show ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
      </v-btn>
    </v-card-actions>

    <v-expand-transition>
      <div v-show="show">
        <v-card-text v-html="getBody()">{{}}</v-card-text>
      </div>
    </v-expand-transition>

    <v-expand-transition>
      <div v-show="showPhotos">
        <v-card class="ma-1" color="#385F73" hover>
          <v-container fluid>
            <v-row>
              <v-col
                v-for="(photo_url, index) in letter_attached_photos"
                :key="index"
                class="d-flex child-flex"
                cols="4"
              >
                <v-card flat tile class="d-flex">
                  <v-img
                    :src="photo_url"
                    :lazy-src="`https://picsum.photos/10/6?image=${index * 5 + 10}`"
                    aspect-ratio="1"
                    class="grey lighten-2"
                    @click="openImageViewer()"
                  >
                    <template v-slot:placeholder>
                      <v-row class="fill-height ma-0" align="center" justify="center">
                        <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                      </v-row>
                    </template>
                  </v-img>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
          <viewer :images="letter_attached_photos" @inited="inited" ref="viewer">
            <img v-for="src in letter_attached_photos" :src="src" :key="src" style="display: none" />
          </viewer>
        </v-card>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script>
import axios from "axios";
import "viewerjs/dist/viewer.css";
import Viewer from "v-viewer";
import Vue from "vue";
Vue.use(Viewer);
export default {
  name: "Envelope",
  data() {
    return { show: false, quote: null, showPhotos: false };
  },
  props: {
    letter_sender: String,
    letter_title: String,
    letter_body: String,
    letter_sender_ava: String,
    letter_attached_photos: Array
  },
  methods: {
    // ! MUST NOT CHANGE NAME, THIS IS LIBRARY USAGE
    inited(viewer) {
      this.$viewer = viewer;
    },
    getBody() {
      let body = this.letter_body.replace(/\\n/g, "<br />").replace(/(\r\n|\n|\r)/gm, "<br />");
      // console.log(body)
      return body;
    },
    openImageViewer() {
      if (this.$viewer) this.$viewer.show();
    },
    getNumberOfAttachedPhotos() {
      if (this.letter_attached_photos) {
        return this.letter_attached_photos.length
      }
      return 0
    }
  },
  created() {
    axios
      .get(`https://quotes.rest/qod`, {
        headers: {
          Accept: "application/json"
        }
      })
      .then(response => {
        this.quote = response.data.contents.quotes[0];
      });
  }
};
</script>