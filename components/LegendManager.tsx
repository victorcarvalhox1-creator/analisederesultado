
import React, { useState, useRef } from 'react';
import { LegendItem } from '../types';
import { Plus, Import, Trash, Edit2, Check, X, FileText, Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { read, utils } from 'xlsx';

interface LegendManagerProps {
  items: LegendItem[];
  setItems: React.Dispatch<React.SetStateAction<LegendItem[]>>;
}

export const LegendManager: React.FC<LegendManagerProps> = ({ items, setItems }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importText, setImportText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempEditItem, setTempEditItem] = useState<LegendItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick Add State
  const initialNewItem = {
    conta: '',
    label: '',
    codigo: '',
    tipoConta: '',
    grupo1: '',
    grupo2: '',
    grupo3: '',
    value: '', // Keep as string for input
    description: ''
  };
  const [newItem, setNewItem] = useState(initialNewItem);

  const handleAddItem = () => {
    if (!newItem.label) return;
    const id = Date.now().toString();
    const color = `hsl(${Math.random() * 360}, 70%, 50%)`;
    
    // For manual add, we assume a generic "Manual" column or "Valor"
    const val = Number(newItem.value) || 0;

    setItems([...items, {
      id,
      conta: newItem.conta,
      label: newItem.label,
      codigo: newItem.codigo,
      tipoConta: newItem.tipoConta,
      grupo1: newItem.grupo1,
      grupo2: newItem.grupo2,
      grupo3: newItem.grupo3,
      monthlyValues: { 'Valor': val },
      description: newItem.description,
      color
    }]);
    setNewItem(initialNewItem);
  };

  const handleTextImport = () => {
    // Simplified text import - mainly supports the structure without history for now
    // or assumes the 8th column is a single value.
    const lines = importText.split('\n');
    const newItems: LegendItem[] = [];
    
    lines.forEach((line, index) => {
      const parts = line.includes('\t') ? line.split('\t') : line.split(';');
      
      if (parts.length >= 2) {
        const conta = parts[0]?.trim() || '';
        const label = parts[1]?.trim() || '';
        const codigo = parts[2]?.trim() || '';
        const tipoConta = parts[3]?.trim() || '';
        const grupo1 = parts[4]?.trim() || '';
        const grupo2 = parts[5]?.trim() || '';
        const grupo3 = parts[6]?.trim() || '';
        
        let value = 0;
        if (parts[7]) {
           const cleanVal = parts[7].replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]+/g,"");
           value = parseFloat(cleanVal) || 0;
        }

        if (label && label !== 'DESCRIÇÃO') {
          newItems.push({
            id: `import-${Date.now()}-${index}`,
            conta,
            label,
            codigo,
            tipoConta,
            grupo1,
            grupo2,
            grupo3,
            monthlyValues: { 'Valor': value },
            description: '',
            color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
          });
        }
      }
    });

    setItems([...items, ...newItems]);
    setIsImporting(false);
    setImportText('');
  };

  const handleExcelFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const data = await file.arrayBuffer();
        const workbook = read(data);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Header: 1 returns array of arrays
        const jsonData = utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        
        if (jsonData.length === 0) return;

        // Try to identify header row. Usually row 0.
        const headerRow = jsonData[0] as string[];
        const newItems: LegendItem[] = [];

        // Identify month columns: Anything after index 6 (Grupo 3)
        // Expected Structure:
        // 0:Conta | 1:Desc | 2:Cod | 3:Tipo | 4:G1 | 5:G2 | 6:G3 | 7:Month1 | 8:Month2 ...
        const monthKeys: string[] = [];
        for (let i = 7; i < headerRow.length; i++) {
            if (headerRow[i]) monthKeys.push(String(headerRow[i]).trim());
        }

        // Iterate rows (skip header)
        for (let i = 1; i < jsonData.length; i++) {
           const row = jsonData[i];
           if (!row || row.length === 0) continue;

           const conta = row[0] ? String(row[0]).trim() : '';
           const label = row[1] ? String(row[1]).trim() : '';
           
           if (!label) continue; // Minimal requirement

           const codigo = row[2] ? String(row[2]).trim() : '';
           const tipoConta = row[3] ? String(row[3]).trim() : '';
           const grupo1 = row[4] ? String(row[4]).trim() : '';
           const grupo2 = row[5] ? String(row[5]).trim() : '';
           const grupo3 = row[6] ? String(row[6]).trim() : '';
           
           // Capture monthly values
           const monthlyValues: Record<string, number> = {};
           
           // If we identified specific month headers, use them. 
           // If not (e.g. no header row detected properly), use generic indices.
           const useGenericKeys = monthKeys.length === 0;

           if (useGenericKeys) {
              // Fallback: capture all columns from 7 onwards
              for (let c = 7; c < row.length; c++) {
                 const val = parseExcelNumber(row[c]);
                 monthlyValues[`Mês ${c-6}`] = val;
              }
           } else {
              // Use detected headers
              monthKeys.forEach((key, idx) => {
                 const colIndex = 7 + idx;
                 if (colIndex < row.length) {
                    monthlyValues[key] = parseExcelNumber(row[colIndex]);
                 }
              });
           }
           
           // Fallback if no monthly data found, try to put 0
           if (Object.keys(monthlyValues).length === 0) {
              monthlyValues['Valor'] = 0;
           }

           newItems.push({
               id: `xlsx-${Date.now()}-${i}`,
               conta,
               label,
               codigo,
               tipoConta,
               grupo1,
               grupo2,
               grupo3,
               monthlyValues,
               description: '',
               color: `hsl(${(i * 137.5) % 360}, 70%, 50%)`
           });
        }

        if (newItems.length > 0) {
            setItems(prev => [...prev, ...newItems]);
            alert(`Sucesso! ${newItems.length} linhas importadas. ${monthKeys.length > 0 ? `Histórico de ${monthKeys.length} meses identificado.` : ''}`);
        } else {
            alert("Nenhum dado válido encontrado.");
        }

      } catch (err) {
        console.error(err);
        alert("Erro ao ler arquivo Excel.");
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const parseExcelNumber = (val: any): number => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    // Handle currency strings "1.000,00"
    const str = String(val);
    const clean = str.replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]+/g,"");
    return parseFloat(clean) || 0;
  };

  const startEditing = (item: LegendItem) => {
    setEditingId(item.id);
    setTempEditItem({ ...item });
  };

  const saveEdit = () => {
    if (tempEditItem) {
      setItems(items.map(i => i.id === tempEditItem.id ? tempEditItem : i));
      setEditingId(null);
      setTempEditItem(null);
    }
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-600" />
            Guia de Dados & Legendas
          </h2>
          <p className="text-slate-500 text-sm">Gerencie a estrutura do Plano de Contas e importe seus dados.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('ATENÇÃO: Isso apagará todas as contas e dados importados. Esta ação não pode ser desfeita. Deseja continuar?')) {
                setItems([]);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border border-red-100 cursor-pointer shadow-sm hover:shadow"
          >
            <Trash className="w-4 h-4" />
            Limpar Tudo
          </button>
          
           <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Importar Excel
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleExcelFileChange} 
            className="hidden" 
            accept=".xlsx, .xls, .xlsm"
          />

          <button
            onClick={() => setIsImporting(!isImporting)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-sm ${
                isImporting ? 'bg-slate-200 text-slate-800' : 'bg-slate-800 text-white hover:bg-slate-700'
            }`}
          >
            <Import className="w-4 h-4" />
            {isImporting ? 'Fechar Importação' : 'Importar Texto'}
          </button>
        </div>
      </div>

      {isImporting && (
         <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 text-purple-900 text-sm mb-4 flex gap-3">
             <AlertCircle className="w-5 h-5 flex-shrink-0" />
             <div>
                <p className="font-bold">Instruções para Importação</p>
                <p>Para melhor resultado, use o botão <strong>Importar Excel</strong>.</p>
                <p className="mt-1">A planilha deve seguir a ordem: <code className="bg-white px-1 rounded">Conta | Descrição | Código | Tipo | G1 | G2 | G3 | [Meses...]</code></p>
                <p>As colunas após o "Grupo 3" serão tratadas automaticamente como dados mensais (Histórico).</p>
             </div>
         </div>
      )}

      {/* Manual Add Form - Simplified to just add a base structure line */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-sm font-bold text-slate-700 uppercase mb-4 tracking-wider">Adicionar Nova Linha (Manual)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="col-span-2 md:col-span-1">
             <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Conta</label>
             <input
              placeholder="3.1..."
              value={newItem.conta}
              onChange={(e) => setNewItem({...newItem, conta: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Descrição</label>
            <input
              placeholder="Ex: CAMINHÕES"
              value={newItem.label}
              onChange={(e) => setNewItem({...newItem, label: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div className="col-span-1">
             <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Código</label>
             <input
              placeholder="159"
              value={newItem.codigo}
              onChange={(e) => setNewItem({...newItem, codigo: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div className="col-span-2 md:col-span-1">
             <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Tipo</label>
             <input
              placeholder="Venda Bruta..."
              value={newItem.tipoConta}
              onChange={(e) => setNewItem({...newItem, tipoConta: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div className="col-span-2 md:col-span-1">
             <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Grupo 1</label>
             <input
              placeholder="G1"
              value={newItem.grupo1}
              onChange={(e) => setNewItem({...newItem, grupo1: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div className="col-span-2 md:col-span-1">
             <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Grupo 2</label>
             <input
              placeholder="G2"
              value={newItem.grupo2}
              onChange={(e) => setNewItem({...newItem, grupo2: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div className="col-span-2 md:col-span-1">
             <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Grupo 3</label>
             <input
              placeholder="G3"
              value={newItem.grupo3}
              onChange={(e) => setNewItem({...newItem, grupo3: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded text-sm outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
           <div className="col-span-2 md:col-span-1">
             <label className="text-[10px] text-blue-600 font-bold uppercase block mb-1">Valor (Manual)</label>
             <input
              type="number"
              value={newItem.value}
              onChange={(e) => setNewItem({...newItem, value: e.target.value})}
              className="w-full px-3 py-2 border border-blue-200 bg-blue-50/50 rounded text-sm font-medium text-blue-800 outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="col-span-full mt-2">
            <button
              onClick={handleAddItem}
              disabled={!newItem.label}
              className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Adicionar Linha
            </button>
          </div>
        </div>
      </div>

      {/* List Items */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs tracking-wider">
              <tr>
                <th className="p-4 border-b">Conta</th>
                <th className="p-4 border-b">Descrição</th>
                <th className="p-4 border-b">Código</th>
                <th className="p-4 border-b">Tipo</th>
                <th className="p-4 border-b">G1</th>
                <th className="p-4 border-b">G2</th>
                <th className="p-4 border-b">G3</th>
                <th className="p-4 border-b text-right">Dados (Meses)</th>
                <th className="p-4 border-b w-16"></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                        <FileText className="w-10 h-10 opacity-20" />
                        <p>Nenhum dado encontrado.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors group">
                    {editingId === item.id && tempEditItem ? (
                      // Editing Row - Only basic fields for now
                      <>
                        <td className="p-2"><input value={tempEditItem.conta} onChange={e => setTempEditItem({...tempEditItem, conta: e.target.value})} className="w-full p-1 border rounded text-xs" /></td>
                        <td className="p-2"><input value={tempEditItem.label} onChange={e => setTempEditItem({...tempEditItem, label: e.target.value})} className="w-full p-1 border rounded font-bold text-xs" /></td>
                        <td className="p-2"><input value={tempEditItem.codigo} onChange={e => setTempEditItem({...tempEditItem, codigo: e.target.value})} className="w-16 p-1 border rounded text-xs" /></td>
                        <td className="p-2"><input value={tempEditItem.tipoConta} onChange={e => setTempEditItem({...tempEditItem, tipoConta: e.target.value})} className="w-full p-1 border rounded text-xs" /></td>
                        <td className="p-2"><input value={tempEditItem.grupo1} onChange={e => setTempEditItem({...tempEditItem, grupo1: e.target.value})} className="w-full p-1 border rounded text-xs" /></td>
                        <td className="p-2"><input value={tempEditItem.grupo2} onChange={e => setTempEditItem({...tempEditItem, grupo2: e.target.value})} className="w-full p-1 border rounded text-xs" /></td>
                        <td className="p-2"><input value={tempEditItem.grupo3} onChange={e => setTempEditItem({...tempEditItem, grupo3: e.target.value})} className="w-full p-1 border rounded text-xs" /></td>
                        <td className="p-2 text-right text-xs text-slate-400">
                           (Histórico fixo)
                        </td>
                        <td className="p-2">
                          <div className="flex flex-col gap-1">
                             <button onClick={saveEdit} className="p-1 bg-green-100 text-green-600 rounded"><Check className="w-3 h-3" /></button>
                             <button onClick={() => setEditingId(null)} className="p-1 bg-slate-100 text-slate-600 rounded"><X className="w-3 h-3" /></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-4 font-mono text-slate-500 text-xs whitespace-nowrap">{item.conta}</td>
                        <td className="p-4 font-bold text-slate-800 text-sm">{item.label}</td>
                        <td className="p-4 text-slate-500 text-xs">{item.codigo}</td>
                        <td className="p-4 text-slate-600 text-xs">{item.tipoConta}</td>
                        <td className="p-4 text-xs text-slate-500">{item.grupo1}</td>
                        <td className="p-4 text-xs text-slate-500">{item.grupo2}</td>
                        <td className="p-4 text-xs text-slate-500">{item.grupo3}</td>
                        <td className="p-4 text-right text-xs font-mono text-blue-600">
                           {Object.keys(item.monthlyValues).length} meses
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 justify-end">
                            <button onClick={() => startEditing(item)} className="text-blue-600"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => deleteItem(item.id)} className="text-red-500"><Trash className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
