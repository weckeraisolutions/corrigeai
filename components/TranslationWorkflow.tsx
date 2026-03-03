
import React, { useState, useCallback, useRef } from 'react';
import { DocumentType, TargetLanguage, TranslationWorkflowState, DocumentPage, StructuralBlock } from '../types';
import { processPdf, processPptx, translateBlock } from '../services/translationService';
import { generatePdf, generatePptx } from '../services/outputService';
import ProcessingView from './ProcessingView';

interface TranslationWorkflowProps {
  docType: DocumentType;
  onBack: () => void;
}

const languageMap: Record<TargetLanguage, string> = {
  'en-US': 'English (US)',
  'es-LATAM': 'Spanish (LATAM)',
  'hi-IN': 'Hindi (hi-IN)',
};

export default function TranslationWorkflow({ docType, onBack }: TranslationWorkflowProps) {
  const [state, setState] = useState<TranslationWorkflowState>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<TargetLanguage>('en-US');
  const [error, setError] = useState<string | null>(null);
  const [documentPages, setDocumentPages] = useState<DocumentPage[]>([]);
  
  const previewRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const acceptedFileType = docType.endsWith('pdf') ? '.pdf' : '.pptx';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleTranslate = useCallback(async () => {
    if (!file) return;

    setState('parsing');
    setError(null);

    try {
      let pages: DocumentPage[];
      if (file.type.includes('presentation')) {
          pages = await processPptx(file);
      } else {
          pages = await processPdf(file);
      }
      
      setState('translating');
      const translatedPages: DocumentPage[] = [];

      for (const page of pages) {
          const translatedBlocksForPage: StructuralBlock[] = [];
          for (const block of page.blocks) {
              const translatedText = await translateBlock(block, language, languageMap[language]);
              translatedBlocksForPage.push({ ...block, translatedText });
              // Increased delay to be more conservative and avoid hitting the API rate limit.
              await new Promise(resolve => setTimeout(resolve, 2100));
          }
          translatedPages.push({ ...page, blocks: translatedBlocksForPage });
      }

      setDocumentPages(translatedPages);
      setState('preview');
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during translation';
      
      if (errorMessage.includes('PERMISSION_DENIED') || errorMessage.includes('API key not valid')) {
          setError('Ocorreu um erro de permissão. Verifique se a chave de API configurada para a aplicação tem as permissões necessárias para usar os modelos de IA avançados.');
      } else if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('Quota exceeded')) {
          setError('A cota de requisições da API foi excedida (Erro 429). Isso pode acontecer com documentos muito grandes no plano gratuito. Por favor, tente novamente mais tarde ou verifique seu plano e detalhes de faturamento.');
      } else {
        setError(errorMessage);
      }
      setState('error');
    }
  }, [file, language]);

  const handleDownload = async () => {
      if(!file) return;
      setState('generating');
      try {
          if (docType.endsWith('pptx')) {
              await generatePptx(documentPages, file.name);
          } else {
              if (previewRef.current) {
                await generatePdf(previewRef.current, file.name);
              }
          }
      } catch (err) {
          console.error("Failed to generate file", err);
          setError("Failed to generate file for download.");
      } finally {
          setState('preview');
      }
  }

  const renderIdle = () => (
    <div className="w-full max-w-2xl bg-brand-surface p-8 rounded-lg shadow-sm border border-brand-border">
      <button onClick={onBack} className="mb-6 text-brand-primary hover:text-brand-dark font-medium transition-colors">
          &larr; Voltar
      </button>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-brand-secondary">Traduzir {docType}</h2>
        <p className="text-gray-500">Selecione o arquivo e o idioma de destino.</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Arquivo ({acceptedFileType})</label>
        <div 
            className="border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer border-brand-border"
            onClick={() => fileInputRef.current?.click()}
        >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept={acceptedFileType} className="hidden" />
            <p className="text-gray-500">{file ? file.name : `Clique para selecionar um arquivo ${acceptedFileType}`}</p>
        </div>
      </div>

      <div className="mb-8">
        <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">Traduzir para</label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value as TargetLanguage)}
          className="w-full p-2 border border-brand-border rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary"
        >
          {Object.entries(languageMap).map(([code, name]) => (
            <option key={code} value={code}>{name}</option>
          ))}
        </select>
      </div>

      <div className="text-center">
        <button
          onClick={handleTranslate}
          disabled={!file}
          className="px-8 py-3 bg-brand-primary text-white font-bold rounded-full shadow-md disabled:bg-gray-400 hover:bg-brand-dark transition-colors"
        >
          Traduzir Documento
        </button>
      </div>
    </div>
  );
  
  const renderPreview = () => (
    <div className="w-full">
        <div className="bg-gray-100 p-4 rounded-lg shadow-sm border mb-4 flex justify-between items-center">
            <div>
                <h3 className="font-bold text-lg">Preview da Tradução</h3>
                <p className="text-sm text-gray-600">O texto é editável. Clique para corrigir.</p>
            </div>
            <div>
                 <button onClick={onBack} className="text-sm px-4 py-2 mr-2 bg-gray-200 text-gray-800 font-bold rounded-full shadow-sm hover:bg-gray-300 transition-colors">Voltar</button>
                <button onClick={handleDownload} disabled={state === 'generating'} className="px-6 py-2 bg-brand-primary text-white font-bold rounded-full shadow-md disabled:bg-gray-400 hover:bg-brand-dark transition-colors">
                    {state === 'generating' ? 'Gerando...' : 'Download'}
                </button>
            </div>
        </div>
        <div ref={previewRef} className="bg-white p-8 shadow-lg border rounded-md max-h-[70vh] overflow-y-auto">
            {documentPages.map(page => (
                <div key={page.pageNumber} className="mb-8 border-b-2 border-dashed pb-4 border-gray-200" style={{ pageBreakAfter: 'always' }}>
                    {page.blocks.map(block => {
                        const Tag = block.type === 'h1' || block.type === 'h2' || block.type === 'h3' || block.type === 'p' ? block.type : 'p';
                        const isListItem = block.type === 'li';
                        return isListItem ? (
                            <li key={block.id} contentEditable onBlur={e => block.translatedText = e.currentTarget.textContent || ''} className="ml-8 list-disc py-1">{block.translatedText}</li>
                        ) : (
                            <Tag key={block.id} contentEditable onBlur={e => block.translatedText = e.currentTarget.textContent || ''} className="py-1">{block.translatedText}</Tag>
                        );
                    })}
                    <div className="text-center text-xs text-gray-400 mt-4">- {page.pageNumber} -</div>
                </div>
            ))}
        </div>
    </div>
  );

  const renderError = () => (
    <div className="w-full max-w-2xl text-center p-8 bg-brand-surface rounded-lg shadow-sm border border-red-200">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Erro na Tradução!</h2>
        <p className="text-gray-700 mb-6">{error}</p>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-brand-primary text-white rounded-full hover:bg-brand-dark transition-colors"
        >
          Voltar
        </button>
    </div>
  );

  if (state === 'error') {
    return renderError();
  }

  if (state === 'preview' || state === 'generating') {
    return renderPreview();
  }

  if (state === 'parsing' || state === 'translating') {
    return <ProcessingView />;
  }

  return renderIdle();
}
