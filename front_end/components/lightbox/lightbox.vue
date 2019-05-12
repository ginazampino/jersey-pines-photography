<template>
  <div
    class="lightbox-container"
    v-bind:style="{ backgroundImage: 'url(' + image.image_url + '/lg.jpg)'}"
  >
    <div class="lightbox-button">
      <router-link tag="div" class="button" v-bind:to="'/gallery/' + $route.params.name">
        <i class="fal fa-times"></i>
      </router-link>
    </div>
    <div class="lightbox-details">
      <ul>
        <li class="lightbox-details-title">{{ image.image_title }}</li>
        <li class="lightbox-details-locdate">{{ image.image_location }}, {{ image.image_date }}</li>
        <li class="lightbox-details-note">{{ image.image_note }} All rights reserved.</li>
      </ul>
    </div>
    <div class="lightbox">
      <img class="lightbox-image" v-bind:src="image.image_url + '/lg.jpg'">
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data: function() {
    return {
      image: []
    };
  },

  created() {
    const self = this;
    const id = this.$route.params.id;
    const categoryName = this.$route.params.name;

    if (id) {
      axios
        .get("/api/gallery/" + categoryName + "/image/" + id)
        .then(function(response) {
          self.image = response.data;
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  }
};
</script>