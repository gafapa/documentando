interface HtmlDocxModule {
  asBlob: (html: string, options?: Record<string, unknown>) => Blob;
}

interface Window {
  htmlDocx?: HtmlDocxModule;
}

interface ImportMetaEnv {
  readonly VITE_SIGNALING_PORT?: string;
  readonly VITE_SIGNALING_URLS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
