<template>
    <div class="admin-edit">
        <form ref="uploadForm" id="uploadForm" action="/upload" method="post" encType="multipart/form-data"
            @submit.prevent="submit()">
        <div class="admin-edit-thumbnail-container">
            <div class="backdrop" v-bind:style="{
                'background': 'url(' + thumbnailURL + ')'
            }"></div>
            <input type="file" id="file" name="file" class="admin-hidden-upload" v-on:change="onFileChanged">
            <img class="admin-edit-thumbnail" :src="thumbnailURL" onclick="document.getElementById('file').click();">
            
        </div>
        <div class="divider"></div>
        <ul class="admin-input-list">
            <li class="admin-input-container">
                <div class="admin-input-label">
                    Title:
                </div>
                <input v-model="title" type="text" class="admin-input" name="title" placeholder="..." autocomplete="off">
            </li>
            <li class="admin-input-container">
                <div class="admin-input-label">
                    Category:
                </div>
                <select v-model="category" ref="selectCategory" class="admin-input styled-select" name="category" placeholder="...">
                    <option v-for="category in categories" v-bind:key="category.id" v-bind:value="category.id">{{ category.category_name }}</option>
                </select>
            </li>
            <li class="admin-input-container">
                <div class="admin-input-label">
                    Date:
                </div>
                <input v-model="date" type="date" class="admin-input unstyled" name="date" placeholder="...">
            </li>
            <li class="admin-input-container">
                <div class="admin-input-label">
                    Location:
                </div>
                <input v-model="location" type="text" class="admin-input" name="location" placeholder="..." autocomplete="off">
            </li>
            <li class="admin-input-container full">
                <div class="admin-input-label">
                    Note:
                </div>
                <input v-model="note" type="text" class="admin-input" name="note" placeholder="..." autocomplete="off">
            </li>
        </ul>
        <ul class="admin-button-list">
            <li>
                <button type="button" class="admin-button" v-bind:disabled="!$route.params.id" @click="onDelete()">Delete</button>
            </li>
            <li>
                <router-link
                    tag="div"
                    class="admin-button"
                    v-bind:to="'/admin'"
                >Cancel</router-link>
            </li>
            <li>
                <button type="submit" class="admin-button">Submit</button>
            </li>
        </ul>
        </form>
    </div>
</template>

<script>
    import axios from 'axios';
    import noty from 'noty';
    import 'noty/lib/noty.css';
    import 'noty/lib/themes/mint.css';

    export default {
        data: function() {
            return {
                categories: [],
                url: '',
                title: '',
                category: null,
                date: formatDate(new Date()),
                location: '',
                note: '',
                thumbnailURL: '/static_content/images/bg.png'
            }
        },

        created() {
            const self = this;
            const id = this.$route.params.id;

            if (id) {
                axios.get('/api/images/' + id)
                    .then(function(response) {
                        self.url = response.data.image_url;
                        self.title = response.data.image_title;
                        self.category = response.data.category_id;
                        self.date = response.data.image_date;
                        self.location = response.data.image_location;
                        self.note = response.data.image_note;

                        self.thumbnailURL = response.data.image_url + '/sm.jpg';
                    }).catch(function(error) {
                        console.log(error);
                    });
            }

            axios.get('/api/categories')
                .then(function(response) {
                    self.categories = response.data;
                    if (self.category === null) {
                        self.category = response.data[0].id;
                    }
                }).catch(function(error) {
                    console.log(error);
                });
        },

        methods: {
            async onDelete() {
                var n = new noty({
                    text: 'Are you sure you want to delete this image?',
                    buttons: [
                        noty.button('Yes', 'btn btn-success', async () => {
                            n.close();

                            await axios.post('/api/delete/' + this.$route.params.id);
                            this.$router.push('/admin');

                            new noty({
                                text: 'Image Deleted!',
                                theme: 'mint',
                                type: 'error',
                                timeout: 2000
                            }).show();

                        }, {id: 'button1', 'data-status': 'ok'}),

                        noty.button('No', 'btn btn-error', function () {
                            n.close();
                        })
                    ]
                });
                n.show();
            },

            onFileChanged(event) {
                const fileList = event.srcElement.files;
                const file = fileList && fileList.length && fileList[0];

                const reader = new FileReader();

                reader.onloadend = () => {
                    const url = reader.result;
                    this.thumbnailURL = url;
                };

                reader.readAsDataURL(file);
            },

            async submit() {
                const form = new FormData(this.$refs.uploadForm);

                if (this.$route.params.id) {
                    form.append('id', this.$route.params.id);
                };

                try {
                    const res = await axios.post('/api/upload', form);
                    const id = res.data.id;

                    new noty({
                        text: 'Image saved successfully!',
                        theme: 'mint',
                        type: 'success',
                        timeout: 2000
                    }).show();

                    this.$router.push('/admin/edit/' + id);
                }
                catch (err) {
                    const res = err.response;

                    if (res.data.err) {
                        new noty({
                            text: res.data.err,
                            theme: 'mint',
                            type: 'error',
                            timeout: 8000
                        }).show();

                        return;
                    }
                }
            }
        }
    }

    function formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }
</script>