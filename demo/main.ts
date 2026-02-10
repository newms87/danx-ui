import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import ActionButtonPage from "./pages/ActionButtonPage.vue";
import ButtonPage from "./pages/ButtonPage.vue";
import CodeViewerPage from "./pages/CodeViewerPage.vue";
import DialogPage from "./pages/DialogPage.vue";
import HomePage from "./pages/HomePage.vue";
import PopoverPage from "./pages/PopoverPage.vue";
import MarkdownEditorPage from "./pages/MarkdownEditorPage.vue";

// Import global styles
import "../src/styles.css";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "home", component: HomePage },
    { path: "/button", name: "button", component: ButtonPage },
    { path: "/action-button", name: "action-button", component: ActionButtonPage },
    { path: "/code-viewer", name: "code-viewer", component: CodeViewerPage },
    { path: "/dialog", name: "dialog", component: DialogPage },
    { path: "/popover", name: "popover", component: PopoverPage },
    { path: "/markdown-editor", name: "markdown-editor", component: MarkdownEditorPage },
  ],
});

const app = createApp(App);
app.use(router);
app.mount("#app");
