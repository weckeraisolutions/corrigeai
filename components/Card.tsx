
import React from 'react';

interface CardProps {
  icon: string; // SVG string
  title: string;
  description: string;
  onClick: () => void;
}

export default function Card({ icon, title, description, onClick }: CardProps) {
  return (
    <button
      onClick={onClick}
      className="group bg-brand-surface p-6 rounded-xl border border-brand-border shadow-sm hover:shadow-lg hover:border-brand-primary/30 hover:-translate-y-1 transition-all duration-300 text-left w-full h-full flex flex-col relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
      
      <div 
        className="w-12 h-12 mb-5 text-brand-primary bg-brand-primary/10 rounded-lg p-2.5 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300"
        dangerouslySetInnerHTML={{ __html: icon }}
      />
      <h3 className="text-lg font-bold text-brand-secondary mb-2 group-hover:text-brand-primary transition-colors">{title}</h3>
      <p className="text-gray-600 text-sm flex-grow leading-relaxed">{description}</p>
    </button>
  );
}