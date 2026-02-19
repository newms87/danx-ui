/**
 * Browser File Download Utility
 *
 * Ported from download.js v4.2 by dandavis (CC-BY-2).
 * Handles URL downloads (via XHR with blob conversion), direct blob/data downloads,
 * data URLs (including base64 and >2MB), and browser compatibility fallbacks.
 *
 * Server-aware download functions (POST params, header parsing) are NOT included —
 * those belong in the consumer's app layer.
 *
 * @see https://github.com/rndme/download
 */

const DEFAULT_MIME = "application/octet-stream";

/**
 * Convert a data URL string to a Blob.
 * Handles both base64 and URI-encoded data URLs.
 */
function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(/[:;,]/);
  const type = parts[1];
  const isBase64 = parts[2] === "base64";
  const rawData = parts[parts.length - 1]!;
  const decoded = isBase64 ? atob(rawData) : decodeURIComponent(rawData);
  const bytes = new Uint8Array(decoded.length);
  for (let i = 0; i < decoded.length; i++) {
    bytes[i] = decoded.charCodeAt(i);
  }
  return new Blob([bytes], { type });
}

/**
 * Trigger a browser download using an anchor element with the download attribute.
 * Falls back to window.open for legacy Safari, and iframe for older browsers.
 */
function saveBlob(url: string, fileName: string, revokeAfter: boolean): true {
  const anchor = document.createElement("a");

  if ("download" in anchor) {
    anchor.href = url;
    anchor.setAttribute("download", fileName);
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    setTimeout(() => {
      anchor.click();
      document.body.removeChild(anchor);
      if (revokeAfter) {
        setTimeout(() => URL.revokeObjectURL(anchor.href), 250);
      }
    }, 66);
    return true;
  }

  // Safari fallback
  if (/(Version)\/(\d+)\.(\d+)(?:\.(\d+))?.*Safari\//.test(navigator.userAgent)) {
    const safariUrl = url.replace(/^data:([\w/\-+]+)/, DEFAULT_MIME);
    if (!window.open(safariUrl)) {
      location.href = safariUrl;
    }
    return true;
  }

  // Legacy iframe fallback
  const iframe = document.createElement("iframe");
  document.body.appendChild(iframe);
  iframe.src = revokeAfter ? url : "data:" + url.replace(/^data:([\w/\-+]+)/, DEFAULT_MIME);
  setTimeout(() => document.body.removeChild(iframe), 333);
  return true;
}

/**
 * Download a file in the browser.
 *
 * Accepts a URL string, Blob, or data URL. When given a plain URL, fetches it
 * via XHR and converts to a blob download. When given a Blob or data URL,
 * triggers the download directly.
 *
 * @param data - URL string, data URL string, or Blob to download
 * @param filename - Suggested filename for the download (default: "download")
 * @param mimeType - MIME type override (default: "application/octet-stream")
 * @returns `true` for synchronous downloads, or the `XMLHttpRequest` for URL downloads
 */
export function downloadFile(
  data: string | Blob,
  filename?: string,
  mimeType?: string
): true | XMLHttpRequest {
  const mime = mimeType || DEFAULT_MIME;
  const name = filename || "download";

  // If only a URL string is passed (no filename, no mime), treat as URL download
  const isUrlOnly = !filename && !mimeType && typeof data === "string";

  if (isUrlOnly && typeof data === "string" && data.length < 2048) {
    const urlFileName = data.split("/").pop()?.split("?")[0] || "download";
    const anchor = document.createElement("a");
    anchor.href = data;

    const isValidUrl =
      anchor.href.indexOf(data) !== -1 ||
      anchor.href.indexOf(encodeURI(data)) !== -1 ||
      anchor.href === encodeURI(data);

    if (isValidUrl) {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", data + "?no-cache=" + Date.now(), true);
      xhr.responseType = "blob";
      xhr.onload = () => downloadFile(xhr.response as Blob, urlFileName, DEFAULT_MIME);
      xhr.onerror = () => window.open(data, "_blank")?.focus();
      setTimeout(() => xhr.send(), 0);
      return xhr;
    }

    throw new Error("Invalid URL given, cannot download file: " + data);
  }

  // Data URL handling
  if (typeof data === "string" && /^data:[\w+-]+\/[\w+-]+[,;]/.test(data)) {
    if (data.length > 1024 * 1024 * 1.999) {
      // Large data URLs: convert to blob first
      const blob = dataUrlToBlob(data);
      return saveBlob(URL.createObjectURL(blob), name, true);
    }
    return saveBlob(data, name, false);
  }

  // Convert to Blob if needed, then download via object URL
  const blob = data instanceof Blob ? data : new Blob([data], { type: mime });
  return saveBlob(URL.createObjectURL(blob), name, true);
}
