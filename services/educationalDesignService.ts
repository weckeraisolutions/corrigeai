import { extractTextFromDocx } from './docxService';
import { extractTextFromResponse } from './geminiService';
import { PEDAGOGICAL_MEMORY_PROMPT, PEDAGOGICAL_REPORT_PROMPT, PEDAGOGICAL_ARTIFACT_ANALYSIS_PROMPT, PEDAGOGICAL_QUESTION_BANK_ANALYSIS_PROMPT } from '../constants';
import { EducationalDesignResult, PedagogicalMemory, PedagogicalReport, ArtifactAnalysisResult, ArtifactType } from '../types';

const MODEL_NAME = "gemini-2.5-pro";

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 2000;

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
            return generateContentWithRetry(model, contents, config, retries + 1);
        }

        throw error;
    }
}

// 1. Schema para FASE 2A: Memória Pedagógica
const pedagogicalMemorySchema = {
    type: "OBJECT",
    properties: {
        title: { type: "STRING" },
        identifiedCatalog: { type: "STRING", enum: ['Qualisuper', 'Qualipós', 'Indefinido'] },
        chapters: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    chapterTitle: { type: "STRING" },
                    centralThemes: { type: "ARRAY", items: { type: "STRING" } },
                    keyConcepts: { type: "ARRAY", items: { type: "STRING" } },
                    inferredLearningObjectives: { type: "ARRAY", items: { type: "STRING" } }
                }
            }
        },
        globalAssessment: {
            type: "OBJECT",
            properties: {
                didacticProgression: { type: "STRING", enum: ['adequada', 'irregular'] },
                predominantCognitiveLevel: { type: "STRING", enum: ['compreensão', 'aplicação', 'análise', 'síntese'] },
                conceptualDensity: { type: "STRING", enum: ['baixa', 'média', 'alta'] }
            }
        }
    },
    required: ['title', 'identifiedCatalog', 'chapters', 'globalAssessment']
};

// 2. Schema para FASE 2B: Relatório de Análise
const pedagogicalReportSchema = {
    type: "OBJECT",
    properties: {
        statusGeral: { type: "STRING", enum: ['NaoPrecisaDeAjuste', 'AjustesNecessarios'] },
        strengths: { type: "ARRAY", items: { type: "STRING" } },
        adjustments: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    chapter: { type: "STRING" },
                    subchapter: { type: "STRING" },
                    paragraphReference: { type: "NUMBER" },
                    problemIdentified: { type: "STRING" },
                    educationalJustification: { type: "STRING" },
                    suggestionForAdjustment: { type: "STRING" },
                    gravity: { type: "STRING", enum: ['Baixa', 'Média', 'Alta'] }
                },
                required: ['chapter', 'problemIdentified', 'educationalJustification', 'suggestionForAdjustment', 'gravity']
            }
        }
    },
    required: ['statusGeral', 'strengths', 'adjustments']
};

// 3. Schema para FASE 3: Análise de Artefato (ATC/DCO)
const artifactAnalysisSchema = {
    type: "OBJECT",
    properties: {
        statusGeral: { type: "STRING", enum: ['NaoPrecisaDeAjuste', 'AjustesNecessarios'] },
        ajustes: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    artefato: { type: "STRING", enum: ['ATC', 'DCO'] },
                    capituloRelacionado: { type: "STRING" },
                    subcapituloRelacionado: { type: "STRING" },
                    paragrafoReferencia: { type: "NUMBER" },
                    problemaIdentificado: { type: "STRING" },
                    justificativaEducacional: { type: "STRING" },
                    sugestaoDeAjuste: { type: "STRING" },
                    gravidade: { type: "STRING", enum: ['Baixa', 'Média', 'Alta'] }
                },
                required: ['artefato', 'capituloRelacionado', 'problemaIdentificado', 'justificativaEducacional', 'sugestaoDeAjuste', 'gravidade']
            }
        }
    },
    required: ['statusGeral', 'ajustes']
};

// 4. Schema para FASE 4: Análise de Banco de Questões (BQ)
const questionBankAnalysisSchema = {
    type: "OBJECT",
    properties: {
        statusGeral: { type: "STRING", enum: ['NaoPrecisaDeAjuste', 'AjustesNecessarios'] },
        resumoQuantitativo: {
            type: "OBJECT",
            properties: {
                totalQuestoes: { type: "NUMBER" },
                aderentes: { type: "NUMBER" },
                transversais: { type: "NUMBER" },
                conformidade: { type: "STRING", enum: ['Ok', 'Invalida'] }
            },
            required: ['totalQuestoes', 'aderentes', 'transversais', 'conformidade']
        },
        ajustes: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    questao: { type: "NUMBER" },
                    tipo: { type: "STRING", enum: ['Aderente', 'Transversal'] },
                    capitulosRelacionados: { type: "ARRAY", items: { type: "STRING" } },
                    problemaIdentificado: { type: "STRING" },
                    justificativaEducacional: { type: "STRING" },
                    sugestaoDeAjuste: { type: "STRING" },
                    gravidade: { type: "STRING", enum: ['Baixa', 'Média', 'Alta'] }
                },
                required: ['questao', 'tipo', 'capitulosRelacionados', 'problemaIdentificado', 'justificativaEducacional', 'sugestaoDeAjuste', 'gravidade']
            }
        }
    },
    required: ['statusGeral', 'resumoQuantitativo', 'ajustes']
};


export async function analyzeEbookAndCreateMemory(file: File): Promise<EducationalDesignResult> {
    const model = MODEL_NAME; // Using Pro model for complex analysis

    // 1. Extract Text
    const textContent = await extractTextFromDocx(file);

    if (!textContent.trim()) {
        throw new Error("O Ebook parece estar vazio ou não pôde ser lido.");
    }

    // Limit input context to ensure stability, though 3-pro handles a lot.
    // Using a safe margin for text extraction noise.
    const inputContext = textContent.substring(0, 300000);

    try {
        // --- FASE 2A: GERAÇÃO DA MEMÓRIA PEDAGÓGICA ---
        console.log("Iniciando Fase 2A: Memória Pedagógica...");
        const memoryResponse = await generateContentWithRetry(model, `Analise o seguinte Ebook e extraia a Memória Pedagógica:\n\n${inputContext}`, {
            systemInstruction: PEDAGOGICAL_MEMORY_PROMPT,
            responseMimeType: "application/json",
            responseSchema: pedagogicalMemorySchema,
        });

        const memoryText = extractTextFromResponse(memoryResponse);
        if (!memoryText) throw new Error("A IA não retornou a Memória Pedagógica.");

        const parsedMemory = JSON.parse(memoryText);

        // DATA SANITIZATION / NORMALIZATION
        // Ensure arrays are arrays to avoid runtime errors in UI
        parsedMemory.chapters = Array.isArray(parsedMemory.chapters) ? parsedMemory.chapters.map((c: any) => ({
            ...c,
            centralThemes: Array.isArray(c.centralThemes) ? c.centralThemes : [],
            keyConcepts: Array.isArray(c.keyConcepts) ? c.keyConcepts : [],
            inferredLearningObjectives: Array.isArray(c.inferredLearningObjectives) ? c.inferredLearningObjectives : []
        })) : [];


        // Construct Memory Object
        const memory: PedagogicalMemory = {
            ...parsedMemory,
            ebookId: crypto.randomUUID(),
            analyzedAt: new Date(),
            sourceFileName: file.name
        };

        // --- FASE 2B: GERAÇÃO DO RELATÓRIO DE ANÁLISE ---
        console.log("Iniciando Fase 2B: Relatório de Design...");

        // We pass the summary of the memory to help the AI focus, plus the text again.
        const memorySummary = JSON.stringify({
            title: memory.title,
            catalog: memory.identifiedCatalog,
            structure: memory.chapters.map(c => c.chapterTitle)
        });

        const reportResponse = await generateContentWithRetry(model, `Contexto da Estrutura Identificada: ${memorySummary}\n\nAgora, analise o texto completo abaixo para gerar o Relatório de Ajustes Pedagógicos:\n\n${inputContext}`, {
            systemInstruction: PEDAGOGICAL_REPORT_PROMPT,
            responseMimeType: "application/json",
            responseSchema: pedagogicalReportSchema,
        });

        const reportText = extractTextFromResponse(reportResponse);
        if (!reportText) throw new Error("A IA não retornou o Relatório de Análise.");

        const parsedReport = JSON.parse(reportText);

        // REPORT SANITIZATION
        parsedReport.strengths = Array.isArray(parsedReport.strengths) ? parsedReport.strengths : [];
        parsedReport.adjustments = Array.isArray(parsedReport.adjustments) ? parsedReport.adjustments : [];

        const report: PedagogicalReport = parsedReport;

        return { memory, report };

    } catch (error) {
        console.error("Erro na análise de Design Educacional:", error);

        // Improve error messaging for user
        let errorMessage = "Falha ao analisar o Ebook devido a uma instabilidade na comunicação com a IA. Por favor, tente novamente.";
        if (error instanceof SyntaxError) {
            errorMessage = "Erro ao processar a resposta da IA (JSON Inválido). Tente novamente.";
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
}

export async function analyzePedagogicalArtifact(file: File, artifactType: ArtifactType, memory: PedagogicalMemory): Promise<ArtifactAnalysisResult> {
    const model = MODEL_NAME;

    // 1. Extract Text
    const textContent = await extractTextFromDocx(file);

    if (!textContent.trim()) {
        throw new Error(`O arquivo ${artifactType} parece estar vazio ou não pôde ser lido.`);
    }

    const inputContext = textContent.substring(0, 100000);

    // Prepare Memory Context
    const memoryContext = JSON.stringify({
        tituloCurso: memory.title,
        capitulos: memory.chapters.map(c => ({
            titulo: c.chapterTitle,
            conceitos: c.keyConcepts,
            objetivos: c.inferredLearningObjectives
        }))
    });

    // Select Prompt and Schema based on Artifact Type
    let systemInstruction = PEDAGOGICAL_ARTIFACT_ANALYSIS_PROMPT;
    let schema: any = artifactAnalysisSchema;

    if (artifactType === 'BQ') {
        systemInstruction = PEDAGOGICAL_QUESTION_BANK_ANALYSIS_PROMPT;
        schema = questionBankAnalysisSchema;
    }

    try {
        console.log(`Iniciando Fase ${artifactType === 'BQ' ? '4' : '3'}: Análise de Artefato (${artifactType})...`);
        const response = await generateContentWithRetry(model, `MEMÓRIA PEDAGÓGICA DO EBOOK (Contexto de Referência):
            ${memoryContext}
            
            ARTEFATO PARA ANÁLISE (${artifactType}):
            ${inputContext}`, {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: schema,
        }
        );

        const responseText = extractTextFromResponse(response);
        if (!responseText) throw new Error("A IA não retornou a análise do artefato.");

        const parsedResult = JSON.parse(responseText);

        // Sanitize
        parsedResult.ajustes = Array.isArray(parsedResult.ajustes) ? parsedResult.ajustes : [];

        // Special handling for BQ transversal chapters sanitization if needed
        if (artifactType === 'BQ') {
            parsedResult.ajustes = parsedResult.ajustes.map((adj: any) => ({
                ...adj,
                capitulosRelacionados: Array.isArray(adj.capitulosRelacionados) ? adj.capitulosRelacionados : []
            }));
        }

        return parsedResult as ArtifactAnalysisResult;

    } catch (error) {
        console.error("Erro na análise de Artefato Pedagógico:", error);
        let errorMessage = `Falha ao analisar ${artifactType}.`;
        if (error instanceof SyntaxError) {
            errorMessage = "Erro ao processar a resposta da IA (JSON Inválido).";
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }
        throw new Error(errorMessage);
    }
}
