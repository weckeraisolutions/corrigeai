
import React, { useState, useRef } from 'react';

interface FileUploadProps {
  onProcess: (file: File) => void;
  fileType: string; // e.g., ".docx", ".pptx"
  title: string;
}

export default function FileUpload({ onProcess, fileType, title }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileTypeMap: {[key: string]: string} = {
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
       if (selectedFile.type === fileTypeMap[fileType]) {
        setFile(selectedFile);
      } else {
        alert(`Por favor, selecione um arquivo ${fileType}`);
      }
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === fileTypeMap[fileType]) {
        setFile(droppedFile);
      } else {
        alert(`Por favor, selecione um arquivo ${fileType}`);
      }
      e.dataTransfer.clearData();
    }
  };

  const handleSubmit = () => {
    if (file) {
      onProcess(file);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-brand-surface p-8 rounded-lg shadow-sm border border-brand-border">
      <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-brand-secondary">{title}</h2>
          <p className="text-gray-500">Envie seu documento {fileType} para uma análise completa.</p>
      </div>
      
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${isDragging ? 'border-brand-primary bg-pink-50' : 'border-brand-border'}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={fileType} 
            className="hidden"
        />
        <p className="text-gray-500">Arraste e solte seu arquivo {fileType} aqui ou clique para selecionar.</p>
      </div>

      {file && (
        <div className="mt-6 text-center">
            <p className="text-gray-700 font-semibold">Arquivo selecionado:</p>
            <p className="text-brand-primary">{file.name}</p>
        </div>
      )}
      
      <div className="mt-8 text-center">
        <button
          onClick={handleSubmit}
          disabled={!file}
          className="px-8 py-3 bg-brand-primary text-white font-bold rounded-full shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-brand-dark transition-colors"
        >
          Revisar Documento
        </button>
      </div>
    </div>
  );
}