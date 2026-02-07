/** Vite ?raw import — resolves any file as a string at build time */
declare module "*.svg?raw" {
  const content: string;
  export default content;
}

/** Vite ?raw import for markdown files */
declare module "*.md?raw" {
  const content: string;
  export default content;
}

/** Vite ?raw import for Vue SFC files (used for demo code examples) */
declare module "*.vue?raw" {
  const content: string;
  export default content;
}
