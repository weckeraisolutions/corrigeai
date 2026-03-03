
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source for pdf.js
// This is necessary for the library to work correctly in a web environment.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.5.136/build/pdf.worker.min.mjs`;

/**
 * Extracts raw text content from each page of a PDF file.
 * @param file The PDF file to process.
 * @returns A promise that resolves to an array of strings, where each string is the text content of a page.
 */
export async function extractTextFromPdf(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const pageTexts: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    // Join all text items on a page, preserving line breaks which helps with structure inference.
    const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join('\n');
    pageTexts.push(pageText);
  }

  return pageTexts;
}
