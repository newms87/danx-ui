/**
 * uploadFileToUrl - Generic XHR Upload Utility
 *
 * Uploads a File to a URL using XMLHttpRequest (not fetch, which lacks
 * upload progress events). Apps compose this into their FileUploadHandler.
 *
 * Progress is reported 0-95 during the XHR upload. The last 5% is reserved
 * for the completion step (server processing, response handling) so that
 * DanxFile's progress bar doesn't sit at 100% before the upload is truly done.
 *
 * Supports AbortController cancellation via the signal option.
 */

import type { UploadFileToUrlOptions } from "./types";

/**
 * Upload a file to the given URL via XHR.
 *
 * @param file - The File object to upload
 * @param url - The destination URL
 * @param options - Optional method, headers, progress callback, and abort signal
 * @returns Promise resolving to the completed XMLHttpRequest
 */
export function uploadFileToUrl(
  file: File,
  url: string,
  options?: UploadFileToUrlOptions
): Promise<XMLHttpRequest> {
  return new Promise<XMLHttpRequest>((resolve, reject) => {
    const method = options?.method ?? "POST";
    const headers = options?.headers;
    const onProgress = options?.onProgress;
    const signal = options?.signal;

    const xhr = new XMLHttpRequest();
    xhr.open(method, url);

    // Set Content-Type from the file's MIME type
    if (file.type) {
      xhr.setRequestHeader("Content-Type", file.type);
    }

    // Apply custom headers
    if (headers) {
      for (const [key, value] of Object.entries(headers)) {
        xhr.setRequestHeader(key, value);
      }
    }

    // Track upload progress (0-95 range, reserving 5% for completion)
    if (onProgress) {
      xhr.upload.onprogress = (event: ProgressEvent) => {
        if (event.lengthComputable) {
          const percent = Math.min(Math.round((event.loaded / event.total) * 95), 95);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr);
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Upload network error"));
    };

    xhr.onabort = () => {
      reject(new Error("Upload aborted"));
    };

    // Wire up AbortController signal
    if (signal) {
      if (signal.aborted) {
        xhr.abort();
        reject(new Error("Upload aborted"));
        return;
      }
      signal.addEventListener("abort", () => xhr.abort(), { once: true });
    }

    xhr.send(file);
  });
}
