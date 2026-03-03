
import React from 'react';
import { ActiveModule } from '../App';

interface SidebarProps {
  activeModule: ActiveModule;
  setActiveModule: (module: ActiveModule) => void;
}

const reviewIcon = `<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>`;
const translateIcon = `<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m4.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`;
const designIcon = `<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>`;

export default function Sidebar({ activeModule, setActiveModule }: SidebarProps) {
  
  const NavItem = ({ module, title, icon }: { module: ActiveModule, title: string, icon: string }) => {
    const isActive = activeModule === module;
    const baseClasses = "flex items-center px-4 py-3 text-left w-full text-sm font-medium rounded-lg transition-all duration-200 group";
    const activeClasses = "bg-brand-primary text-white shadow-md shadow-brand-primary/20";
    const inactiveClasses = "text-gray-600 hover:bg-gray-50 hover:text-brand-primary";
    
    return (
      <button 
        onClick={() => setActiveModule(module)}
        className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      >
        <div className={`w-5 h-5 mr-3 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} dangerouslySetInnerHTML={{ __html: icon }} />
        {title}
      </button>
    );
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-brand-surface p-4 rounded-xl border border-brand-border/60 shadow-sm h-fit sticky top-8">
      <div className="mb-6 px-2">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Módulos</p>
      </div>
      <nav className="space-y-1">
        <NavItem module="review" title="Revisão Linguística" icon={reviewIcon} />
        <NavItem module="educational-design" title="Design Educacional" icon={designIcon} />
        <NavItem module="translation" title="Tradução – Versão" icon={translateIcon} />
      </nav>
    </aside>
  );
}
