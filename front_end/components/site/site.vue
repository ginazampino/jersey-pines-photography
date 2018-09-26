<template>
    <div class="site">
        <site-background></site-background>
        <site-navigation></site-navigation>
        <transition name="fade" mode="out-in">
            <router-view></router-view>
        </transition>
    </div>
</template>

<script>
    import site_background from './site-background.vue';
    import site_navigation from './site-navigation.vue';

    export default {
        components: {
            'site-background': site_background,
            'site-navigation': site_navigation
        }
    };
</script>