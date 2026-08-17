# Paste Files

`usePasteFiles` turns a browser `ClipboardEvent` into `File` objects. It handles the two
things a paste can meaningfully produce — pasted files (a screenshot, a copied image) and
a wall of pasted text that should become an attachment instead of message text — and stays
out of the way for everything else.

It is **pure and synchronous**: it never calls `preventDefault()`, never touches the DOM,
and never uploads. You inspect the result and decide. Uploading is the app's job via the
existing [`FileUploadHandler`](./danx-file-upload.md) contract.

## Basic Usage

```ts
import { usePasteFiles } from "danx-ui";

const { extractFiles } = usePasteFiles();

function onPaste(event: ClipboardEvent) {
  const result = extractFiles(event);
  if (!result.handled) return; // nothing to do — let the browser paste normally

  event.preventDefault();
  attachments.value.push(...result.files);
}
```

```vue
<textarea v-model="message" @paste="onPaste" />
```

## The three outcomes

| `kind`       | When                                                                 | `handled`                                        |
| ------------ | -------------------------------------------------------------------- | ------------------------------------------------ |
| `files`      | The clipboard carried file items (screenshot, copied file)           | `true` if at least one file passed validation    |
| `large-text` | Plain text longer than `largePasteThreshold` was converted to a file | `true` if the synthesized file passed validation |
| `none`       | Short text, or an empty clipboard, or no `clipboardData` at all      | always `false`                                   |

**`handled` means exactly one thing: at least one `File` was produced.** That is the only
signal you need to decide whether to call `preventDefault()`. The composable never swallows
an event it did not handle.

## PasteResult

```ts
interface PasteResult {
  kind: "files" | "large-text" | "none";
  handled: boolean;
  files: File[];
  text: string | null;
  rejected: PasteRejection[];
}

interface PasteRejection {
  file: File;
  reason: "type" | "size";
  message: string;
}
```

| Field      | Description                                                                                                                                         |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`     | What the clipboard contained (table above).                                                                                                         |
| `handled`  | `files.length > 0`. True = you should `preventDefault()`.                                                                                           |
| `files`    | Files that passed `accept` and `maxFileSize`. Plain browser `File` objects — feed them straight to your `FileUploadHandler`.                        |
| `text`     | The clipboard's `text/plain` payload, or `null` if it carried none. Present on every kind, so a large-text paste can be undone back into the input. |
| `rejected` | Candidate files that failed validation, each with a reason and a message safe to display.                                                           |

Rejections are **always informational**. A paste whose files were all rejected reports
`handled: false` plus the reasons — so you can show an error _and_ let the default paste
behaviour proceed rather than silently eating the event.

## Options

```ts
const { extractFiles } = usePasteFiles({
  largePasteThreshold: 2000,
  maxFileSize: 5 * 1024 * 1024,
  accept: "image/*,.pdf",
  nameLargePaste: (index) => `pasted-snippet-${index}.txt`,
});
```

| Option                | Type                                      | Default                                  | Description                                                                                                     |
| --------------------- | ----------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `largePasteThreshold` | `number`                                  | `DEFAULT_LARGE_PASTE_THRESHOLD` (`4000`) | Character count a plain-text paste must **exceed** to become a file. Text of exactly this length is still text. |
| `maxFileSize`         | `number`                                  | unset (no limit)                         | Maximum size in bytes for any produced file. Larger files land in `rejected` with `reason: "size"`.             |
| `accept`              | `string`                                  | unset (everything)                       | MIME filter with the same semantics as the `accept` attribute: `"image/*"`, `"application/pdf"`, `".png,.pdf"`. |
| `nameLargePaste`      | `(index: number, text: string) => string` | `` `pasted-text-${index}.txt` ``         | Names the file synthesized from a large text paste.                                                             |

### The threshold default is not a hidden magic number

The default is exported as a constant so you can reference it, display it, or base your own
value on it:

```ts
import { DEFAULT_LARGE_PASTE_THRESHOLD, LARGE_PASTE_MIME } from "danx-ui";

DEFAULT_LARGE_PASTE_THRESHOLD; // 4000
LARGE_PASTE_MIME; // "text/plain"
```

Several thousand characters is the point where a paste stops reading as a message and
starts reading as a document. Lower it for compact inputs; raise it for editors where long
prose is normal.

### `nameLargePaste` indexing

`index` is a counter **per `usePasteFiles()` instance**, starting at `1` and incremented on
every conversion attempt (including ones that end up rejected). Two composables created
separately each start at `1`. The default produces `pasted-text-1.txt`, `pasted-text-2.txt`,
and so on, which keeps repeated pastes in one composer distinguishable.

### `accept` applies to synthesized text files too

This is deliberate and occasionally surprising: with `accept: "image/*"`, a huge text paste
produces `kind: "large-text"`, `handled: false`, and a `type` rejection — so the text falls
through and pastes normally instead of arriving as an unwanted `.txt` attachment.

## Worked example — wiring it to an input

```vue
<script setup lang="ts">
import { ref } from "vue";
import { usePasteFiles } from "danx-ui";

const message = ref("");
const attachments = ref<File[]>([]);
const lastError = ref("");
/** The text a large paste replaced, so the user can put it back. */
const undoableText = ref<string | null>(null);

const { extractFiles } = usePasteFiles({
  largePasteThreshold: 2000,
  maxFileSize: 10 * 1024 * 1024,
});

function onPaste(event: ClipboardEvent) {
  const result = extractFiles(event);

  lastError.value = result.rejected.map((r) => r.message).join(" ");

  if (!result.handled) return; // short text, empty clipboard, or everything rejected

  event.preventDefault();
  attachments.value.push(...result.files);
  undoableText.value = result.kind === "large-text" ? result.text : null;
}

function undoLargePaste() {
  if (undoableText.value === null) return;
  message.value += undoableText.value;
  attachments.value.pop();
  undoableText.value = null;
}
</script>

<template>
  <textarea v-model="message" @paste="onPaste" />
  <p v-if="lastError" class="text-danger">{{ lastError }}</p>
  <button v-if="undoableText" @click="undoLargePaste">Paste as text instead</button>
</template>
```

### Uploading the results

`usePasteFiles` deliberately stops at `File[]`. Hand those to your app's
`FileUploadHandler`, which is what turns a `File` into a `PreviewFile`:

```ts
import type { FileUploadHandler, PreviewFile } from "danx-ui";

const uploaded: PreviewFile[] = [];

async function upload(files: File[], handler: FileUploadHandler) {
  const controller = new AbortController();
  for (const file of files) {
    uploaded.push(await handler(file, () => {}, controller.signal));
  }
}
```

## Where the files come from

A clipboard can expose pasted files two ways. `usePasteFiles` reads
`clipboardData.items` first — some browsers surface a pasted screenshot only through
`DataTransferItem.getAsFile()` — and falls back to `clipboardData.files` when the item list
yields nothing. You do not need to care which path fired.

## SSR safety

`usePasteFiles` registers no listeners, no lifecycle hooks, and touches no globals at
creation time. Calling it during server-side rendering is safe; `extractFiles` only ever
runs from a real paste event in the browser.
