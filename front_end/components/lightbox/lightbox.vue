<template>
    <div class="lightbox-container" v-bind:style="{ backgroundImage: 'url(' + '/uploads/' + image.image_url +')'}">
        <div class="lightbox-button">
            <router-link tag="div" class="button" v-bind:to="'/gallery/' + $route.params.name">
                <i class="fal fa-times"></i>
            </router-link>
        </div>
        <div class="lightbox-details">
            <ul>
                <li class="lightbox-details-title">
                    {{ image.image_title }}
                </li>
                <li class="lightbox-details-locdate">
                    {{ image.image_location }}, {{ image.image_date }}
                </li>
                <li class="lightbox-details-note">
                    {{ image.image_note }} All rights reserved.
                </li>
            </ul>
        </div>
        <div class="lightbox">
            <img class="lightbox-image" v-bind:src="'/uploads/' + image.image_url">
        </div>
    </div>
</template>

<script>
    import axios from 'axios';

    export default {
        data: function() {
            return {
                image: []
            }
        },

        created() {
            const self = this;
            const id = this.$route.params.id;
            const categoryName = this.$route.params.name;

            if (id) {
                axios.get('/api/gallery/' + categoryName + '/image/' + id)
                    .then(function(response) {
                        self.image = response.data
                    }).catch(function(error) {
                        console.log(error);
                    });

               ;
            };
        }

        // methods: {
        //     reload: async function() {
        //         const categoryName = this.$route.params.name;
        //         const id = this.$route.params.id;
        //         const response = await axios.get('/api/gallery/' + categoryName + '/image/' + id);

        //         this.name = this.$route.params.name;
        //         this.images = response.data;
        //         console.log(response.data);
        //     }
        // },

        // created() {
        //     this.reload();
        // },

        // watch: {
        //     '$route': function (to) {
        //         this.reload();
        //     }
        // }
    }
</script>