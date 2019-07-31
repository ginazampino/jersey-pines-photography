<template>
  <div class="site-background">
    <div
      v-for="img in backgroundImages"
      :key="img.id"
      :class="{'site-background-image':true, 'fade': img.fadeOut, 'show': !img.fadeOut && img.loaded}"
      :style="{ backgroundImage: img.image_url + '/lg.jpg' }"
    ></div>
  </div>
</template>

<script>
import axios from "axios";

const CHANGE_BACKGROUND_INTERVAL = 10000;
const TRANSITION_INTERVAL = 1000;

export default {
  data() {
    return {
      backgroundImages: []
    };
  },

  mounted() {
    setInterval(this.onChangeBackground.bind(this), CHANGE_BACKGROUND_INTERVAL);
  },

  methods: {
    fadeOutImage(img) {
      img.fadeOut = true;
      setTimeout(() => {
        // Remove the image from the stack:
        const i = this.backgroundImages.indexOf(img);
        this.backgroundImages.splice(i, 1);
      }, TRANSITION_INTERVAL);
    },

    async onChangeBackground() {
      // Get a new random image from the server:
      const randomImage = (await axios.get("/api/random-image"))[0];

      // Begin the fade out sequence for existing image(s):
      this.backgroundImages.forEach(img => this.fadeOutImage(img));

      // Add the new image to the stack:
      this.backgroundImages.push(randomImage);

      this.$nextTick(() => {
        randomImage.loaded = true;
      });
    }
  }
};
</script>