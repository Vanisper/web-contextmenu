import { createApp } from "vue";
import App from './App.vue';
import ContextMenu from "../package/vue3";

const app = createApp(App);

app.use(ContextMenu);
app.mount("#app");
