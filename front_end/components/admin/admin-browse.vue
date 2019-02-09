<template>
    <section>
        <router-link tag="div" class="admin-add" v-bind:to="'/admin/edit'">
            Add Photograph
        </router-link>
        <div class="divider"></div>
        <ul class="admin-table">
            <li v-for="image in images" v-bind:key="image.id">
                <div class="table-thumb" v-bind:style="{ backgroundImage: 'url(' + image.image_url + '/sm.jpg)'}">
                </div>
                <div class="table-title">
                    {{ image.image_title }}
                </div>
                <div class="table-action">
                    <router-link v-bind:to="'/admin/edit/' + image.unique_id">
                        <div class="button admin-browse-button">
                            <i class="fal fa-cog"></i>
                        </div>
                    </router-link>
                </div>
                <div class="backdrop" v-bind:style="{ backgroundImage: 'url(' + image.image_url + '/sm.jpg)'}"></div>
            </li>
        </ul>
    </section>           
</template>

<script>
    import axios from 'axios';

    export default {
        data: function() {
            return {
                images: []
            }
        },

        created() {
            const self = this;

            axios.get('/api/browse')
                .then(function(response) {
                    self.images = response.data
                }).catch(function(error) {
                    console.log(error);
                });
        }
    }
</script>