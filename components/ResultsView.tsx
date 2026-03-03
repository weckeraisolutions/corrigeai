
import React from 'react';

interface ResultRow {
    index: number | string;
    originalSnippet: string;
    editorialAdjustment: string;
    revisedVersion: string;
}

interface ResultsViewProps {
  rows: ResultRow[];
  fileName: string;
  onReset: () => void;
  detectedType?: string;
  indexColumnHeader?: string;
  pedagogicalValidationPassed?: boolean;
  hideResetButton?: boolean;
}

export default function ResultsView({ rows, fileName, onReset, detectedType, indexColumnHeader = 'Parágrafo', pedagogicalValidationPassed = false, hideResetButton = false }: ResultsViewProps) {
  return (
    <div className="p-8 bg-brand-surface rounded-xl shadow-sm w-full max-w-7xl border border-brand-border">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 className="text-3xl font-bold text-brand-secondary mb-2">Revisão Concluída</h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          A IA analisou o arquivo <span className="font-semibold text-brand-secondary bg-gray-100 px-2 py-0.5 rounded">{fileName}</span> e identificou os seguintes pontos de atenção:
        </p>

        {pedagogicalValidationPassed && (
          <div className="mt-6 flex justify-center">
            <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-full flex items-center gap-2 shadow-sm">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span className="text-sm font-semibold text-green-800">
                Revisão Pedagógica: Aprovada
              </span>
            </div>
          </div>
        )}

        {detectedType && (
            <div className="mt-4 inline-block">
                <span className="text-xs font-bold text-brand-primary uppercase tracking-wider bg-brand-primary/10 px-3 py-1 rounded-full">
                    {detectedType}
                </span>
            </div>
        )}
      </div>
      
      <div className="overflow-hidden border border-brand-border rounded-xl shadow-sm">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-brand-border text-left text-sm">
            <thead className="bg-gray-50">
                <tr>
                <th scope="col" className="px-6 py-4 font-semibold text-gray-900 uppercase tracking-wider text-xs w-24">{indexColumnHeader}</th>
                <th scope="col" className="px-6 py-4 font-semibold text-gray-900 uppercase tracking-wider text-xs w-1/3">Trecho Original</th>
                <th scope="col" className="px-6 py-4 font-semibold text-gray-900 uppercase tracking-wider text-xs w-1/4">Ajuste Editorial</th>
                <th scope="col" className="px-6 py-4 font-semibold text-gray-900 uppercase tracking-wider text-xs w-1/3">Versão Revisada</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
                {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-500 text-center bg-gray-50/50 border-r border-gray-100">{row.index}</td>
                    <td className="px-6 py-4 text-gray-600 leading-relaxed bg-red-50/30">
                        <div className="flex items-start gap-2">
                            <span className="text-red-400 mt-0.5 flex-shrink-0">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </span>
                            <span className="line-through decoration-red-300 decoration-2">{row.originalSnippet}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-medium bg-yellow-50/30 border-x border-gray-100">
                        <div className="flex items-start gap-2">
                            <span className="text-yellow-500 mt-0.5 flex-shrink-0">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </span>
                            {row.editorialAdjustment}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-gray-800 leading-relaxed bg-green-50/30">
                        <div className="flex items-start gap-2">
                            <span className="text-green-500 mt-0.5 flex-shrink-0">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            </span>
                            <span className="font-medium text-green-900 bg-green-100/50 px-1 rounded">{row.revisedVersion}</span>
                        </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>

      {!hideResetButton && (
        <div className="mt-8 text-center">
          <button
            onClick={onReset}
            className="px-8 py-3 bg-brand-primary text-white font-bold rounded-full shadow-md hover:bg-brand-dark transition-colors"
          >
            Revisar outro documento
          </button>
        </div>
      )}
    </div>
  );
}