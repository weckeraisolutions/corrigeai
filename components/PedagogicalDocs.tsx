
import React, { useState, useCallback } from 'react';
import { Correction, PedagogicalError, QuantitativeSummary } from '../types';
import FileUpload from './FileUpload';
import ProcessingView from './ProcessingView';
import ResultsView from './ResultsView';
import NoCorrectionsView from './NoCorrectionsView';
import PedagogicalErrorsView from './PedagogicalErrorsView';
import { extractTextFromDocx } from '../services/docxService';
import { getPedagogicalCorrections } from '../services/geminiService';

type AppState = 'upload' | 'processing' | 'linguisticResult' | 'pedagogicalErrorResult' | 'error' | 'no-corrections';

interface PedagogicalDocsProps {
    onBack: () => void;
}

export default function PedagogicalDocs({ onBack }: PedagogicalDocsProps) {
  const [appState, setAppState] = useState<AppState>('upload');
  const [error, setError] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [linguisticCorrections, setLinguisticCorrections] = useState<Correction[]>([]);
  const [pedagogicalErrors, setPedagogicalErrors] = useState<PedagogicalError[]>([]);
  const [detectedType, setDetectedType] = useState<string>('');
  const [bqSummary, setBqSummary] = useState<QuantitativeSummary | undefined>(undefined);

  const handleFileProcess = useCallback(async (file: File) => {
    setAppState('processing');
    setOriginalFile(file);
    setError(null);
    setLinguisticCorrections([]);
    setPedagogicalErrors([]);
    setDetectedType('');
    setBqSummary(undefined);

    try {
      const textContent = await extractTextFromDocx(file);
      if (!textContent.trim()) {
        throw new Error("O documento parece estar vazio. Por favor, verifique o arquivo e tente novamente.");
      }

      const result = await getPedagogicalCorrections(textContent);
      
      setDetectedType(result.detectedType);
      setBqSummary(result.bqSummary);
      
      if (result.pedagogicalErrors && result.pedagogicalErrors.length > 0) {
        setPedagogicalErrors(result.pedagogicalErrors);
        setAppState('pedagogicalErrorResult');
        return;
      }
      
      if (result.linguisticCorrections && result.linguisticCorrections.length > 0) {
        setLinguisticCorrections(result.linguisticCorrections);
        setAppState('linguisticResult');
        return;
      }
      
      setAppState('no-corrections');

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
      setError(`Falha no processamento: ${errorMessage}. Por favor, tente novamente.`);
      setAppState('error');
    }
  }, []);

  const handleReset = () => {
    setAppState('upload');
    setError(null);
    setOriginalFile(null);
    setLinguisticCorrections([]);
    setPedagogicalErrors([]);
    setDetectedType('');
    setBqSummary(undefined);
  };

  const renderContent = () => {
    switch (appState) {
      case 'upload':
        return <FileUpload onProcess={handleFileProcess} fileType=".docx" title="Revisão de Atividades Avaliativas" />;
      case 'processing':
        return <ProcessingView />;
      case 'linguisticResult':
        if (!originalFile) {
          handleReset();
          return null;
        }
        const isQuestionBank = detectedType.includes('BANCO DE QUESTÕES');
        const rows = linguisticCorrections.map(c => ({
            index: isQuestionBank 
                ? (c.questionNumber ?? 'N/A') 
                : (c.paragraphIndex !== undefined ? c.paragraphIndex + 1 : 'N/A'),
            originalSnippet: c.originalSnippet,
            editorialAdjustment: c.editorialAdjustment,
            revisedVersion: c.revisedVersion
        }));
        
        return (
            <div className="w-full flex flex-col items-center">
                {isQuestionBank && bqSummary && (
                    <div className="w-full max-w-6xl mb-8 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                       <div className="flex items-center justify-between mb-4 border-b pb-2">
                          <h3 className="font-bold text-gray-700">Resumo Quantitativo (Banco de Questões)</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${bqSummary.conformidade === 'Ok' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              Conformidade: {bqSummary.conformidade === 'Ok' ? 'VALIDADA' : 'INVÁLIDA'}
                          </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs uppercase text-gray-500 font-bold">Total</p>
                              <p className="text-2xl font-bold text-brand-secondary">{bqSummary.totalQuestoes}</p>
                          </div>
                           <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs uppercase text-gray-500 font-bold">Aderentes</p>
                              <p className="text-2xl font-bold text-brand-secondary">{bqSummary.aderentes}</p>
                          </div>
                           <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs uppercase text-gray-500 font-bold">Transversais</p>
                              <p className="text-2xl font-bold text-brand-secondary">{bqSummary.transversais}</p>
                          </div>
                      </div>
                    </div>
                )}
                
                <ResultsView 
                    rows={rows} 
                    fileName={originalFile.name} 
                    onReset={handleReset} 
                    detectedType={detectedType} 
                    indexColumnHeader={isQuestionBank ? 'Questão' : 'Parágrafo'} 
                    pedagogicalValidationPassed={isQuestionBank}
                />
            </div>
        );
      case 'pedagogicalErrorResult':
        if (!originalFile) {
          handleReset();
          return null;
        }
        return <PedagogicalErrorsView errors={pedagogicalErrors} fileName={originalFile.name} onReset={handleReset} />;
      case 'no-corrections':
        return <NoCorrectionsView onReset={handleReset} />;
      case 'error':
        return (
          <div className="text-center p-8 bg-brand-surface rounded-lg shadow-sm border border-red-200">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Erro!</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-brand-primary text-white rounded-full hover:bg-brand-dark transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        );
      default:
        return <FileUpload onProcess={handleFileProcess} fileType=".docx" title="Revisão de Atividades Avaliativas" />;
    }
  };

  return (
    <div className="w-full">
        <button onClick={onBack} className="mb-4 text-brand-primary hover:text-brand-dark font-medium transition-colors">
            &larr; Voltar
        </button>
        {renderContent()}
    </div>
    );
}