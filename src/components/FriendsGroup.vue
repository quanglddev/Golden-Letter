<template>
  <v-card class="mx-auto" max-width="400">
    <v-card-title>
      <h2 class="headline">Toothbrush</h2>
      <div class="flex-grow-1"></div>
      <span class="title">$4.99</span>
    </v-card-title>

    <v-divider class="mx-4"></v-divider>

    <v-card-text>
      <span class="subheading">Select type</span>

      <v-chip-group v-model="selection" active-class="deep-purple--text text--accent-4" mandatory>
        <v-chip>Extra Soft</v-chip>
        <v-chip>Soft</v-chip>
        <v-chip>Medium</v-chip>
        <v-chip>Hard</v-chip>
      </v-chip-group>
    </v-card-text>

    <v-card-actions>
      <v-btn block class="white--text" color="deep-purple accent-4">Add to Cart</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  data: () => ({
    selection: 2
  })
};
</script>