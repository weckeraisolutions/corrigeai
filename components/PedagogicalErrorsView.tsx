
import React from 'react';
import { PedagogicalError } from '../types';

interface PedagogicalErrorsViewProps {
  errors: PedagogicalError[];
  fileName: string;
  onReset: () => void;
}

export default function PedagogicalErrorsView({ errors, fileName, onReset }: PedagogicalErrorsViewProps) {
  return (
    <div className="p-8 bg-brand-surface rounded-lg shadow-sm w-full max-w-6xl border-2 border-red-300">
      <div className="text-center">
        <svg className="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        <h2 className="text-2xl font-bold text-red-600 mt-4 mb-2">Revisão Bloqueada!</h2>
        <p className="text-gray-600 mb-2">
          A IA identificou erros pedagógicos ou conceituais críticos no arquivo <span className="font-semibold text-brand-secondary">{fileName}</span>.
        </p>
        <p className="text-sm text-gray-500">
          A revisão linguística não será executada até que estes problemas sejam corrigidos manualmente.
        </p>
      </div>
      
      <div className="overflow-x-auto mt-8 border border-brand-border rounded-lg">
        <table className="min-w-full divide-y divide-brand-border text-left text-sm">
          <thead className="bg-red-50">
            <tr>
              <th scope="col" className="px-6 py-3 font-medium text-red-700 uppercase tracking-wider">Questão</th>
              <th scope="col" className="px-6 py-3 font-medium text-red-700 uppercase tracking-wider">Tipo de Erro</th>
              <th scope="col" className="px-6 py-3 font-medium text-red-700 uppercase tracking-wider">O que está errado</th>
              <th scope="col" className="px-6 py-3 font-medium text-red-700 uppercase tracking-wider">O que deve ser corrigido</th>
            </tr>
          </thead>
          <tbody className="bg-brand-surface divide-y divide-brand-border">
            {errors.map((error, idx) => (
              <tr key={idx}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-brand-text">{error.questionNumber}</td>
                <td className="px-6 py-4 text-gray-700">{error.errorType}</td>
                <td className="px-6 py-4 text-gray-700">{error.whatIsWrong}</td>
                <td className="px-6 py-4 text-gray-700">{error.whatShouldBeCorrected}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onReset}
          className="px-8 py-3 bg-brand-secondary text-white font-bold rounded-full shadow-md hover:bg-gray-700 transition-colors"
        >
          Analisar Outro Documento
        </button>
      </div>
    </div>
  );
}