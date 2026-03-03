
import PptxGenJS from 'pptxgenjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DocumentPage } from '../types';

/**
 * Generates a new .pptx file from the translated document pages.
 * @param pages The array of translated DocumentPage objects.
 * @param originalFileName The original file name to use for the new file.
 */
export async function generatePptx(pages: DocumentPage[], originalFileName: string) {
  const pptx = new PptxGenJS();
  
  pages.forEach(page => {
    const slide = pptx.addSlide();
    const textContent = page.blocks.map(block => block.translatedText).join('\n');
    // Add a single text box with all content. This is a simplification.
    // A more advanced version would handle positions and styles.
    slide.addText(textContent, { x: 0.5, y: 0.5, w: '90%', h: '90%' });
  });

  const newFileName = originalFileName.replace('.pptx', '_translated.pptx');
  pptx.writeFile({ fileName: newFileName });
}

/**
 * Generates a .pdf file from an HTML element.
 * @param element The HTML element containing the preview to be converted.
 * @param originalFileName The original file name to use for the new file.
 */
export async function generatePdf(element: HTMLElement, originalFileName: string) {
  const canvas = await html2canvas(element, { scale: 2 }); // Higher scale for better quality
  const imgData = canvas.toDataURL('image/png');
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [canvas.width, canvas.height]
  });

  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  
  const newFileName = originalFileName.replace('.pdf', '_translated.pdf');
  pdf.save(newFileName);
}
