
import React, { useRef, useState } from 'react';
import { LegendItem } from '../types';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { read, utils } from 'xlsx';

interface BaseImporterProps {
  items: LegendItem[];
  setItems: React.Dispatch<React.SetStateAction<LegendItem[]>>;
}

const MONTH_NAMES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

export const BaseImporter: React.FC<BaseImporterProps> = ({ items, setItems }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [summary, setSummary] = useState<{ processedRows: number; matchedAccounts: number; totalVolume: number } | null>(null);

  // Robust parsing to handle both Excel raw numbers and Brazilian formatted strings
  const parseCurrency = (val: any): number => {
    if (typeof val === 'number') return val;
    const str = String(val || '').trim();
    if (!str) return 0;
    
    // Check for Brazilian format (comma as decimal separator)
    if (str.includes(',')) {
      // Remove thousands separator (.) and replace decimal (,) with (.)
      return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0;
    }
    
    return parseFloat(str) || 0;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    setSummary(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      
      const jsonData = utils.sheet_to_json<any[]>(firstSheet, { header: 1 });
      
      if (jsonData.length < 2) {
        alert("Arquivo vazio ou inválido.");
        setProcessing(false);
        return;
      }

      const headers = jsonData[0].map((h: any) => String(h).toLowerCase().trim());
      
      const idxConta = headers.findIndex(h => h.includes('conta contábil') || h.includes('conta contabil'));
      const idxData = headers.findIndex(h => h === 'data' || h.includes('dt.'));
      const idxDebito = headers.findIndex(h => h === 'débito' || h === 'debito');
      const idxCredito = headers.findIndex(h => h === 'crédito' || h === 'credito');
      const idxCC = headers.findIndex(h => h.includes('centro de custo') || h.includes('setor') || h.includes('cc'));
      const idxEmpresa = headers.findIndex(h => h.includes('empresa') || h.includes('filial'));
      const idxHist = headers.findIndex(h => h.includes('histórico') || h.includes('historico') || h.includes('complemento'));

      if (idxConta === -1 || idxData === -1 || idxDebito === -1 || idxCredito === -1) {
        alert("Colunas obrigatórias não encontradas. Verifique se o Excel tem: Conta Contábil, Data, Débito, Crédito");
        setProcessing(false);
        return;
      }

      // Create a map of existing items for faster lookup
      const itemMap = new Map<string, LegendItem>();
      items.forEach(item => {
        // Normalize key: remove dots, trim
        const key = item.conta.replace(/\./g, '').trim();
        itemMap.set(key, item);
      });

      let processedCount = 0;
      let matchedCount = 0;
      let totalVolume = 0;

      // Process rows
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        const contaRaw = String(row[idxConta] || '');
        const contaKey = contaRaw.replace(/\./g, '').trim();
        
        if (!contaKey) continue;
        
        const dateRaw = row[idxData];
        const debit = parseCurrency(row[idxDebito]);
        const credit = parseCurrency(row[idxCredito]);
        const result = credit - debit; // Net Result logic
        const centroCusto = idxCC !== -1 ? String(row[idxCC] || 'Geral').trim() : 'Geral';
        const empresa = idxEmpresa !== -1 ? String(row[idxEmpresa] || 'Matriz').trim() : 'Matriz';
        const historyText = idxHist !== -1 ? String(row[idxHist] || '').trim() : 'Lançamento';
        
        // Date parsing
        let monthIndex = -1;
        let yearStr = new Date().getFullYear().toString();
        let dateStr = ''; // For display

        if (typeof dateRaw === 'number') {
           // Excel serial date
           const dateObj = new Date(Math.round((dateRaw - 25569) * 86400 * 1000));
           monthIndex = dateObj.getUTCMonth();
           yearStr = dateObj.getUTCFullYear().toString();
           dateStr = dateObj.toLocaleDateString('pt-BR');
        } else if (typeof dateRaw === 'string') {
           // String format dd/mm/yyyy
           const parts = dateRaw.split('/');
           if (parts.length === 3) {
             monthIndex = parseInt(parts[1], 10) - 1;
             yearStr = parts[2];
             dateStr = dateRaw;
           }
        }

        if (monthIndex >= 0 && monthIndex < 12) {
            const monthName = MONTH_NAMES[monthIndex];
            
            // Find matched item
            const item = itemMap.get(contaKey);
            if (item) {
                // Initialize structure if needed (Realized)
                if (!item.breakdown) item.breakdown = {};
                if (!item.breakdown[empresa]) item.breakdown[empresa] = {};
                if (!item.breakdown[empresa][yearStr]) item.breakdown[empresa][yearStr] = {};
                if (!item.breakdown[empresa][yearStr][centroCusto]) item.breakdown[empresa][yearStr][centroCusto] = {};
                
                const currentVal = item.breakdown[empresa][yearStr][centroCusto][monthName] || 0;
                item.breakdown[empresa][yearStr][centroCusto][monthName] = currentVal + result;

                // Also populate flat monthlyValues for backward compatibility/total view
                item.monthlyValues[monthName] = (item.monthlyValues[monthName] || 0) + result;

                // Transaction Drill-down
                if (!item.transactions) item.transactions = [];
                item.transactions.push({
                  id: `t-${i}`,
                  date: dateStr,
                  history: historyText,
                  value: result,
                  company: empresa,
                  sector: centroCusto,
                  month: monthName,
                  year: yearStr
                });

                matchedCount++;
                totalVolume += result;
            }
        }
        processedCount++;
      }

      setSummary({ processedRows: processedCount, matchedAccounts: matchedCount, totalVolume });
      setItems(Array.from(itemMap.values())); // Update state
      alert("Importação concluída com sucesso!");

    } catch (err) {
      console.error(err);
      alert("Erro ao processar arquivo. Verifique o formato.");
    } finally {
      setProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in p-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="flex justify-center mb-4">
           <div className="p-3 bg-blue-50 rounded-full">
              <FileSpreadsheet className="w-8 h-8 text-blue-600" />
           </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Importador de Base (Razão)</h2>
        <p className="text-slate-500 mb-6 max-w-lg mx-auto">
          Faça upload do razão contábil em Excel para preencher automaticamente os resultados do DRE (Realizado).
          O sistema agrupa por <strong>Conta, Mês, Empresa e Centro de Custo</strong>.
        </p>

        <div className="flex justify-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={processing}
            className={`flex items-center gap-2 px-8 py-3 rounded-full text-white font-medium shadow-md transition-all transform hover:scale-105 bg-blue-600 hover:bg-blue-700`}
          >
            {processing ? (
               <>Processando...</>
            ) : (
               <>
                 <Upload className="w-5 h-5" />
                 Selecionar Excel (Razão Contábil)
               </>
            )}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".xlsx, .xls, .xlsm"
          />
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex flex-col items-center">
               <span className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Linhas Processadas</span>
               <span className="text-2xl font-bold text-slate-800">{summary.processedRows}</span>
           </div>
           <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex flex-col items-center">
               <span className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Contas Mapeadas</span>
               <span className="text-2xl font-bold text-green-600">{summary.matchedAccounts}</span>
           </div>
           <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex flex-col items-center">
               <span className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Volume Financeiro</span>
               <span className="text-2xl font-bold text-blue-600">
                   {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.totalVolume)}
               </span>
           </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 text-sm text-blue-800">
         <AlertCircle className="w-5 h-5 flex-shrink-0" />
         <div>
            <p className="font-bold mb-1">Requisitos do Excel:</p>
            <ul className="list-disc pl-4 space-y-1">
               <li>A coluna <strong>"Conta Contábil"</strong> deve ter o mesmo formato do cadastro DRE (ex: 3.1.01...).</li>
               <li>Deve haver colunas <strong>"Data"</strong>, <strong>"Débito"</strong> e <strong>"Crédito"</strong>.</li>
               <li>O cálculo automático será: <strong>Crédito - Débito</strong>.</li>
               <li>Para filtro por setor, inclua a coluna <strong>"Centro de Custo"</strong>.</li>
               <li>Para filtro por empresa, inclua a coluna <strong>"Empresa"</strong>.</li>
               <li>Para ver o histórico detalhado, inclua a coluna <strong>"Histórico"</strong> ou <strong>"Complemento"</strong>.</li>
            </ul>
         </div>
      </div>
    </div>
  );
};
