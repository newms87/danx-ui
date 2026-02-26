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
import ProgressBarPage from "./pages/ProgressBarPage.vue";
import SplitPanelPage from "./pages/SplitPanelPage.vue";
import DanxFilePage from "./pages/DanxFilePage.vue";
import DanxFileViewerPage from "./pages/DanxFileViewerPage.vue";
import ScrollPage from "./pages/ScrollPage.vue";
import SkeletonPage from "./pages/SkeletonPage.vue";
import InputPage from "./pages/InputPage.vue";
import ColorsPage from "./pages/design-system/ColorsPage.vue";
import TypographyPage from "./pages/design-system/TypographyPage.vue";
import SpacingPage from "./pages/design-system/SpacingPage.vue";
import ShadowsPage from "./pages/design-system/ShadowsPage.vue";
import ThemingGuidePage from "./pages/design-system/ThemingGuidePage.vue";
import VariantsPage from "./pages/design-system/VariantsPage.vue";

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
    { path: "/progress-bar", name: "progress-bar", component: ProgressBarPage },
    { path: "/split-panel", name: "split-panel", component: SplitPanelPage },
    { path: "/danx-file", name: "danx-file", component: DanxFilePage },
    { path: "/danx-file-viewer", name: "danx-file-viewer", component: DanxFileViewerPage },
    { path: "/scroll", name: "scroll", component: ScrollPage },
    { path: "/skeleton", name: "skeleton", component: SkeletonPage },
    { path: "/input", name: "input", component: InputPage },
    { path: "/design/colors", name: "design-colors", component: ColorsPage },
    { path: "/design/typography", name: "design-typography", component: TypographyPage },
    { path: "/design/spacing", name: "design-spacing", component: SpacingPage },
    { path: "/design/shadows", name: "design-shadows", component: ShadowsPage },
    { path: "/design/theming", name: "design-theming", component: ThemingGuidePage },
    { path: "/design/variants", name: "design-variants", component: VariantsPage },
  ],
});

const app = createApp(App);
app.use(router);
app.mount("#app");
