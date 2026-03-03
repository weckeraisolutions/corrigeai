
import mammoth from 'mammoth';

/**
 * Extracts raw text content from a .docx file.
 */
export async function extractTextFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}
