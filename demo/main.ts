import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import HomePage from "./pages/HomePage.vue";
import ButtonPage from "./pages/ButtonPage.vue";
import DialogPage from "./pages/DialogPage.vue";

// Import global styles
import "../src/styles.css";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "home", component: HomePage },
    { path: "/button", name: "button", component: ButtonPage },
    { path: "/dialog", name: "dialog", component: DialogPage },
  ],
});

const app = createApp(App);
app.use(router);
app.mount("#app");
