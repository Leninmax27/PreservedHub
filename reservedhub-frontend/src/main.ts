import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import './assets/main.css'; // o el CSS que genere Vite

const app = createApp(App);

app.use(router);

app.mount('#app');
