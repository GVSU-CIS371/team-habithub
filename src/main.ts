import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router, { setupAuthGuard } from './router';
import vuetify from './plugins/vuetify';
import './styles/overrides.css';

const app = createApp(App);
const pinia = createPinia();

setupAuthGuard(router, pinia);

app.use(pinia);
app.use(router);
app.use(vuetify);

app.mount('#app');
