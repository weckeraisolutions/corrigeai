
import React from 'react';

interface NoCorrectionsViewProps {
  onReset: () => void;
}

export default function NoCorrectionsView({ onReset }: NoCorrectionsViewProps) {
  return (
    <div className="text-center p-8 bg-brand-surface rounded-lg shadow-sm w-full max-w-lg border border-brand-border">
      <svg className="w-16 h-16 mx-auto text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h2 className="text-2xl font-bold text-brand-secondary mt-4 mb-2">Nenhuma correção necessária!</h2>
      <p className="text-gray-500 mb-6">
        A IA analisou seu documento e não encontrou erros gramaticais ou ortográficos para sugerir.
      </p>
      
      <div className="mt-8">
        <button
          onClick={onReset}
          className="px-8 py-3 bg-brand-primary text-white font-bold rounded-full shadow-md hover:bg-brand-dark transition-colors"
        >
          Revisar outro documento
        </button>
      </div>
    </div>
  );
}