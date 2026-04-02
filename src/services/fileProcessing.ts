import mammoth from 'mammoth';
import Quill from 'quill';
import type Html2Pdf from 'html2pdf.js';

let htmlDocxModulePromise: Promise<HtmlDocxModule> | null = null;
let html2PdfPromise: Promise<typeof Html2Pdf> | null = null;

const loadHtml2Pdf = async () => {
  if (!html2PdfPromise) {
    html2PdfPromise = import('html2pdf.js').then((module) => module.default);
  }

  return html2PdfPromise;
};

const loadHtmlDocx = async () => {
  if (!htmlDocxModulePromise) {
    htmlDocxModulePromise = new Promise<HtmlDocxModule>((resolve, reject) => {
      if (window.htmlDocx) {
        resolve(window.htmlDocx);
        return;
      }

      const existingScript = document.querySelector<HTMLScriptElement>('script[data-html-docx-loader="true"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          if (window.htmlDocx) {
            resolve(window.htmlDocx);
            return;
          }

          reject(new Error('html-docx.js loaded without exposing window.htmlDocx.'));
        }, { once: true });
        existingScript.addEventListener('error', () => {
          reject(new Error('Failed to load local html-docx.js asset.'));
        }, { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = '/vendor/html-docx.js';
      script.async = true;
      script.dataset.htmlDocxLoader = 'true';
      script.onload = () => {
        if (window.htmlDocx) {
          resolve(window.htmlDocx);
          return;
        }

        reject(new Error('html-docx.js loaded without exposing window.htmlDocx.'));
      };
      script.onerror = () => {
        reject(new Error('Failed to load local html-docx.js asset.'));
      };

      document.body.appendChild(script);
    });
  }

  return htmlDocxModulePromise;
};

const downloadBlob = (blob: Blob, filename: string) => {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

export class FileProcessingService {
  /**
   * Reads a .docx file and imports it through the Quill document model.
   */
  static async importDocx(file: File, quillInstance: Quill) {
    if (!file) return;

    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (arrayBuffer) {
          try {
            const result = await mammoth.convertToHtml({ arrayBuffer });
            const html = result.value;

            quillInstance.setContents([], 'api');
            quillInstance.clipboard.dangerouslyPasteHTML(0, html, 'api');

            resolve();
          } catch (err) {
            reject(err);
          }
        }
      };

      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Exports the current editor HTML to a .docx file.
   */
  static async exportDocx(quillHtml: string, filename: string = 'document.docx') {
    const htmlDocx = await loadHtmlDocx();
    const htmlString = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${quillHtml}</body></html>`;
    const converted = htmlDocx.asBlob(htmlString);

    downloadBlob(converted, filename);
  }

  /**
   * Exports a DOM container to a PDF file.
   */
  static async exportPdf(element: HTMLElement, filename: string = 'document.pdf') {
    const html2pdf = await loadHtml2Pdf();
    const options = {
      margin: 10,
      filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    await html2pdf().set(options).from(element).save();
  }
}
