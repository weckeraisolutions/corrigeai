
import React, { useState } from 'react';
import Card from './Card';
import EditorialDocs from './EditorialDocs';
import PedagogicalDocs from './PedagogicalDocs';
import Presentations from './Presentations';
import TextReview from './TextReview';

// FIX: Removed 'text' from ReviewSubModule as it's an unused and unimplemented feature causing a type error.
type ReviewSubModule = 'home' | 'editorial' | 'pedagogical' | 'presentations';

const bookIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>`;
const clipboardIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.125 2.25h-4.5c-1.125 0-2.062.938-2.062 2.063v15.375c0 1.125.938 2.063 2.063 2.063h10.5c1.125 0 2.063-.938 2.063-2.063V8.625c0-.625-.25-1.188-.656-1.594l-4.125-4.125A2.25 2.25 0 0 0 10.125 2.25Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M10.125 2.25V6.75h4.5" /></svg>`;
const presentationIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h12A2.25 2.25 0 0 0 20.25 14.25V3M3.75 14.25v4.5A2.25 2.25 0 0 0 6 21h12a2.25 2.25 0 0 0 2.25-2.25v-4.5M3.75 14.25h16.5" /></svg>`;

const moduleDetails = {
  editorial: {
    icon: bookIcon,
    title: 'Ebook (.docx)',
    description: 'Revisão de E-books, livros e materiais institucionais. Foco em gramática, estilo e fluidez.',
  },
  pedagogical: {
    icon: clipboardIcon,
    title: 'Atividades Avaliativas (.docx)',
    description: 'Análise de bancos de questões e atividades. Foco em clareza, precisão e objetivo pedagógico.',
  },
  presentations: {
    icon: presentationIcon,
    title: 'Apresentações (.pptx)',
    description: 'Correção de slides e materiais de apresentação. Foco em concisão e impacto visual.',
  },
};

export default function ReviewModule() {
  const [activeSubModule, setActiveSubModule] = useState<ReviewSubModule>('home');

  const handleBack = () => setActiveSubModule('home');

  if (activeSubModule === 'editorial') {
    return <EditorialDocs onBack={handleBack} />;
  }
  if (activeSubModule === 'pedagogical') {
    return <PedagogicalDocs onBack={handleBack} />;
  }
  if (activeSubModule === 'presentations') {
    return <Presentations onBack={handleBack} />;
  }
  // FIX: Removed the unreachable 'text' submodule block that was causing a type error.

  // Home view for the review module
  return (
    <div className="w-full max-w-5xl">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-brand-secondary mb-2">
          Módulo de Revisão Linguística
        </h2>
        <p className="text-gray-500">
          Utilize o motor de revisão da CorrigeAI para analisar textos ou documentos.
        </p>
      </div>

      <TextReview />

      <div className="relative py-8">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-brand-background px-3 text-base font-semibold leading-6 text-gray-900">OU</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card
          icon={moduleDetails.editorial.icon}
          title={moduleDetails.editorial.title}
          description={moduleDetails.editorial.description}
          onClick={() => setActiveSubModule('editorial')}
        />
        <Card
          icon={moduleDetails.pedagogical.icon}
          title={moduleDetails.pedagogical.title}
          description={moduleDetails.pedagogical.description}
          onClick={() => setActiveSubModule('pedagogical')}
        />
        <Card
          icon={moduleDetails.presentations.icon}
          title={moduleDetails.presentations.title}
          description={moduleDetails.presentations.description}
          onClick={() => setActiveSubModule('presentations')}
        />
      </div>
    </div>
  );
}
