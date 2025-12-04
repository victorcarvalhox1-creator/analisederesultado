import React, { useRef } from 'react';
import { BrandingConfig, FONT_OPTIONS, BACKGROUND_OPTIONS } from '../types';
import { Upload, Trash2, Building2, Type, Palette, Check } from 'lucide-react';

interface BrandingPanelProps {
  config: BrandingConfig;
  onChange: (newConfig: BrandingConfig) => void;
}

export const BrandingPanel: React.FC<BrandingPanelProps> = ({ config, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ ...config, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    onChange({ ...config, logoUrl: null });
  };

  const updateField = (field: keyof BrandingConfig, value: string) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      {/* Registration Section */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="mb-6 pb-4 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            Cadastro da Empresa
          </h2>
          <p className="text-slate-500 mt-1">Insira os dados da empresa para personalizar o relatório.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nome da Empresa</label>
            <input
              type="text"
              value={config.companyName}
              onChange={(e) => updateField('companyName', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
              placeholder="Ex: Minha Empresa S.A."
            />
            
            <label className="block text-sm font-semibold text-slate-700 mt-6 mb-2">Cor Institucional (Primária)</label>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <input
                  type="color"
                  value={config.primaryColor}
                  onChange={(e) => updateField('primaryColor', e.target.value)}
                  className="w-12 h-12 p-1 rounded-lg cursor-pointer bg-white border border-slate-200 shadow-sm"
                />
              </div>
              <input 
                type="text" 
                value={config.primaryColor}
                onChange={(e) => updateField('primaryColor', e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg font-mono text-sm uppercase w-32 shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Logotipo</label>
            <div className="flex flex-col gap-4">
              <div 
                className="w-full h-40 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden relative group cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                onClick={() => fileInputRef.current?.click()}
              >
                {config.logoUrl ? (
                  <img src={config.logoUrl} alt="Logo" className="w-full h-full object-contain p-4" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Upload className="w-8 h-8 group-hover:text-blue-500 transition-colors" />
                    <span className="text-sm font-medium">Clique para enviar logo</span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleLogoUpload} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 text-sm px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors font-medium border border-slate-200"
                >
                  {config.logoUrl ? 'Trocar Logo' : 'Enviar Logo'}
                </button>
                {config.logoUrl && (
                  <button 
                    onClick={removeLogo}
                    className="text-sm px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center gap-1 border border-transparent hover:border-red-100"
                  >
                    <Trash2 className="w-4 h-4" /> Remover
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Styling Section */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="mb-6 pb-4 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Palette className="w-6 h-6 text-purple-600" />
            Estilo do Relatório
          </h2>
          <p className="text-slate-500 mt-1">Defina a tipografia e as cores de fundo para a apresentação.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Type className="w-4 h-4" /> Fonte do Texto
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FONT_OPTIONS.map((font) => (
                <button
                  key={font.name}
                  onClick={() => updateField('fontFamily', font.value)}
                  className={`px-4 py-3 text-left rounded-lg border transition-all flex justify-between items-center ${
                    config.fontFamily === font.value 
                      ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500 shadow-md' 
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                  style={{ fontFamily: font.value }}
                >
                  <span className="text-sm font-medium truncate">{font.name}</span>
                  {config.fontFamily === font.value && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" /> Cor de Fundo
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {BACKGROUND_OPTIONS.map((bg) => (
                <button
                  key={bg.name}
                  onClick={() => updateField('backgroundColor', bg.value)}
                  className={`relative w-full aspect-square rounded-lg border shadow-sm transition-all hover:scale-105 flex items-center justify-center ${
                    config.backgroundColor === bg.value ? 'border-blue-500 ring-2 ring-blue-200 z-10' : 'border-slate-200'
                  }`}
                  style={{ backgroundColor: bg.value }}
                  title={bg.name}
                >
                   {config.backgroundColor === bg.value && (
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`w-3 h-3 rounded-full ${bg.value === '#ffffff' || bg.value.startsWith('#f') ? 'bg-blue-600' : 'bg-white'}`} />
                     </div>
                   )}
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs text-slate-500 text-right">
              Selecionado: {BACKGROUND_OPTIONS.find(b => b.value === config.backgroundColor)?.name}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};