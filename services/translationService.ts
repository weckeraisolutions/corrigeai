
import { GoogleGenAI } from "@google/genai";
import { extractTextFromPptx } from './pptxService';
import { extractTextFromPdf } from './pdfService';
import { DocumentPage, StructuralBlock, TargetLanguage } from '../types';
import { BLOCK_TRANSLATE_PROMPT } from '../constants';
import { extractTextFromResponse } from './geminiService';

const MODEL_NAME = 'gemini-2.5-pro';

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 2000;

async function generateContentWithRetry(model: string, contents: string, retries = 0): Promise<any> {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        contents,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error: any) {
    const errorMessage = error?.message || "";

    const isRetryable =
      errorMessage.includes('503') ||
      errorMessage.includes('504') ||
      errorMessage.includes('429') ||
      errorMessage.includes('fetch failed') ||
      errorMessage.includes('timeout');

    if (isRetryable && retries < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retries);
      console.warn(`Local Proxy Error. Retrying in ${delay}ms... (Attempt ${retries + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return generateContentWithRetry(model, contents, retries + 1);
    }

    throw error;
  }
}

/**
 * Infers the structure of a document from its raw text using heuristics.
 * This local approach avoids making AI calls for structural analysis.
 * @param pageText The raw text content of a single page.
 * @param pageNumber The number of the page being processed.
 * @returns An array of structural blocks.
 */
function inferStructureFromText(pageText: string, pageNumber: number): StructuralBlock[] {
  const lines = pageText.split('\n').filter(line => line.trim() !== '');
  return lines.map((line, index) => {
    const trimmedLine = line.trim();
    let type: StructuralBlock['type'] = 'p';

    // Heuristic for list items (e.g., starts with *, -, 1., a))
    if (/^(\*|-|•|\d+\.|[a-z][.)])\s/.test(trimmedLine)) {
      type = 'li';
      // Heuristic for headings (short, all caps, no period at the end)
    } else if (trimmedLine.length > 2 && trimmedLine.length < 80 && trimmedLine === trimmedLine.toUpperCase() && !trimmedLine.endsWith('.')) {
      type = 'h2';
    }

    return {
      id: `page-${pageNumber}-block-${index}`,
      type: type,
      originalText: trimmedLine,
      translatedText: '',
    };
  });
}
import { extractTextFromResponse } from './geminiService';

export async function translateBlock(block: StructuralBlock, languageCode: TargetLanguage, languageName: string): Promise<string> {
  if (!block.originalText.trim()) {
    return "";
  }
  const model = MODEL_NAME;

  const prompt = BLOCK_TRANSLATE_PROMPT
    .replace('{LANGUAGE_NAME}', languageName)
    .replace('{LANGUAGE_CODE}', languageCode)
    .replace('{BLOCK_TYPE}', block.type)
    .replace('{TEXT_CONTENT}', block.originalText);

  try {
    const response = await generateContentWithRetry(model, prompt);
    const responseText = extractTextFromResponse(response);
    return responseText || "";
  } catch (error) {
    console.error(`Error translating block ID ${block.id}:`, error);
    throw new Error(`Falha na tradução do bloco ${block.id} devido a instabilidade na API. Por favor, tente novamente.`);
  }
}


export async function processPdf(file: File): Promise<DocumentPage[]> {
  const pageTexts = await extractTextFromPdf(file);
  const documentPages: DocumentPage[] = [];

  for (let i = 0; i < pageTexts.length; i++) {
    const pageText = pageTexts[i];
    const blocks = inferStructureFromText(pageText, i + 1);

    documentPages.push({
      pageNumber: i + 1,
      blocks,
    });
  }

  return documentPages;
}


export async function processPptx(file: File): Promise<DocumentPage[]> {
  const slideTexts = await extractTextFromPptx(file);
  return slideTexts.map((slideText, index) => {
    // For PPTX, a simpler line-by-line structure inference is sufficient.
    const blocks: StructuralBlock[] = slideText.split('\n').filter(t => t.trim() !== '').map((text, blockIndex) => ({
      id: `page-${index + 1}-block-${blockIndex}`,
      type: 'p', // Simplified for PPTX, as structure is less defined
      originalText: text,
      translatedText: '',
    }));

    return {
      pageNumber: index + 1,
      blocks,
    };
  });
}
