// utils/polyfills.ts
import { parse as urlParse } from "url";

// If pdfjs calls URL.parse(..) in the browser, make sure it exists.
if (typeof URL.parse !== "function") {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore – we’re monkey-patching a global
  URL.parse = urlParse as any;
}
