import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import ActionButtonPage from "./pages/ActionButtonPage.vue";
import BadgePage from "./pages/BadgePage.vue";
import ButtonPage from "./pages/ButtonPage.vue";
import ChipPage from "./pages/ChipPage.vue";
import CodeViewerPage from "./pages/CodeViewerPage.vue";
import ContextMenuPage from "./pages/ContextMenuPage.vue";
import DialogPage from "./pages/DialogPage.vue";
import HomePage from "./pages/HomePage.vue";
import IconPage from "./pages/IconPage.vue";
import PopoverPage from "./pages/PopoverPage.vue";
import MarkdownEditorPage from "./pages/MarkdownEditorPage.vue";
import FormattersPage from "./pages/FormattersPage.vue";
import ButtonGroupPage from "./pages/ButtonGroupPage.vue";
import TabsPage from "./pages/TabsPage.vue";
import TooltipPage from "./pages/TooltipPage.vue";

// Import global styles
import "../src/styles.css";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "home", component: HomePage },
    { path: "/badge", name: "badge", component: BadgePage },
    { path: "/button", name: "button", component: ButtonPage },
    { path: "/chip", name: "chip", component: ChipPage },
    { path: "/action-button", name: "action-button", component: ActionButtonPage },
    { path: "/code-viewer", name: "code-viewer", component: CodeViewerPage },
    { path: "/context-menu", name: "context-menu", component: ContextMenuPage },
    { path: "/icon", name: "icon", component: IconPage },
    { path: "/dialog", name: "dialog", component: DialogPage },
    { path: "/popover", name: "popover", component: PopoverPage },
    { path: "/markdown-editor", name: "markdown-editor", component: MarkdownEditorPage },
    { path: "/formatters", name: "formatters", component: FormattersPage },
    { path: "/button-group", name: "button-group", component: ButtonGroupPage },
    { path: "/tabs", name: "tabs", component: TabsPage },
    { path: "/tooltip", name: "tooltip", component: TooltipPage },
  ],
});

const app = createApp(App);
app.use(router);
app.mount("#app");
