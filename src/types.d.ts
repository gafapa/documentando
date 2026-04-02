interface HtmlDocxModule {
  asBlob: (html: string, options?: Record<string, unknown>) => Blob;
}

interface Window {
  htmlDocx?: HtmlDocxModule;
}

interface ImportMetaEnv {
  readonly VITE_PEER_HOST?: string;
  readonly VITE_PEER_PORT?: string;
  readonly VITE_PEER_PATH?: string;
  readonly VITE_PEER_SECURE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
