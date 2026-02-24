/**
 * SVG icons for the component library.
 * All icons sourced from danx-icon (FontAwesome solid) via ?raw imports.
 * Vite inlines the SVG content at build time — zero runtime dependency.
 *
 * Use by name: <DanxIcon icon="trash" /> (looked up from iconRegistry)
 * Use by import: <DanxIcon :icon="trashIcon" /> (raw SVG string)
 * Use external: <DanxIcon :icon="mySvgString" /> (any SVG string)
 */

// Destructive
import trashSvg from "danx-icon/src/fontawesome/solid/trash.svg?raw";
import stopSvg from "danx-icon/src/fontawesome/solid/stop.svg?raw";
import circleXmarkSvg from "danx-icon/src/fontawesome/solid/circle-xmark.svg?raw";
import closeSvg from "danx-icon/src/fontawesome/solid/xmark.svg?raw";

// Constructive
import saveSvg from "danx-icon/src/fontawesome/solid/floppy-disk.svg?raw";
import createSvg from "danx-icon/src/fontawesome/solid/circle-plus.svg?raw";
import confirmSvg from "danx-icon/src/fontawesome/solid/check.svg?raw";

// Warning
import pauseSvg from "danx-icon/src/fontawesome/solid/pause.svg?raw";
import clockSvg from "danx-icon/src/fontawesome/solid/clock.svg?raw";

// Informational
import viewSvg from "danx-icon/src/fontawesome/solid/eye.svg?raw";
import documentSvg from "danx-icon/src/fontawesome/solid/file-lines.svg?raw";
import usersSvg from "danx-icon/src/fontawesome/solid/users.svg?raw";
import databaseSvg from "danx-icon/src/fontawesome/solid/database.svg?raw";
import folderSvg from "danx-icon/src/fontawesome/solid/folder.svg?raw";
import searchSvg from "danx-icon/src/fontawesome/solid/magnifying-glass.svg?raw";
import circleInfoSvg from "danx-icon/src/fontawesome/solid/circle-info.svg?raw";
import circleQuestionSvg from "danx-icon/src/fontawesome/solid/circle-question.svg?raw";
import triangleExclamationSvg from "danx-icon/src/fontawesome/solid/triangle-exclamation.svg?raw";

// Neutral
import backSvg from "danx-icon/src/fontawesome/solid/arrow-left.svg?raw";
import editSvg from "danx-icon/src/fontawesome/solid/pen-to-square.svg?raw";
import copySvg from "danx-icon/src/fontawesome/solid/copy.svg?raw";
import refreshSvg from "danx-icon/src/fontawesome/solid/arrows-rotate.svg?raw";
import exportSvg from "danx-icon/src/fontawesome/solid/file-export.svg?raw";
import importSvg from "danx-icon/src/fontawesome/solid/file-import.svg?raw";
import minusSvg from "danx-icon/src/fontawesome/solid/minus.svg?raw";
import mergeSvg from "danx-icon/src/fontawesome/solid/code-merge.svg?raw";
import restartSvg from "danx-icon/src/fontawesome/solid/arrow-rotate-right.svg?raw";
import playSvg from "danx-icon/src/fontawesome/solid/play.svg?raw";
import downloadSvg from "danx-icon/src/fontawesome/solid/download.svg?raw";
import pencilSvg from "danx-icon/src/fontawesome/solid/pencil.svg?raw";
import keyboardSvg from "danx-icon/src/fontawesome/solid/keyboard.svg?raw";
import codeSvg from "danx-icon/src/fontawesome/solid/code.svg?raw";
import chevronDownSvg from "danx-icon/src/fontawesome/solid/chevron-down.svg?raw";
import chevronRightSvg from "danx-icon/src/fontawesome/solid/chevron-right.svg?raw";
import chevronUpSvg from "danx-icon/src/fontawesome/solid/chevron-up.svg?raw";
import chevronLeftSvg from "danx-icon/src/fontawesome/solid/chevron-left.svg?raw";
import listSvg from "danx-icon/src/fontawesome/solid/list.svg?raw";
import gearSvg from "danx-icon/src/fontawesome/solid/gear.svg?raw";
import handleSvg from "danx-icon/src/fontawesome/solid/grip-vertical.svg?raw";
import musicSvg from "danx-icon/src/fontawesome/solid/music.svg?raw";
import filePdfSvg from "danx-icon/src/fontawesome/solid/file-pdf.svg?raw";

// Destructive
export const trashIcon = trashSvg;
export const stopIcon = stopSvg;
export const closeIcon = closeSvg;

// Constructive
export const saveIcon = saveSvg;
export const createIcon = createSvg;
export const confirmIcon = confirmSvg;
export const checkIcon = confirmIcon;

// Warning
export const pauseIcon = pauseSvg;
export const clockIcon = clockSvg;

// Informational
export const viewIcon = viewSvg;
export const documentIcon = documentSvg;
export const usersIcon = usersSvg;
export const databaseIcon = databaseSvg;
export const folderIcon = folderSvg;
export const searchIcon = searchSvg;
export const infoIcon = circleInfoSvg;
export const questionIcon = circleQuestionSvg;
export const warningTriangleIcon = triangleExclamationSvg;

// Neutral
export const cancelIcon = circleXmarkSvg;
export const backIcon = backSvg;
export const editIcon = editSvg;
export const copyIcon = copySvg;
export const refreshIcon = refreshSvg;
export const exportIcon = exportSvg;
export const importIcon = importSvg;
export const minusIcon = minusSvg;
export const mergeIcon = mergeSvg;
export const restartIcon = restartSvg;
export const playIcon = playSvg;
export const downloadIcon = downloadSvg;
export const pencilIcon = pencilSvg;
export const keyboardIcon = keyboardSvg;
export const codeIcon = codeSvg;
export const chevronDownIcon = chevronDownSvg;
export const chevronRightIcon = chevronRightSvg;
export const chevronUpIcon = chevronUpSvg;
export const chevronLeftIcon = chevronLeftSvg;
export const listIcon = listSvg;
export const gearIcon = gearSvg;
export const handleIcon = handleSvg;
export const musicIcon = musicSvg;
export const filePdfIcon = filePdfSvg;

/**
 * Lookup map from icon name to SVG string.
 * DanxIcon uses this internally to resolve `icon="trash"` style shorthand.
 */
export const iconRegistry = {
  trash: trashIcon,
  stop: stopIcon,
  close: closeIcon,
  save: saveIcon,
  create: createIcon,
  confirm: confirmIcon,
  check: checkIcon,
  pause: pauseIcon,
  clock: clockIcon,
  view: viewIcon,
  document: documentIcon,
  users: usersIcon,
  database: databaseIcon,
  folder: folderIcon,
  search: searchIcon,
  cancel: cancelIcon,
  back: backIcon,
  edit: editIcon,
  copy: copyIcon,
  refresh: refreshIcon,
  export: exportIcon,
  import: importIcon,
  minus: minusIcon,
  merge: mergeIcon,
  restart: restartIcon,
  play: playIcon,
  download: downloadIcon,
  pencil: pencilIcon,
  keyboard: keyboardIcon,
  code: codeIcon,
  "chevron-down": chevronDownIcon,
  "chevron-right": chevronRightIcon,
  "chevron-up": chevronUpIcon,
  "chevron-left": chevronLeftIcon,
  info: infoIcon,
  question: questionIcon,
  "warning-triangle": warningTriangleIcon,
  list: listIcon,
  gear: gearIcon,
  handle: handleIcon,
  music: musicIcon,
  "file-pdf": filePdfIcon,
} satisfies Record<string, string>;

/** Union of all built-in icon names available in the iconRegistry lookup map */
export type IconName = keyof typeof iconRegistry;
