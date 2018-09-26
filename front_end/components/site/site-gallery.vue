<template>
    <div class="gallery">
        <div class="site-gallery-container">
            <div class="site-gallery">
                <div class="site-gallery-header">
                    <div class="site-gallery-header-heading">
                        <h2>
                            {{ name }}
                        </h2>
                    </div>
                    <router-link tag="div" class="button gallery-header-button" to="/">
                        <i class="fal fa-times"></i>
                    </router-link>
                </div>
                <div class="site-gallery-content-container">
                    <div class="site-gallery-content-scroll-area" data-simplebar>
                        <div class="site-gallery-content">
                            <router-link v-for="image in images" v-bind:key="image.id" tag="div" class="site-gallery-item-container" v-bind:to="'/gallery/' + $route.params.name + '/image/' + image.id">
                            <div class="site-gallery-item" v-bind:style="{ backgroundImage: 'url(' + '/uploads/' + image.image_url +')'}"></div>
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
            <transition name="fade" mode="out-in">
                <router-view></router-view>
            </transition>
        </div>
    </div>
</template>

<script>
    import axios from 'axios';

    export default  {
        data: function () {
            return {
                images: [],
                name: ''
            }
        },

        methods: {
            reload: async function() {
                const categoryName = this.$route.params.name;
                const response = await axios.get('/api/gallery/' + categoryName);

                this.name = this.$route.params.name;
                this.images = response.data;
                console.log(response.data);
            }
        },

        created() {
            this.reload();
        },

        watch: {
            '$route': function (to) {
                this.reload();
            }
        }
    }
</script>