import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import ActionButtonPage from "./pages/ActionButtonPage.vue";
import ButtonPage from "./pages/ButtonPage.vue";
import CodeViewerPage from "./pages/CodeViewerPage.vue";
import ContextMenuPage from "./pages/ContextMenuPage.vue";
import DialogPage from "./pages/DialogPage.vue";
import HomePage from "./pages/HomePage.vue";
import PopoverPage from "./pages/PopoverPage.vue";
import MarkdownEditorPage from "./pages/MarkdownEditorPage.vue";
import FormattersPage from "./pages/FormattersPage.vue";

// Import global styles
import "../src/styles.css";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "home", component: HomePage },
    { path: "/button", name: "button", component: ButtonPage },
    { path: "/action-button", name: "action-button", component: ActionButtonPage },
    { path: "/code-viewer", name: "code-viewer", component: CodeViewerPage },
    { path: "/context-menu", name: "context-menu", component: ContextMenuPage },
    { path: "/dialog", name: "dialog", component: DialogPage },
    { path: "/popover", name: "popover", component: PopoverPage },
    { path: "/markdown-editor", name: "markdown-editor", component: MarkdownEditorPage },
    { path: "/formatters", name: "formatters", component: FormattersPage },
  ],
});

const app = createApp(App);
app.use(router);
app.mount("#app");
