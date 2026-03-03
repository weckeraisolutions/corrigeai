

export function extractAndParseJson<T>(text: string): T {
  try {
    // Find the first '{' and the last '}' to trim any non-JSON text
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
      throw new Error("Could not find a valid JSON object in the response.");
    }

    const jsonString = text.substring(startIndex, endIndex + 1);

    return JSON.parse(jsonString);
  } catch (error: any) {
    console.error("Error parsing JSON from response. Raw text was:", text);
    throw new Error(`Failed to parse JSON from AI response. Original error: ${error.message}`);
  }
}
import { Correction, GeminiCorrectionResponse, GeminiPedagogicalResponse, GeminiPresentationResponse, PresentationCorrection, PedagogicalProcessingResult, GeminiPedagogicalValidationResponse } from '../types';
import { EDITORIAL_REVIEW_PROMPT, PEDAGOGICAL_REVIEW_PROMPT, PEDAGOGICAL_VALIDATION_PROMPT, PRESENTATIONS_REVIEW_PROMPT } from '../constants';

// Removed GoogleGenAI and API_KEY logic from frontend
const MODEL_NAME = "gemini-2.5-pro";

// Type definitions replaced with strings for local payload
const correctionSchema = {
  type: "OBJECT",
  properties: {
    paragraphIndex: { type: "INTEGER", description: "O índice do parágrafo (baseado em 0). Usado para documentos textuais." },
    questionNumber: { type: "STRING", description: "O número/identificador da questão. Usado para Bancos de Questões." },
    originalSnippet: { type: "STRING", description: "O trecho exato do texto original que contém o erro. (Trecho Original)" },
    editorialAdjustment: { type: "STRING", description: "Descrição do ajuste editorial realizado. (Ajuste Editorial)" },
    revisedVersion: { type: "STRING", description: "A versão revisada e corrigida do trecho. (Versão Revisada)" },
  },
  required: ["originalSnippet", "editorialAdjustment", "revisedVersion"]
};

const presentationCorrectionSchema = {
  type: "OBJECT",
  properties: {
    slideNumber: { type: "INTEGER", description: "O número da cena (slide) onde o erro foi encontrado (base 1)." },
    originalSnippet: { type: "STRING", description: "O trecho exato do texto original que contém o erro." },
    editorialAdjustment: { type: "STRING", description: "Descrição do ajuste realizado." },
    revisedVersion: { type: "STRING", description: "A versão revisada e corrigida do trecho." },
  },
  required: ["slideNumber", "originalSnippet", "editorialAdjustment", "revisedVersion"]
};

const responseSchema = {
  type: "OBJECT",
  properties: {
    corrections: {
      type: "ARRAY",
      items: correctionSchema,
      description: "Uma lista de todas as correções encontradas no documento."
    }
  },
  required: ["corrections"]
}

const pedagogicalResponseSchema = {
  type: "OBJECT",
  properties: {
    detectedType: { type: "STRING", description: "O tipo de documento pedagógico detectado pela IA (e.g., 'TIPO A — ATIVIDADE CONTEXTUALIZADA')." },
    corrections: {
      type: "ARRAY",
      items: correctionSchema,
      description: "Uma lista de todas as correções encontradas no documento."
    },
    bqSummary: {
      type: "OBJECT",
      properties: {
        totalQuestoes: { type: "INTEGER", description: "Número total de questões encontradas." },
        aderentes: { type: "INTEGER", description: "Número de questões aderentes." },
        transversais: { type: "INTEGER", description: "Número de questões transversais." },
        conformidade: { type: "STRING", description: "'Ok' ou 'Invalida'." }
      },
      description: "Resumo quantitativo para Bancos de Questões."
    }
  },
  required: ["detectedType", "corrections"]
}

const presentationResponseSchema = {
  type: "OBJECT",
  properties: {
    detectedType: { type: "STRING", description: "O tipo de apresentação detectado pela IA (e.g., 'TIPO P1 — APRESENTAÇÃO CONTEUDISTA / EXPLICATIVA')." },
    corrections: {
      type: "ARRAY",
      items: presentationCorrectionSchema,
      description: "Uma lista de todas as correções encontradas na apresentação."
    }
  },
  required: ["detectedType", "corrections"]
}

const pedagogicalValidationSchema = {
  type: "OBJECT",
  properties: {
    validationStatus: {
      type: "STRING",
      description: "O status da validação. Deve ser 'STATUS_ERRO_CONCEITUAL_ENCONTRADO' ou 'STATUS_APTO_PARA_REVISAO_LINGUISTICA'."
    },
    pedagogicalErrors: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          questionNumber: { type: "STRING", description: "Número ou identificação da questão com erro." },
          errorType: { type: "STRING", description: "O tipo de erro pedagógico encontrado." },
          whatIsWrong: { type: "STRING", description: "Descrição objetiva do que está errado na questão." },
          whatShouldBeCorrected: { type: "STRING", description: "Ação corretiva clara e explícita que o operador deve tomar." },
        },
        required: ["questionNumber", "errorType", "whatIsWrong", "whatShouldBeCorrected"]
      },
      description: "Uma lista de erros pedagógicos encontrados. Vazio se o status for apto."
    }
  },
  required: ["validationStatus", "pedagogicalErrors"]
};


const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds
const FALLBACK_MODEL = MODEL_NAME;

async function generateContentWithRetry(model: string, contents: string, config: any, retries = 0): Promise<any> {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        contents,
        config,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data; // Backend proxy returns the standard Gemini payload
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
      console.warn(`Local Proxy / Gemini API Error. Retrying in ${delay}ms... (Attempt ${retries + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return generateContentWithRetry(model, contents, config, retries + 1);
    }

    throw error;
  }
}


export function extractTextFromResponse(response: any): string | undefined {
  if (response?.text) return response.text; // Support SDK format if we ever switch back
  if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
    return response.candidates[0].content.parts[0].text;
  }
  return undefined;
}

export async function getCorrections(documentText: string): Promise<Correction[]> {
  const model = MODEL_NAME; // Switched to 3.1 Pro Preview for stability and longevity

  try {
    const response = await generateContentWithRetry(model, `Analise o seguinte texto e identifique os erros de acordo com as regras fornecidas:\n\n${documentText}`, {
      systemInstruction: EDITORIAL_REVIEW_PROMPT,
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    });

    const responseText = extractTextFromResponse(response);
    if (!responseText) {
      throw new Error("A resposta da IA estava vazia.");
    }

    const parsedResponse: GeminiCorrectionResponse = extractAndParseJson(responseText);

    if (!parsedResponse.corrections) {
      console.warn("A resposta da IA não continha o campo 'corrections'.", parsedResponse);
      return [];
    }

    return parsedResponse.corrections;

  } catch (error) {
    console.error("Erro ao chamar a API via Proxy:", error);
    throw new Error("Não foi possível obter as correções da IA.");
  }
}

export async function getPedagogicalCorrections(documentText: string): Promise<PedagogicalProcessingResult> {
  const model = MODEL_NAME; // Switched to 3.1 Pro Preview for stability and longevity

  try {
    // Etapa 1 & 2: Validar o documento conceitualmente e detectar o tipo
    const validationResponse = await generateContentWithRetry(model, `Valide o seguinte documento educacional:\n\n${documentText}`, {
      systemInstruction: PEDAGOGICAL_VALIDATION_PROMPT,
      responseMimeType: "application/json",
      responseSchema: pedagogicalValidationSchema,
    });

    const validationText = extractTextFromResponse(validationResponse);
    if (!validationText) {
      throw new Error("A resposta da validação pedagógica estava vazia.");
    }
    const parsedValidation: GeminiPedagogicalValidationResponse = extractAndParseJson(validationText);

    // Etapa 3: Verificar o status da validação. Se houver erros, bloquear e retornar.
    if (parsedValidation.validationStatus === 'STATUS_ERRO_CONCEITUAL_ENCONTRADO') {
      return {
        detectedType: 'Banco de Questões (com erros conceituais)',
        pedagogicalErrors: parsedValidation.pedagogicalErrors,
      };
    }

    // Etapa 4: Se apto para revisão, prosseguir com a correção linguística.
    if (parsedValidation.validationStatus === 'STATUS_APTO_PARA_REVISAO_LINGUISTICA') {
      const linguisticResponse = await generateContentWithRetry(model, `Analise o seguinte texto e identifique os erros de acordo com as regras fornecidas:\n\n${documentText}`, {
        systemInstruction: PEDAGOGICAL_REVIEW_PROMPT,
        responseMimeType: "application/json",
        responseSchema: pedagogicalResponseSchema,
      });

      const linguisticText = extractTextFromResponse(linguisticResponse);
      if (!linguisticText) {
        throw new Error("A resposta da revisão linguística estava vazia.");
      }

      const parsedLinguistic: GeminiPedagogicalResponse = extractAndParseJson(linguisticText);

      if (!parsedLinguistic.corrections || !parsedLinguistic.detectedType) {
        console.warn("A resposta da IA (linguística) não continha os campos 'corrections' ou 'detectedType'.", parsedLinguistic);
        throw new Error("A resposta da IA (linguística) está malformada.");
      }

      return {
        detectedType: parsedLinguistic.detectedType,
        linguisticCorrections: parsedLinguistic.corrections,
        bqSummary: parsedLinguistic.bqSummary
      };
    }

    throw new Error("Status de validação desconhecido: " + parsedValidation.validationStatus);

  } catch (error) {
    console.error("Erro ao chamar a API via Proxy no fluxo pedagógico:", error);
    throw new Error("Não foi possível obter as correções da IA.");
  }
}

export async function getPresentationCorrections(documentText: string): Promise<GeminiPresentationResponse> {
  const model = MODEL_NAME; // Switched to 3.1 Pro Preview for stability and longevity

  try {
    const response = await generateContentWithRetry(model, `Analise o seguinte texto de apresentação e identifique os erros de acordo com as regras fornecidas:\n\n${documentText}`, {
      systemInstruction: PRESENTATIONS_REVIEW_PROMPT,
      responseMimeType: "application/json",
      responseSchema: presentationResponseSchema,
      temperature: 0.1,
    });

    const responseText = extractTextFromResponse(response);
    if (!responseText) {
      throw new Error("A resposta da IA estava vazia.");
    }

    const parsedResponse: GeminiPresentationResponse = extractAndParseJson(responseText);

    if (!parsedResponse.corrections || !parsedResponse.detectedType) {
      console.warn("A resposta da IA não continha os campos 'corrections' ou 'detectedType'.", parsedResponse);
      throw new Error("A resposta da IA está malformada.");
    }

    return parsedResponse;

  } catch (error) {
    console.error("Erro ao chamar a API via Proxy:", error);
    throw new Error("Não foi possível obter as correções da IA devido a uma falha de comunicação. Por favor, tente novamente em alguns instantes.");
  }
}


