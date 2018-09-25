import './styles/index.scss';

import App from './components/App.vue';
import Vue from 'vue';
import Router from './router';

new Vue ({
    components: { App },
    el: '#app',
    router: Router,
    template: '<App></App>'
});

