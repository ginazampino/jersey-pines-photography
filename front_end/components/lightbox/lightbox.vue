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
        <li class="lightbox-details-exif">{{ exif_info }}</li>
      </ul>
    </div>
    <div class="lightbox">
      <img class="lightbox-image" v-bind:src="image.image_url + '/lg.jpg'" />
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { ExifTagParser } from "../../exif";

export default {
  data: function() {
    return {
      image: []
    };
  },

  computed: {
    exif_info() {
      if (!this.image || !this.image.exif) return null;
      const parser = new ExifTagParser(this.image.exif);
      const makeModel = parser.camera_make_and_model();
      const exposureTime = parser.exposure_time();
      const focalLength = parser.focal_length();
      const fstop = parser.fstop();
      const iso = parser.iso();
      const lens = parser.lens();

      let result = "";
      let values = [];

      if (makeModel) {
        result += makeModel;
        if (lens) {
          result += " + " + lens;
        }
      }

      if (focalLength) values.push(focalLength);
      if (fstop) values.push(fstop);
      if (exposureTime) values.push(exposureTime);
      if (iso) values.push(iso);

      if (result) result += " @ ";
      result += values.join(", ");
      return result;
    }
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

function formatFractionalSeconds(value) {
  if (!value) return "";
  if (typeof value === "string") value = parseFloat(value);
  if (value >= 1) {
    return value.toFixed(1) + "s";
  } else {
    return "1/" + (1 / value).toFixed(0);
  }
}
</script>