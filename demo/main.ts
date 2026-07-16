import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import ActionButtonPage from "./pages/ActionButtonPage.vue";
import AlertPage from "./pages/AlertPage.vue";
import AuditHistoryItemPage from "./pages/AuditHistoryItemPage.vue";
import BadgePage from "./pages/BadgePage.vue";
import BreadcrumbsPage from "./pages/BreadcrumbsPage.vue";
import ButtonPage from "./pages/ButtonPage.vue";
import ChipPage from "./pages/ChipPage.vue";
import DividerPage from "./pages/DividerPage.vue";
import SpinnerPage from "./pages/SpinnerPage.vue";
import CodeViewerPage from "./pages/CodeViewerPage.vue";
import ContextMenuPage from "./pages/ContextMenuPage.vue";
import DropdownMenuPage from "./pages/DropdownMenuPage.vue";
import DialogPage from "./pages/DialogPage.vue";
import DrawerPage from "./pages/DrawerPage.vue";
import HomePage from "./pages/HomePage.vue";
import IconPage from "./pages/IconPage.vue";
import KbdPage from "./pages/KbdPage.vue";
import PopoverPage from "./pages/PopoverPage.vue";
import PopconfirmPage from "./pages/PopconfirmPage.vue";
import MarkdownEditorPage from "./pages/MarkdownEditorPage.vue";
import FormattersPage from "./pages/FormattersPage.vue";
import ButtonGroupPage from "./pages/ButtonGroupPage.vue";
import TabsPage from "./pages/TabsPage.vue";
import StepperPage from "./pages/StepperPage.vue";
import TimelinePage from "./pages/TimelinePage.vue";
import ToastPage from "./pages/ToastPage.vue";
import TooltipPage from "./pages/TooltipPage.vue";
import ProgressBarPage from "./pages/ProgressBarPage.vue";
import SplitPanelPage from "./pages/SplitPanelPage.vue";
import DragAndDropPage from "./pages/DragAndDropPage.vue";
import FileExplorerPage from "./pages/FileExplorerPage.vue";
import TreeViewPage from "./pages/TreeViewPage.vue";
import TablePage from "./pages/TablePage.vue";
import DanxFilePage from "./pages/DanxFilePage.vue";
import DanxFileViewerPage from "./pages/DanxFileViewerPage.vue";
import ScrollPage from "./pages/ScrollPage.vue";
import SkeletonPage from "./pages/SkeletonPage.vue";
import LoadingOverlayPage from "./pages/LoadingOverlayPage.vue";
import TogglePage from "./pages/TogglePage.vue";
import CheckboxPage from "./pages/CheckboxPage.vue";
import RadioGroupPage from "./pages/RadioGroupPage.vue";
import RangeSliderPage from "./pages/RangeSliderPage.vue";
import RatingPage from "./pages/RatingPage.vue";
import ColorPickerPage from "./pages/ColorPickerPage.vue";
import InputPage from "./pages/InputPage.vue";
import TextareaPage from "./pages/TextareaPage.vue";
import SelectPage from "./pages/SelectPage.vue";
import FormValidationPage from "./pages/FormValidationPage.vue";
import DanxFileUploadPage from "./pages/DanxFileUploadPage.vue";
import EditableDivPage from "./pages/EditableDivPage.vue";
import ReactiveStorePage from "./pages/ReactiveStorePage.vue";
import HotkeysPage from "./pages/HotkeysPage.vue";
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
    { path: "/alert", name: "alert", component: AlertPage },
    {
      path: "/audit-history-item",
      name: "audit-history-item",
      component: AuditHistoryItemPage,
    },
    { path: "/badge", name: "badge", component: BadgePage },
    { path: "/breadcrumbs", name: "breadcrumbs", component: BreadcrumbsPage },
    { path: "/button", name: "button", component: ButtonPage },
    { path: "/chip", name: "chip", component: ChipPage },
    { path: "/divider", name: "divider", component: DividerPage },
    { path: "/spinner", name: "spinner", component: SpinnerPage },
    { path: "/action-button", name: "action-button", component: ActionButtonPage },
    { path: "/code-viewer", name: "code-viewer", component: CodeViewerPage },
    { path: "/context-menu", name: "context-menu", component: ContextMenuPage },
    { path: "/dropdown-menu", name: "dropdown-menu", component: DropdownMenuPage },
    { path: "/icon", name: "icon", component: IconPage },
    { path: "/kbd", name: "kbd", component: KbdPage },
    { path: "/dialog", name: "dialog", component: DialogPage },
    { path: "/drawer", name: "drawer", component: DrawerPage },
    { path: "/popover", name: "popover", component: PopoverPage },
    { path: "/popconfirm", name: "popconfirm", component: PopconfirmPage },
    { path: "/markdown-editor", name: "markdown-editor", component: MarkdownEditorPage },
    { path: "/formatters", name: "formatters", component: FormattersPage },
    { path: "/button-group", name: "button-group", component: ButtonGroupPage },
    { path: "/tabs", name: "tabs", component: TabsPage },
    { path: "/stepper", name: "stepper", component: StepperPage },
    { path: "/timeline", name: "timeline", component: TimelinePage },
    { path: "/toast", name: "toast", component: ToastPage },
    { path: "/tooltip", name: "tooltip", component: TooltipPage },
    { path: "/progress-bar", name: "progress-bar", component: ProgressBarPage },
    { path: "/split-panel", name: "split-panel", component: SplitPanelPage },
    { path: "/drag-and-drop", name: "drag-and-drop", component: DragAndDropPage },
    { path: "/file-explorer", name: "file-explorer", component: FileExplorerPage },
    { path: "/tree-view", name: "tree-view", component: TreeViewPage },
    { path: "/table", name: "table", component: TablePage },
    { path: "/danx-file", name: "danx-file", component: DanxFilePage },
    { path: "/danx-file-viewer", name: "danx-file-viewer", component: DanxFileViewerPage },
    { path: "/scroll", name: "scroll", component: ScrollPage },
    { path: "/skeleton", name: "skeleton", component: SkeletonPage },
    { path: "/loading-overlay", name: "loading-overlay", component: LoadingOverlayPage },
    { path: "/toggle", name: "toggle", component: TogglePage },
    { path: "/checkbox", name: "checkbox", component: CheckboxPage },
    { path: "/radio-group", name: "radio-group", component: RadioGroupPage },
    { path: "/range-slider", name: "range-slider", component: RangeSliderPage },
    { path: "/rating", name: "rating", component: RatingPage },
    { path: "/color-picker", name: "color-picker", component: ColorPickerPage },
    { path: "/input", name: "input", component: InputPage },
    { path: "/textarea", name: "textarea", component: TextareaPage },
    { path: "/select", name: "select", component: SelectPage },
    { path: "/form-validation", name: "form-validation", component: FormValidationPage },
    { path: "/danx-file-upload", name: "danx-file-upload", component: DanxFileUploadPage },
    { path: "/editable-div", name: "editable-div", component: EditableDivPage },
    { path: "/reactive-store", name: "reactive-store", component: ReactiveStorePage },
    { path: "/hotkeys", name: "hotkeys", component: HotkeysPage },
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
