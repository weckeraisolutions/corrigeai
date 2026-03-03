
import JSZip from 'jszip';

/**
 * Extracts text from each slide of a .pptx file.
 * A .pptx file is a zip archive containing XML files. This function unzips it
 * and parses the XML for each slide to extract its text content.
 * @param file The .pptx file to process.
 * @returns A promise that resolves to an array of strings, where each string is the text content of a slide.
 */
export async function extractTextFromPptx(file: File): Promise<string[]> {
  const zip = await JSZip.loadAsync(file);
  const slidePromises: Promise<{ slideNumber: number; text: string }>[] = [];
  const slideFolder = zip.folder('ppt/slides');

  if (slideFolder) {
    slideFolder.forEach((relativePath, zipObject) => {
      if (relativePath.startsWith('slide') && relativePath.endsWith('.xml')) {
        const slideNumberMatch = relativePath.match(/slide(\d+)\.xml/);
        if (slideNumberMatch) {
          const slideNumber = parseInt(slideNumberMatch[1], 10);
          const promise = zipObject.async('string').then(xmlString => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
            
            // Find all paragraphs (a:p)
            // We use getElementsByTagName to be namespace-agnostic or handle the 'a:' prefix commonly used in PPTX
            const paragraphs = Array.from(xmlDoc.getElementsByTagName('a:p'));
            
            let slideText = '';
            
            paragraphs.forEach(p => {
                let paragraphText = '';
                
                // Iterate over child nodes to respect order of runs, breaks, and fields
                for (let i = 0; i < p.childNodes.length; i++) {
                    const child = p.childNodes[i] as Element;
                    
                    // Handle Text Runs (a:r)
                    if (child.nodeName === 'a:r') {
                        for (let j = 0; j < child.childNodes.length; j++) {
                            const runChild = child.childNodes[j] as Element;
                            if (runChild.nodeName === 'a:t') {
                                paragraphText += runChild.textContent || '';
                            } else if (runChild.nodeName === 'a:br') {
                                paragraphText += '\n';
                            } else if (runChild.nodeName === 'a:tab') {
                                paragraphText += '\t';
                            }
                        }
                    } 
                    // Handle Line Breaks directly in paragraph (a:br)
                    else if (child.nodeName === 'a:br') {
                        paragraphText += '\n';
                    } 
                    // Handle Fields (a:fld) - e.g., slide numbers, dates
                    else if (child.nodeName === 'a:fld') {
                        for (let j = 0; j < child.childNodes.length; j++) {
                            const fldChild = child.childNodes[j] as Element;
                            if (fldChild.nodeName === 'a:t') {
                                paragraphText += fldChild.textContent || '';
                            }
                        }
                    }
                    // Handle bare text nodes if any (unlikely in valid DrawingML but good for safety)
                    else if (child.nodeName === 'a:t') {
                        paragraphText += child.textContent || '';
                    }
                }
                
                if (paragraphText.trim()) {
                    slideText += paragraphText + '\n';
                }
            });
            
            return { slideNumber, text: slideText.trim() };
          });
          slidePromises.push(promise);
        }
      }
    });
  }

  const slides = await Promise.all(slidePromises);
  
  // Sort slides by their number to ensure correct order
  slides.sort((a, b) => a.slideNumber - b.slideNumber);

  return slides.map(slide => slide.text);
}
