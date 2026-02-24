<script setup lang="ts">
import { CodeViewer } from "danx-ui";

const jsonData = { key: "value", count: 42 };
const yamlData = { server: { host: "localhost", port: 3000 } };
const htmlCode = "<div class=\"container\">\n  <h1>Hello World</h1>\n  <p>A paragraph.</p>\n</div>";
const cssCode = ".container {\n  display: flex;\n  gap: 1rem;\n  color: var(--primary);\n}";
const jsCode = "// Fibonacci sequence\nfib = (n) => n <= 1 ? n : fib(n - 1) + fib(n - 2);\nconsole.log(fib(10)); // 55";
const textContent = "Plain text content without any\nsyntax highlighting applied.\nUseful for logs or raw output.";
</script>

<template>
  <div class="grid grid-cols-2 gap-4 w-full">
    <CodeViewer :model-value="jsonData" format="json" />
    <CodeViewer :model-value="yamlData" format="yaml" />
    <CodeViewer :model-value="htmlCode" format="html" />
    <CodeViewer :model-value="cssCode" format="css" />
    <CodeViewer :model-value="jsCode" format="javascript" />
    <CodeViewer :model-value="textContent" format="text" />
  </div>
</template>
