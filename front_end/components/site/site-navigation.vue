<template>
    <div class="site-navigation-container">
        <div class="site-navigation">
            <div class="site-navigation-header-container">
                <header class='site-navigation-header'>
                    <h1>
                        Jersey Pines
                    </h1>
                    <span class="h1-subheading">
                        Photography
                    </span>
                </header>
            </div>
            <nav>
                <ul class="site-navigation-menu">
                    <router-link v-for="category in categories" tag='li' v-bind:to="'/gallery/' + category.category_name" v-bind:key="category.id" v-bind:data-id="category.id">
                        {{ category.category_name }}
                    </router-link>
                </ul>
            </nav>
            <footer>
                <div class="site-navigation-social">
                    <a href="mailto:gina@ginazampino.com?subject=Photography">
                        <div class="button no-margin">
                            <i class="fal fa-envelope"></i>
                        </div>
                    </a>
                    <div class="button">
                        <i class="fab fa-flickr"></i>
                    </div>
                </div>
            </footer>
        </div>
    </div>
</template>

<script>
    import axios from 'axios';

    export default {
        data: function () {
            return {
                categories: []
            }
        },
        
        created() {
            const self = this;
            axios.get('/api/categories')
            .then(function(response) {
                self.categories = response.data;
            }).catch(function(error) {
                console.log(error);
            });
        }
    };
</script>