import mammoth from 'mammoth';
import Quill from 'quill';

declare const html2pdf: any;
declare const htmlDocx: any;

export class FileProcessingService {
  /**
   * Lee un archivo .docx y lo convierte en HTML.
   * Luego inyecta ese HTML en Quill, lo cual Yjs sincronizará automáticamente.
   */
  static async importDocx(file: File, quillInstance: Quill) {
    if (!file) return;

    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (arrayBuffer) {
          try {
            // Mammoth convierte docx a HTML con limpiado
            const result = await mammoth.convertToHtml({ arrayBuffer });
            const html = result.value;

            // Limpiamos el editor
            quillInstance.root.innerHTML = '';
            
            // Insertamos como HTML y dejamos que Quill procese
            quillInstance.clipboard.dangerouslyPasteHTML(html);

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
   * Extrae el HTML del editor y lo exporta como .docx
   */
  static exportDocx(quillHtml: string, filename: string = 'documento.docx') {
    const htmlString = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${quillHtml}</body></html>`;
    const converted = htmlDocx.asBlob(htmlString);
    
    // Crear el link de descarga
    const link = document.createElement('a');
    link.href = URL.createObjectURL(converted);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Extrae un contenedor DOM y lo exporta como .pdf
   */
  static exportPdf(element: HTMLElement, filename: string = 'documento.pdf') {
    const opt = {
      margin: 10,
      filename: filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    // New Promise-based usage
    html2pdf().set(opt).from(element).save();
  }
}
