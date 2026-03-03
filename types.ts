
export interface Correction {
  paragraphIndex?: number;
  questionNumber?: string;
  originalSnippet: string;
  editorialAdjustment: string;
  revisedVersion: string;
}

export interface PresentationCorrection {
  slideNumber: number;
  originalSnippet: string;
  editorialAdjustment: string;
  revisedVersion: string;
}

export interface GeminiCorrectionResponse {
  corrections: Correction[];
}

export interface GeminiPedagogicalResponse {
  detectedType: string;
  corrections: Correction[];
  bqSummary?: QuantitativeSummary;
}

export interface GeminiPresentationResponse {
  detectedType: string;
  corrections: PresentationCorrection[];
}

export interface PedagogicalError {
  questionNumber: string;
  errorType: string;
  whatIsWrong: string;
  whatShouldBeCorrected: string;
}

export interface GeminiPedagogicalValidationResponse {
  validationStatus: 'STATUS_ERRO_CONCEITUAL_ENCONTRADO' | 'STATUS_APTO_PARA_REVISAO_LINGUISTICA';
  pedagogicalErrors: PedagogicalError[];
}

export type PedagogicalProcessingResult = {
  detectedType: string;
  pedagogicalErrors?: PedagogicalError[];
  linguisticCorrections?: Correction[];
  bqSummary?: QuantitativeSummary;
}

// Deprecated, use ActiveModule in App.tsx
export type ModuleType = 'home' | 'editorial' | 'pedagogical' | 'presentations';

// --- NEW TYPES FOR TRANSLATION MODULE ---

export type DocumentType = 'ebook-pdf' | 'activities-pdf' | 'presentation-pptx';

export type TargetLanguage = 'en-US' | 'es-LATAM' | 'hi-IN';

export interface StructuralBlock {
  type: 'h1' | 'h2' | 'h3' | 'p' | 'li' | 'table_cell';
  originalText: string;
  translatedText: string;
  id: string; // Unique ID for editing
}

export interface DocumentPage {
  pageNumber: number;
  blocks: StructuralBlock[];
}

export type TranslationWorkflowState = 'idle' | 'parsing' | 'translating' | 'preview' | 'error' | 'generating';

// --- NEW TYPES FOR EDUCATIONAL DESIGN MODULE (PHASE 2 & 3 & 4) ---

export interface PedagogicalChapter {
  chapterTitle: string;
  centralThemes: string[];
  keyConcepts: string[];
  inferredLearningObjectives: string[];
}

export interface GlobalAssessment {
  didacticProgression: 'adequada' | 'irregular';
  predominantCognitiveLevel: 'compreensão' | 'aplicação' | 'análise' | 'síntese';
  conceptualDensity: 'baixa' | 'média' | 'alta';
}

export interface PedagogicalMemory {
  ebookId: string;
  title: string;
  identifiedCatalog: 'Qualisuper' | 'Qualipós' | 'Indefinido';
  chapters: PedagogicalChapter[];
  globalAssessment: GlobalAssessment;
  analyzedAt: Date;
  sourceFileName: string;
}

export interface PedagogicalAdjustment {
  chapter: string;
  subchapter?: string;
  paragraphReference: number;
  problemIdentified: string;
  educationalJustification: string;
  suggestionForAdjustment: string;
  gravity: 'Baixa' | 'Média' | 'Alta';
}

export interface PedagogicalReport {
  statusGeral: 'NaoPrecisaDeAjuste' | 'AjustesNecessarios';
  adjustments: PedagogicalAdjustment[];
  strengths: string[];
}

export interface EducationalDesignResult {
  memory: PedagogicalMemory;
  report: PedagogicalReport;
}

// --- PHASE 3 & 4: ARTIFACT ANALYSIS TYPES ---

export type ArtifactType = 'ATC' | 'DCO' | 'BQ';

export interface QuantitativeSummary {
  totalQuestoes: number;
  aderentes: number;
  transversais: number;
  conformidade: 'Ok' | 'Invalida';
}

export interface ArtifactAdjustment {
  // Common
  problemaIdentificado: string;
  justificativaEducacional: string;
  sugestaoDeAjuste: string;
  gravidade: 'Baixa' | 'Média' | 'Alta';
  
  // ATC/DCO specific
  artefato?: 'ATC' | 'DCO';
  capituloRelacionado?: string;
  subcapituloRelacionado?: string;
  paragrafoReferencia?: number;

  // BQ specific
  questao?: number;
  tipo?: 'Aderente' | 'Transversal';
  capitulosRelacionados?: string[];
}

export interface ArtifactAnalysisResult {
  statusGeral: 'NaoPrecisaDeAjuste' | 'AjustesNecessarios';
  ajustes: ArtifactAdjustment[];
  resumoQuantitativo?: QuantitativeSummary; // Only for BQ
}
