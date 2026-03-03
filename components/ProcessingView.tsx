
import React from 'react';

export default function ProcessingView() {
  return (
    <div className="text-center p-12 bg-brand-surface rounded-xl shadow-sm flex flex-col items-center border border-brand-border max-w-lg mx-auto">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-brand-primary/20 rounded-full animate-ping"></div>
        <div className="relative bg-white p-4 rounded-full shadow-sm border border-brand-primary/10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand-primary border-r-transparent border-l-transparent"></div>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-brand-secondary mb-3">Processando documento</h2>
      <p className="text-gray-500 leading-relaxed">
        A IA está analisando o conteúdo, verificando regras gramaticais e de estilo. Isso pode levar alguns segundos.
      </p>
      
      <div className="mt-8 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div className="bg-brand-primary h-1.5 rounded-full animate-progress w-full origin-left"></div>
      </div>
      <style>{`
        @keyframes progress {
            0% { transform: scaleX(0); }
            50% { transform: scaleX(0.7); }
            100% { transform: scaleX(1); }
        }
        .animate-progress {
            animation: progress 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}