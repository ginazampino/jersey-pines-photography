<template>
    <div class="admin-content-container">
        <div class="scroll-area" data-simplebar>
            <div class="admin">
                <div class="admin-sign-out-container">
                    <div class="admin-sign-out">
                        <i class="fal fa-sign-out"></i> Sign Out
                    </div>
                </div>
                <header>
                    <router-link
                        to="/"
                    >
                    <div class="admin-header-container">
                        <div class="site-navigation-header">
                            <h1>
                                Jesse &amp; Gina
                            </h1>
                            <span class="h1-subheading">
                                Photography
                            </span>
                        </div>
                    </div>
                    </router-link>
                </header>
                <div class="divider"></div>
                <router-view></router-view>
                <footer>
                    <div class="divider"></div>
                    <div class="admin-footer">
                        <i class="fal fa-heart"></i>
                    </div>
                </footer>
            </div>
        </div>
    </div>
</template>

<script>
    import admin_browse from './admin-browse.vue';
    import admin_edit from './admin-edit.vue';

    export default {
        components: {
            'admin-browse': admin_browse,
            'admin-edit': admin_edit
        }
    }
</script>