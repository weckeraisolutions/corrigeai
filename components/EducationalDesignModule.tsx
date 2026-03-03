
import React, { useState } from 'react';
import Card from './Card';
import FileUpload from './FileUpload';
import ProcessingView from './ProcessingView';
import { analyzeEbookAndCreateMemory, analyzePedagogicalArtifact } from '../services/educationalDesignService';
import { PedagogicalMemory, PedagogicalReport, EducationalDesignResult, ArtifactType, ArtifactAnalysisResult } from '../types';

type ModuleState = 'dashboard' | 'upload-ebook' | 'processing-ebook' | 'upload-artifact' | 'processing-artifact' | 'artifact-result';

const ebookIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>`;
const activityIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>`;
const challengeIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>`;
const questionsIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>`;

export default function EducationalDesignModule() {
  const [viewState, setViewState] = useState<ModuleState>('dashboard');
  const [pedagogicalMemory, setPedagogicalMemory] = useState<PedagogicalMemory | null>(null);
  const [report, setReport] = useState<PedagogicalReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Phase 3 & 4 States
  const [activeArtifactType, setActiveArtifactType] = useState<ArtifactType | null>(null);
  const [artifactResult, setArtifactResult] = useState<ArtifactAnalysisResult | null>(null);

  const handleEbookProcess = async (file: File) => {
    setViewState('processing-ebook');
    setError(null);
    try {
      const result: EducationalDesignResult = await analyzeEbookAndCreateMemory(file);
      setPedagogicalMemory(result.memory);
      setReport(result.report);
      setViewState('dashboard');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao processar Ebook.');
      setViewState('dashboard'); 
    }
  };

  const handleArtifactProcess = async (file: File) => {
      if (!pedagogicalMemory || !activeArtifactType) return;
      
      setViewState('processing-artifact');
      setError(null);
      setArtifactResult(null);

      try {
          const result = await analyzePedagogicalArtifact(file, activeArtifactType, pedagogicalMemory);
          setArtifactResult(result);
          setViewState('artifact-result');
      } catch (err) {
          console.error(err);
          setError(err instanceof Error ? err.message : `Erro desconhecido ao processar ${activeArtifactType}.`);
          setViewState('dashboard');
      }
  };

  const startArtifactAnalysis = (type: ArtifactType) => {
      if (!pedagogicalMemory) return;
      setActiveArtifactType(type);
      setViewState('upload-artifact');
  };

  const renderArtifactResult = () => {
      if (!artifactResult || !activeArtifactType) return null;

      const isBQ = activeArtifactType === 'BQ';
      const summary = artifactResult.resumoQuantitativo;

      return (
          <div className="w-full mt-8">
              <button onClick={() => setViewState('dashboard')} className="mb-4 text-brand-primary hover:text-brand-dark font-medium transition-colors">
                  &larr; Voltar ao Dashboard
              </button>

              <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-brand-secondary">Análise de {activeArtifactType === 'BQ' ? 'Banco de Questões' : activeArtifactType}</h2>
                  <p className="text-gray-500">Baseada na Memória Pedagógica do curso.</p>
              </div>

              {/* BQ Specific Quantitative Summary */}
              {isBQ && summary && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
                       <div className="flex items-center justify-between mb-4 border-b pb-2">
                          <h3 className="font-bold text-gray-700">Resumo Quantitativo</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${summary.conformidade === 'Ok' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              Conformidade: {summary.conformidade === 'Ok' ? 'VALIDADA' : 'INVÁLIDA'}
                          </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs uppercase text-gray-500 font-bold">Total</p>
                              <p className="text-2xl font-bold text-brand-secondary">{summary.totalQuestoes}/25</p>
                          </div>
                           <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs uppercase text-gray-500 font-bold">Aderentes</p>
                              <p className={`text-2xl font-bold ${summary.aderentes === 20 ? 'text-green-600' : 'text-red-600'}`}>{summary.aderentes}/20</p>
                          </div>
                           <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs uppercase text-gray-500 font-bold">Transversais</p>
                              <p className={`text-2xl font-bold ${summary.transversais === 5 ? 'text-green-600' : 'text-red-600'}`}>{summary.transversais}/5</p>
                          </div>
                      </div>
                  </div>
              )}

              {artifactResult.statusGeral === 'NaoPrecisaDeAjuste' ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                      <h3 className="text-lg font-bold text-green-700">Artefato Validado!</h3>
                      <p className="text-green-600">O conteúdo está alinhado com a memória pedagógica do Ebook.</p>
                  </div>
              ) : (
                  <div className="bg-white border-2 border-orange-100 rounded-xl p-6 shadow-sm">
                      <h3 className="text-xl font-bold text-orange-700 mb-4 flex items-center">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Ajustes Necessários
                      </h3>
                      <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                              <thead className="bg-orange-50 text-orange-800">
                                  <tr>
                                      <th className="p-3 text-left">Gravidade</th>
                                      <th className="p-3 text-left">{isBQ ? 'Questão / Tipo' : 'Capítulo Relacionado'}</th>
                                      <th className="p-3 text-left">Problema</th>
                                      <th className="p-3 text-left">Sugestão</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                  {(artifactResult.ajustes || []).map((adj, idx) => (
                                      <tr key={idx}>
                                          <td className="p-3">
                                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                  adj.gravidade === 'Alta' ? 'bg-red-100 text-red-700' :
                                                  adj.gravidade === 'Média' ? 'bg-yellow-100 text-yellow-700' :
                                                  'bg-blue-100 text-blue-700'
                                              }`}>
                                                  {adj.gravidade}
                                              </span>
                                          </td>
                                          <td className="p-3 font-medium text-gray-700">
                                              {isBQ ? (
                                                  <>
                                                    <span className="block font-bold">Q.{adj.questao}</span>
                                                    <span className="text-xs text-gray-500">{adj.tipo}</span>
                                                    {(adj.capitulosRelacionados || []).length > 0 && (
                                                        <div className="text-xs text-blue-600 mt-1">
                                                            {adj.capitulosRelacionados?.join(' + ')}
                                                        </div>
                                                    )}
                                                  </>
                                              ) : (
                                                  <>
                                                    {adj.capituloRelacionado}
                                                    {adj.subcapituloRelacionado && <span className="block text-xs text-gray-500">{adj.subcapituloRelacionado}</span>}
                                                  </>
                                              )}
                                          </td>
                                          <td className="p-3 text-gray-700 max-w-xs">
                                              <p className="font-semibold">{adj.problemaIdentificado}</p>
                                              <p className="text-xs text-gray-500 mt-1">{adj.justificativaEducacional}</p>
                                          </td>
                                          <td className="p-3 text-gray-700 italic max-w-xs bg-gray-50 rounded">
                                              "{adj.sugestaoDeAjuste}"
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  const renderAnalysisResult = () => {
      if (!pedagogicalMemory || !report) return null;

      const isIndefinite = pedagogicalMemory.identifiedCatalog === 'Indefinido';

      return (
          <div className="w-full mt-8 space-y-8">
              {/* Memory Card */}
              <div className="bg-white border border-brand-border rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-brand-secondary">Memória Pedagógica</h3>
                      <span className="text-xs text-gray-400 font-mono">ID: {pedagogicalMemory.ebookId.slice(0, 8)}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className={`p-4 rounded-lg border ${isIndefinite ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                          <p className="text-xs uppercase font-bold text-gray-500 mb-1">Catálogo</p>
                          <p className={`text-lg font-bold ${isIndefinite ? 'text-red-700' : 'text-blue-700'}`}>
                              {pedagogicalMemory.identifiedCatalog}
                          </p>
                      </div>
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-xs uppercase font-bold text-gray-500 mb-1">Progressão Didática</p>
                          <p className="text-lg font-bold text-gray-700 capitalize">{pedagogicalMemory.globalAssessment.didacticProgression}</p>
                      </div>
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-xs uppercase font-bold text-gray-500 mb-1">Nível Cognitivo</p>
                          <p className="text-lg font-bold text-gray-700 capitalize">{pedagogicalMemory.globalAssessment.predominantCognitiveLevel}</p>
                      </div>
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-xs uppercase font-bold text-gray-500 mb-1">Densidade</p>
                          <p className="text-lg font-bold text-gray-700 capitalize">{pedagogicalMemory.globalAssessment.conceptualDensity}</p>
                      </div>
                  </div>

                  <div className="space-y-2">
                      <h4 className="font-semibold text-gray-700">Estrutura Identificada:</h4>
                      {pedagogicalMemory.chapters.map((chap, idx) => (
                          <div key={idx} className="border-l-4 border-brand-primary pl-3 py-1">
                              <p className="font-medium text-brand-secondary">{chap.chapterTitle}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                  <span className="font-semibold">Conceitos:</span> {(chap.keyConcepts || []).join(', ')}
                              </p>
                          </div>
                      ))}
                  </div>
                  
                  {/* Pontos Fortes */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                      <h4 className="font-semibold text-green-700 mb-2">Pontos Fortes Identificados:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                          {(report.strengths || []).map((str, i) => <li key={i}>{str}</li>)}
                      </ul>
                  </div>
              </div>

              {/* Adjustments Report */}
              {report.statusGeral === 'AjustesNecessarios' && (report.adjustments || []).length > 0 && (
                  <div className="bg-white border-2 border-orange-100 rounded-xl p-6 shadow-sm">
                      <h3 className="text-xl font-bold text-orange-700 mb-4 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Relatório de Ajustes Pedagógicos
                      </h3>
                      <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                              <thead className="bg-orange-50 text-orange-800">
                                  <tr>
                                      <th className="p-3 text-left">Gravidade</th>
                                      <th className="p-3 text-left">Local</th>
                                      <th className="p-3 text-left">Problema</th>
                                      <th className="p-3 text-left">Sugestão</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                  {(report.adjustments || []).map((adj, idx) => (
                                      <tr key={idx}>
                                          <td className="p-3">
                                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                  adj.gravity === 'Alta' ? 'bg-red-100 text-red-700' :
                                                  adj.gravity === 'Média' ? 'bg-yellow-100 text-yellow-700' :
                                                  'bg-blue-100 text-blue-700'
                                              }`}>
                                                  {adj.gravity}
                                              </span>
                                          </td>
                                          <td className="p-3 font-medium">
                                              {adj.chapter}
                                              {adj.paragraphReference ? <span className="block text-xs text-gray-400">Ref. §{adj.paragraphReference}</span> : null}
                                          </td>
                                          <td className="p-3 text-gray-700 max-w-xs">
                                              <p className="font-semibold">{adj.problemIdentified}</p>
                                              <p className="text-xs text-gray-500 mt-1">{adj.educationalJustification}</p>
                                          </td>
                                          <td className="p-3 text-gray-700 italic max-w-xs bg-gray-50 rounded">
                                              "{adj.suggestionForAdjustment}"
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}
              
               {report.statusGeral === 'NaoPrecisaDeAjuste' && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                      <h3 className="text-lg font-bold text-green-700">Design Educacional Validado!</h3>
                      <p className="text-green-600">A estrutura e a abordagem pedagógica do Ebook estão adequadas.</p>
                  </div>
              )}
          </div>
      );
  }

  const renderDashboard = () => (
    <div className="w-full max-w-6xl">
      {/* Header Section */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-brand-secondary mb-3">
          Design Educacional
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Análise pedagógica estrutural de materiais educacionais. Valide a aderência de atividades e questões à memória pedagógica do curso.
        </p>
        
        {/* Memory Status Indicator */}
        <div className={`inline-flex items-center px-4 py-2 rounded-full mt-6 border transition-colors duration-300 ${pedagogicalMemory ? 'bg-green-50 border-green-200 text-green-700 shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
          <div className={`w-2.5 h-2.5 rounded-full mr-2 ${pedagogicalMemory ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="font-semibold text-sm tracking-wide">
            {pedagogicalMemory ? `Memória Ativa: ${pedagogicalMemory.sourceFileName}` : 'Memória Pedagógica Inativa'}
          </span>
        </div>
      </div>

      {/* Banner Informativo Fixo */}
      <div className="bg-blue-50/80 border border-blue-100 p-4 mb-10 rounded-xl flex items-start gap-4 shadow-sm">
        <div className="flex-shrink-0 mt-0.5">
            <div className="bg-blue-100 p-1.5 rounded-full">
                <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
            </div>
        </div>
        <div>
            <h4 className="text-sm font-bold text-blue-800 mb-1">Nota Importante</h4>
            <p className="text-sm text-blue-700/90 leading-relaxed">
                O módulo Design Educacional não altera conteúdos. Ele apenas analisa e sugere ajustes sob a ótica pedagógica, garantindo alinhamento com os objetivos de aprendizagem.
            </p>
        </div>
      </div>

      {error && (
         <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl relative shadow-sm" role="alert">
            <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <strong className="font-bold">Erro no processamento</strong>
            </div>
            <span className="block mt-2 text-sm text-red-600/90">{error}</span>
            <button className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors" onClick={() => setError(null)}>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
         </div>
      )}

      {/* Main Action - Ebook */}
      <div className="mb-12">
        <div className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${pedagogicalMemory ? 'bg-white border-green-100 shadow-sm' : 'bg-white border-brand-primary/20 shadow-md hover:shadow-lg hover:border-brand-primary/40'}`}>
            {!pedagogicalMemory && (
                <div className="absolute top-0 right-0 bg-brand-primary text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-xl z-10 tracking-wider shadow-sm">
                    PASSO 1: OBRIGATÓRIO
                </div>
            )}
            <div className="p-8 flex flex-col md:flex-row items-center gap-8">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner ${pedagogicalMemory ? 'bg-green-50 text-green-600' : 'bg-brand-primary/5 text-brand-primary'}`}>
                    <div className="w-10 h-10" dangerouslySetInnerHTML={{ __html: ebookIcon }} />
                </div>
                <div className="flex-grow text-center md:text-left">
                    <h3 className="text-xl font-bold text-brand-secondary mb-2">Carregar Ebook Base (.docx)</h3>
                    <p className="text-gray-600 text-sm leading-relaxed max-w-xl">
                        Faça o upload do material didático principal para gerar a memória pedagógica do curso. Esta memória será a base para validar todos os outros artefatos.
                    </p>
                </div>
                <div>
                     <button 
                        onClick={() => setViewState('upload-ebook')}
                        className={`px-8 py-3.5 font-bold rounded-full shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${pedagogicalMemory ? 'bg-white border-2 border-green-500 text-green-600 hover:bg-green-50' : 'bg-brand-primary text-white hover:bg-brand-dark hover:shadow-lg'}`}
                    >
                        {pedagogicalMemory ? 'Reanalisar Ebook' : 'Iniciar Análise'}
                     </button>
                </div>
            </div>
        </div>
      </div>
      
      {/* Analysis Result Section */}
      {renderAnalysisResult()}

      <div className="mt-16">
        <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-gray-200 flex-grow"></div>
            <h3 className="text-lg font-bold text-gray-400 uppercase tracking-wider">Artefatos Educacionais</h3>
            <div className="h-px bg-gray-200 flex-grow"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`transition-all duration-500 ${!pedagogicalMemory ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
                <Card
                icon={activityIcon}
                title="Atividade Contextualizada (ATC)"
                description="Análise de aderência pedagógica de atividades."
                onClick={() => startArtifactAnalysis('ATC')} 
                />
            </div>
            <div className={`transition-all duration-500 ${!pedagogicalMemory ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
                <Card
                icon={challengeIcon}
                title="Desafio Colaborativo (DCO)"
                description="Validação de propostas de desafios em grupo."
                onClick={() => startArtifactAnalysis('DCO')}
                />
            </div>
            <div className={`transition-all duration-500 ${!pedagogicalMemory ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
                <Card
                icon={questionsIcon}
                title="Banco de Questões (BQ)"
                description="Verificação de alinhamento de questões objetivas."
                onClick={() => startArtifactAnalysis('BQ')}
                />
            </div>
        </div>
        {!pedagogicalMemory && (
            <div className="text-center mt-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-xs font-medium text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    Carregue o Ebook Base para desbloquear os artefatos
                </span>
            </div>
        )}
      </div>
    </div>
  );

  if (viewState === 'processing-ebook' || viewState === 'processing-artifact') {
    return <ProcessingView />;
  }

  if (viewState === 'upload-ebook') {
    return (
        <div className="w-full">
            <button onClick={() => setViewState('dashboard')} className="mb-4 text-brand-primary hover:text-brand-dark font-medium transition-colors">
                &larr; Cancelar
            </button>
            <FileUpload 
                onProcess={handleEbookProcess} 
                fileType=".docx" 
                title="Carregar Ebook para Análise Pedagógica" 
            />
        </div>
    );
  }

  if (viewState === 'upload-artifact' && activeArtifactType) {
      return (
          <div className="w-full">
              <button onClick={() => setViewState('dashboard')} className="mb-4 text-brand-primary hover:text-brand-dark font-medium transition-colors">
                  &larr; Cancelar
              </button>
              <FileUpload 
                  onProcess={handleArtifactProcess} 
                  fileType=".docx" 
                  title={`Carregar ${activeArtifactType === 'BQ' ? 'Banco de Questões' : activeArtifactType} para Validação`}
              />
          </div>
      );
  }

  if (viewState === 'artifact-result') {
      return renderArtifactResult();
  }

  return renderDashboard();
}
