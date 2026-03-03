
import React, { useState } from 'react';
import Card from './Card';
import TranslationWorkflow from './TranslationWorkflow';
import { DocumentType } from '../types';

const bookIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>`;
const clipboardIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.125 2.25h-4.5c-1.125 0-2.062.938-2.062 2.063v15.375c0 1.125.938 2.063 2.063 2.063h10.5c1.125 0 2.063-.938 2.063-2.063V8.625c0-.625-.25-1.188-.656-1.594l-4.125-4.125A2.25 2.25 0 0 0 10.125 2.25Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M10.125 2.25V6.75h4.5" /></svg>`;
const presentationIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h12A2.25 2.25 0 0 0 20.25 14.25V3M3.75 14.25v4.5A2.25 2.25 0 0 0 6 21h12a2.25 2.25 0 0 0 2.25-2.25v-4.5M3.75 14.25h16.5" /></svg>`;

const translationTypes = {
  'ebook-pdf': {
    icon: bookIcon,
    title: 'Ebook (.pdf)',
    description: 'Tradução estrutural de e-books e materiais densos. Mantém a hierarquia de títulos e parágrafos.',
  },
  'activities-pdf': {
    icon: clipboardIcon,
    title: 'Atividades Avaliativas (.pdf)',
    description: 'Tradução de atividades, exercícios e avaliações, preservando a formatação de questões e alternativas.',
  },
  'presentation-pptx': {
    icon: presentationIcon,
    title: 'Apresentações (.pptx)',
    description: 'Tradução de slides, mantendo o texto conciso e adaptado ao layout de cada cena.',
  },
};

export default function TranslationModule() {
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(null);

  if (selectedDocType) {
    return <TranslationWorkflow docType={selectedDocType} onBack={() => setSelectedDocType(null)} />;
  }

  return (
    <div className="w-full max-w-5xl">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-brand-secondary mb-2">
          Módulo de Tradução – Versão
        </h2>
        <p className="text-gray-500">
          Traduza documentos PT-BR para outros idiomas com alta fidelidade estrutural e visual.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(translationTypes).map(([key, value]) => (
          <div key={key}>
            <Card
              icon={value.icon}
              title={value.title}
              description={value.description}
              onClick={() => setSelectedDocType(key as DocumentType)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}