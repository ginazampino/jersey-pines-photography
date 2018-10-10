import axios from 'axios';
import VueRouter from 'vue-router';
import Vue from 'vue';

Vue.use(VueRouter);

export default new VueRouter({
    mode: 'history',
    routes: [
        /*
         * <router-view> => App.vue
         */
        {
            path: '/',
            component: require('../components/site/site.vue').default,
            children: [ 
                /*
                 *  <router-view> => site.vue
                 */
                {
                    path: '/gallery/:name',
                    component: require('../components/site/site-gallery.vue').default,
                    children: [
                        /*
                         *  <router-view> => site-gallery.vue
                         */
                        {
                            path: '/gallery/:name/image/:id',
                            component: require('../components/lightbox/lightbox.vue').default
                        }
                    ]
                }
            ]
        },
        {
            path: '/admin',
            component: require('../components/admin/admin.vue').default,
            beforeEnter: (to, from, next) => {
                axios.get('/auth/profile').then(resp => {
                    const profile = resp.data;
                    if (profile) {
                        next();
                    } else {
                        window.location.replace('/auth/google/login');
                    }
                })
            },
            children: [
                {
                    path: '/',
                    component: require('../components/admin/admin-browse.vue').default
                },
                {
                    path: '/admin/edit',
                    component: require('../components/admin/admin-edit.vue').default
                },
                {
                    path: '/admin/edit/:id',
                    component: require('../components/admin/admin-edit.vue').default
                }
            ]
        },
        {
            path: '*', 
            component: require('../components/404.vue').default
        }
    ]
});