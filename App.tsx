
import React, { useState } from 'react';
import { AnalysisState, BrandingConfig, LegendItem, ViewMode, Department, GroupOrder } from './types';
import { BrandingPanel } from './components/BrandingPanel';
import { LegendManager } from './components/LegendManager';
import { DepartmentManager } from './components/DepartmentManager';
import { GroupOrderManager } from './components/GroupOrderManager';
import { AnalysisView } from './components/AnalysisView';
import { BaseImporter } from './components/BaseImporter';
import { BudgetManager } from './components/BudgetManager';
import { Settings, BarChart3, LayoutDashboard, Layers, FileSpreadsheet, ListOrdered, Calculator } from 'lucide-react';

const INITIAL_BRANDING: BrandingConfig = {
  companyName: '',
  logoUrl: null,
  fontFamily: "'Inter', sans-serif",
  primaryColor: '#2563eb',
  backgroundColor: '#f8fafc',
  accentColor: '#f59e0b',
};

// Initial data as requested
const INITIAL_DEPARTMENTS: Department[] = [
  { id: '1', codSetor: '100', nomeSetor: 'VEICULOS NOVOS', descricao: 'C & O', ordem: 1 },
  { id: '2', codSetor: '200', nomeSetor: 'VEICULOS USADOS', descricao: 'Usados', ordem: 3 },
  { id: '3', codSetor: '300', nomeSetor: 'PEÇAS', descricao: 'Peças', ordem: 4 },
  { id: '4', codSetor: '401', nomeSetor: 'OFICINA MECANICA CAMINHÕES', descricao: 'Serviços', ordem: 5 },
  { id: '5', codSetor: '404', nomeSetor: 'OFICINA ADMINISTRATIVO', descricao: 'Serviços', ordem: 5 },
  { id: '6', codSetor: '411', nomeSetor: 'OFICINA MECANICA VANS', descricao: 'Serviços', ordem: 5 },
  { id: '7', codSetor: '500', nomeSetor: 'ADMINISTRATIVO', descricao: 'Administrativo', ordem: 7 },
  { id: '8', codSetor: '700', nomeSetor: 'BOUTIQUE', descricao: 'Collection', ordem: 6 },
  { id: '9', codSetor: '701', nomeSetor: 'VEICULOS VANS', descricao: 'Vans', ordem: 2 },
  { id: '10', codSetor: '100', nomeSetor: 'VEICULOS CAMINHOES E ONIBUS', descricao: 'C & O', ordem: 1 },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ViewMode>('branding');
  const [branding, setBranding] = useState<BrandingConfig>(INITIAL_BRANDING);
  const [items, setItems] = useState<LegendItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [groupOrder, setGroupOrder] = useState<GroupOrder>({});
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const handleBudgetUpdate = (itemId: string, month: string, value: number, company?: string, year?: string) => {
    setItems(prevItems => prevItems.map(item => {
      if (item.id === itemId) {
        const newItem = { ...item };
        
        // Use default keys if filters are not provided (or use specific "Manual" bucket)
        const targetCompany = company || 'Matriz';
        const targetYear = year || new Date().getFullYear().toString();
        const targetSector = 'Manual'; 

        // Ensure structure exists
        if (!newItem.breakdownPlanned) newItem.breakdownPlanned = {};
        if (!newItem.breakdownPlanned[targetCompany]) newItem.breakdownPlanned[targetCompany] = {};
        if (!newItem.breakdownPlanned[targetCompany][targetYear]) newItem.breakdownPlanned[targetCompany][targetYear] = {};
        if (!newItem.breakdownPlanned[targetCompany][targetYear][targetSector]) newItem.breakdownPlanned[targetCompany][targetYear][targetSector] = {};

        // Update value
        newItem.breakdownPlanned[targetCompany][targetYear][targetSector][month] = value;
        
        // Also update flat monthlyPlanned for fallback views
        if (!newItem.monthlyPlanned) newItem.monthlyPlanned = {};
        // Note: This logic for flat update is simplified; ideally, we'd sum up all breakdowns, 
        // but for manual entry user experience, setting it directly ensures immediate feedback.
        newItem.monthlyPlanned[month] = value;

        return newItem;
      }
      return item;
    }));
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      
      {/* Sidebar Navigation */}
      <div className="flex md:flex-row flex-col-reverse h-full">
        
        <nav className="bg-white border-t md:border-t-0 md:border-r border-slate-200 w-full md:w-20 lg:w-64 flex md:flex-col justify-between md:justify-start flex-shrink-0 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          <div className="p-4 md:p-6 flex items-center gap-3 border-b border-transparent md:border-slate-100">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-600/20">
               C
             </div>
             <span className="font-bold text-lg text-slate-800 hidden lg:block tracking-tight">CorpAnalyze</span>
          </div>

          <div className="flex md:flex-col w-full px-2 md:px-4 gap-1 md:mt-4">
            <button
              onClick={() => setActiveTab('branding')}
              className={`flex-1 md:flex-none flex items-center gap-3 p-3 rounded-lg transition-all ${
                activeTab === 'branding' 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="hidden lg:block">Configurações</span>
            </button>
            
            <button
              onClick={() => setActiveTab('legends')}
              className={`flex-1 md:flex-none flex items-center gap-3 p-3 rounded-lg transition-all ${
                activeTab === 'legends' 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="hidden lg:block">Dados DRE</span>
            </button>

            <button
              onClick={() => setActiveTab('importer')}
              className={`flex-1 md:flex-none flex items-center gap-3 p-3 rounded-lg transition-all ${
                activeTab === 'importer' 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span className="hidden lg:block">Importar Base</span>
            </button>

            <button
              onClick={() => setActiveTab('departments')}
              className={`flex-1 md:flex-none flex items-center gap-3 p-3 rounded-lg transition-all ${
                activeTab === 'departments' 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Layers className="w-5 h-5" />
              <span className="hidden lg:block">Departamentos</span>
            </button>

             <button
              onClick={() => setActiveTab('ordering')}
              className={`flex-1 md:flex-none flex items-center gap-3 p-3 rounded-lg transition-all ${
                activeTab === 'ordering' 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <ListOrdered className="w-5 h-5" />
              <span className="hidden lg:block">Ordenação</span>
            </button>

             <button
              onClick={() => setActiveTab('budget')}
              className={`flex-1 md:flex-none flex items-center gap-3 p-3 rounded-lg transition-all ${
                activeTab === 'budget' 
                  ? 'bg-orange-50 text-orange-700 font-medium border border-orange-100' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Calculator className="w-5 h-5" />
              <span className="hidden lg:block">Orçamento</span>
            </button>

             <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 md:flex-none flex items-center gap-3 p-3 rounded-lg transition-all ${
                activeTab === 'dashboard' 
                  ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-600/20' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="hidden lg:block">Dashboard</span>
            </button>
          </div>
          
          <div className="hidden md:block mt-auto p-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center lg:text-left">
              v1.5.0 • Pro Edition
            </p>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-slate-50/50 relative">
          
          {activeTab === 'dashboard' ? (
             <AnalysisView 
               branding={branding}
               items={items}
               departments={departments}
               aiAnalysis={aiAnalysis}
               onAnalysisUpdate={setAiAnalysis}
               groupOrder={groupOrder}
               onBudgetUpdate={handleBudgetUpdate}
             />
          ) : (
            <div className={`h-full ${activeTab === 'budget' ? '' : 'max-w-7xl mx-auto p-6 md:p-12'}`}>
              {activeTab === 'branding' && (
                <BrandingPanel config={branding} onChange={setBranding} />
              )}
              {activeTab === 'legends' && (
                <LegendManager items={items} setItems={setItems} />
              )}
              {activeTab === 'importer' && (
                <BaseImporter items={items} setItems={setItems} />
              )}
              {activeTab === 'departments' && (
                <DepartmentManager departments={departments} setDepartments={setDepartments} />
              )}
              {activeTab === 'ordering' && (
                <GroupOrderManager items={items} groupOrder={groupOrder} setGroupOrder={setGroupOrder} />
              )}
              {activeTab === 'budget' && (
                <BudgetManager items={items} setItems={setItems} departments={departments} />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
