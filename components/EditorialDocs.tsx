
import React, { useState, useCallback } from 'react';
import { Correction } from '../types';
import FileUpload from './FileUpload';
import ProcessingView from './ProcessingView';
import ResultsView from './ResultsView';
import NoCorrectionsView from './NoCorrectionsView';
import { extractTextFromDocx } from '../services/docxService';
import { getCorrections } from '../services/geminiService';

type AppState = 'upload' | 'processing' | 'result' | 'error' | 'no-corrections';

interface EditorialDocsProps {
    onBack: () => void;
}

export default function EditorialDocs({ onBack }: EditorialDocsProps) {
  const [appState, setAppState] = useState<AppState>('upload');
  const [error, setError] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [corrections, setCorrections] = useState<Correction[]>([]);

  const handleFileProcess = useCallback(async (file: File) => {
    setAppState('processing');
    setOriginalFile(file);
    setError(null);
    setCorrections([]);

    try {
      const textContent = await extractTextFromDocx(file);
      if (!textContent.trim()) {
        throw new Error("O documento parece estar vazio. Por favor, verifique o arquivo e tente novamente.");
      }

      const foundCorrections: Correction[] = await getCorrections(textContent);
      
      if (foundCorrections.length === 0) {
        setAppState('no-corrections');
        return;
      }
      
      setCorrections(foundCorrections);
      setAppState('result');
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
    setCorrections([]);
  };

  const renderContent = () => {
    switch (appState) {
      case 'upload':
        return <FileUpload onProcess={handleFileProcess} fileType=".docx" title="Revisão de Ebook" />;
      case 'processing':
        return <ProcessingView />;
      case 'result':
        if (corrections.length === 0 || !originalFile) {
          handleReset();
          return null;
        }
        const rows = corrections.map(c => ({
            index: c.paragraphIndex !== undefined ? c.paragraphIndex + 1 : 'N/A',
            originalSnippet: c.originalSnippet,
            editorialAdjustment: c.editorialAdjustment,
            revisedVersion: c.revisedVersion
        }));
        return <ResultsView rows={rows} fileName={originalFile.name} onReset={handleReset} indexColumnHeader="Parágrafo" />;
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
        return <FileUpload onProcess={handleFileProcess} fileType=".docx" title="Revisão de Ebook" />;
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