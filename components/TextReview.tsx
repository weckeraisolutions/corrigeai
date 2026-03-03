
import React, { useState, useCallback } from 'react';
import { Correction } from '../types';
import ResultsView from './ResultsView';
import NoCorrectionsView from './NoCorrectionsView';
import ProcessingView from './ProcessingView';
import { getCorrections } from '../services/geminiService';

type AppState = 'idle' | 'processing' | 'result' | 'error' | 'no-corrections';

export default function TextReview() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [corrections, setCorrections] = useState<Correction[]>([]);
  
  const handleReview = useCallback(async () => {
    if (!text.trim()) return;

    setAppState('processing');
    setError(null);
    setCorrections([]);

    try {
      const foundCorrections = await getCorrections(text);
      if (foundCorrections.length === 0) {
        setAppState('no-corrections');
      } else {
        setCorrections(foundCorrections);
        setAppState('result');
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
      setError(`Falha na revisão: ${errorMessage}.`);
      setAppState('error');
    }
  }, [text]);
  
  const handleReset = () => {
      setAppState('idle');
      setError(null);
      setCorrections([]);
      setText('');
  }

  if (appState === 'processing') return <ProcessingView />;
  if (appState === 'no-corrections') return <NoCorrectionsView onReset={handleReset} />;
  if (appState === 'error') return (
       <div className="text-center p-8 bg-brand-surface rounded-lg shadow-sm border border-red-200">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Erro!</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <button onClick={handleReset} className="px-6 py-2 bg-brand-primary text-white rounded-full hover:bg-brand-dark transition-colors">
              Tentar Novamente
            </button>
        </div>
  );

  if (appState === 'result') {
      const rows = corrections.map(c => ({
        index: c.paragraphIndex !== undefined ? c.paragraphIndex + 1 : 'N/A',
        originalSnippet: c.originalSnippet,
        editorialAdjustment: c.editorialAdjustment,
        revisedVersion: c.revisedVersion
    }));
      return (
        <div className="w-full">
            <button onClick={handleReset} className="mb-4 text-brand-primary hover:text-brand-dark font-medium transition-colors">
                &larr; Voltar
            </button>
            <ResultsView rows={rows} fileName="Texto Livre" onReset={handleReset} indexColumnHeader="Parágrafo" hideResetButton={true} />
        </div>
      );
  }


  return (
    <div className="w-full bg-brand-surface p-8 rounded-lg shadow-sm border border-brand-border">
      <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-brand-secondary">Revisão Rápida de Texto</h2>
          <p className="text-gray-500 text-sm">Cole seu texto abaixo para uma análise gramatical instantânea.</p>
      </div>
      
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={1000}
        className="w-full h-40 p-3 border-2 border-brand-border rounded-lg focus:ring-brand-primary focus:border-brand-primary transition bg-brand-surface text-brand-text"
        placeholder="Digite ou cole até 1000 caracteres aqui..."
      />
      <div className="text-right text-sm text-gray-500 mt-1">
        {text.length} / 1000
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={handleReview}
          disabled={!text.trim()}
          className="px-8 py-3 bg-brand-primary text-white font-bold rounded-full shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-brand-dark transition-colors"
        >
          Revisar Texto
        </button>
      </div>
    </div>
  );
}