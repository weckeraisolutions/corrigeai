
import React, { useState, Suspense, lazy } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';

const ReviewModule = lazy(() => import('./components/ReviewModule'));
const TranslationModule = lazy(() => import('./components/TranslationModule'));
const EducationalDesignModule = lazy(() => import('./components/EducationalDesignModule'));

export type ActiveModule = 'review' | 'translation' | 'educational-design';

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center h-full w-full p-8 text-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mb-4"></div>
    <p className="text-gray-500">Carregando módulo...</p>
  </div>
);

export default function App() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('review');

  const renderContent = () => {
    switch (activeModule) {
      case 'review':
        return <ReviewModule />;
      case 'translation':
        return <TranslationModule />;
      case 'educational-design':
        return <EducationalDesignModule />;
      default:
        return <ReviewModule />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-background text-brand-text flex flex-col">
      <Header />
      <div className="flex flex-1 container mx-auto px-4 py-8">
        <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />
        <main className="flex-grow ml-8 flex items-start justify-center pt-4">
          <Suspense fallback={<LoadingFallback />}>
            {renderContent()}
          </Suspense>
        </main>
      </div>
      <Footer />
    </div>
  );
}
