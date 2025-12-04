
import React, { useState } from 'react';
import { Department } from '../types';
import { Plus, Trash, Edit2, Check, X, Layers, Briefcase, ArrowUpZA, ArrowDownAZ } from 'lucide-react';

interface DepartmentManagerProps {
  departments: Department[];
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
}

export const DepartmentManager: React.FC<DepartmentManagerProps> = ({ departments, setDepartments }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempEditItem, setTempEditItem] = useState<Department | null>(null);

  // Quick Add State
  const initialNewItem = {
    codSetor: '',
    nomeSetor: '',
    descricao: '',
    ordem: ''
  };
  const [newItem, setNewItem] = useState(initialNewItem);

  const handleAddItem = () => {
    if (!newItem.codSetor || !newItem.nomeSetor) return;
    const id = Date.now().toString();
    
    setDepartments([...departments, {
      id,
      codSetor: newItem.codSetor,
      nomeSetor: newItem.nomeSetor,
      descricao: newItem.descricao,
      ordem: Number(newItem.ordem) || 99
    }]);
    setNewItem(initialNewItem);
  };

  const startEditing = (item: Department) => {
    setEditingId(item.id);
    setTempEditItem({ ...item });
  };

  const saveEdit = () => {
    if (tempEditItem) {
      setDepartments(departments.map(i => i.id === tempEditItem.id ? tempEditItem : i));
      setEditingId(null);
      setTempEditItem(null);
    }
  };

  const deleteItem = (id: string) => {
    if (confirm('Tem certeza que deseja remover este departamento?')) {
      setDepartments(departments.filter(i => i.id !== id));
    }
  };

  // Sort departments by Order then by Code
  const sortedDepartments = [...departments].sort((a, b) => {
    if (a.ordem !== b.ordem) return a.ordem - b.ordem;
    return a.codSetor.localeCompare(b.codSetor);
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-600" />
            Legenda de Departamentos (Setores)
          </h2>
          <p className="text-slate-500 text-sm">Configure os códigos de setores para mapeamento e agrupamento.</p>
        </div>
        <div className="flex gap-2">
           <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium border border-indigo-100 flex items-center gap-1">
              <ArrowUpZA className="w-3 h-3" /> Ordenado por Ordem
           </div>
        </div>
      </div>

      {/* Manual Add Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-sm font-bold text-slate-700 uppercase mb-4 tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4" /> Novo Departamento
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-1">
             <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Cód. Setor</label>
             <input
              placeholder="Ex: 100"
              value={newItem.codSetor}
              onChange={(e) => setNewItem({...newItem, codSetor: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Descrição do Setor</label>
            <input
              placeholder="Ex: VEICULOS NOVOS"
              value={newItem.nomeSetor}
              onChange={(e) => setNewItem({...newItem, nomeSetor: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none"
            />
          </div>
          <div className="md:col-span-1">
             <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Legenda (Curta)</label>
             <input
              placeholder="Ex: C & O"
              value={newItem.descricao}
              onChange={(e) => setNewItem({...newItem, descricao: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none"
            />
          </div>
          <div className="md:col-span-1 flex gap-2">
            <div className="flex-1">
                 <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Ordem</label>
                 <input
                  type="number"
                  placeholder="1"
                  value={newItem.ordem}
                  onChange={(e) => setNewItem({...newItem, ordem: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none"
                />
            </div>
            <button
                onClick={handleAddItem}
                disabled={!newItem.codSetor || !newItem.nomeSetor}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm h-[38px] w-[38px]"
            >
                <Plus className="w-5 h-5" />
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
                <th className="p-4 border-b whitespace-nowrap w-24">Cód. Setor</th>
                <th className="p-4 border-b whitespace-nowrap">Descrição Setor</th>
                <th className="p-4 border-b whitespace-nowrap">Legenda (Display)</th>
                <th className="p-4 border-b whitespace-nowrap w-20 text-center">Ordem</th>
                <th className="p-4 border-b w-16 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sortedDepartments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                        <Layers className="w-10 h-10 opacity-20" />
                        <p>Nenhum departamento cadastrado.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedDepartments.map((item) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors group">
                    {editingId === item.id && tempEditItem ? (
                      // Editing Row
                      <>
                        <td className="p-2 align-top"><input value={tempEditItem.codSetor} onChange={e => setTempEditItem({...tempEditItem, codSetor: e.target.value})} className="w-full p-2 border rounded text-xs" /></td>
                        <td className="p-2 align-top"><input value={tempEditItem.nomeSetor} onChange={e => setTempEditItem({...tempEditItem, nomeSetor: e.target.value})} className="w-full p-2 border rounded font-bold text-xs" /></td>
                        <td className="p-2 align-top"><input value={tempEditItem.descricao} onChange={e => setTempEditItem({...tempEditItem, descricao: e.target.value})} className="w-full p-2 border rounded text-xs" /></td>
                        <td className="p-2 align-top text-center"><input type="number" value={tempEditItem.ordem} onChange={e => setTempEditItem({...tempEditItem, ordem: parseInt(e.target.value) || 0})} className="w-full p-2 border rounded text-xs text-center" /></td>
                        <td className="p-2 align-top">
                          <div className="flex justify-end gap-1">
                             <button onClick={saveEdit} className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200"><Check className="w-4 h-4" /></button>
                             <button onClick={() => setEditingId(null)} className="p-1.5 bg-slate-100 text-slate-600 rounded hover:bg-slate-200"><X className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      // Display Row
                      <>
                        <td className="p-4 font-mono text-indigo-700 font-medium text-xs whitespace-nowrap">{item.codSetor}</td>
                        <td className="p-4 text-sm text-slate-800 font-medium">{item.nomeSetor}</td>
                        <td className="p-4 text-xs text-slate-600">
                            <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">{item.descricao}</span>
                        </td>
                        <td className="p-4 text-center text-xs text-slate-500 font-mono">{item.ordem}</td>
                        <td className="p-4">
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                            <button onClick={() => startEditing(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Editar"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => deleteItem(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Excluir"><Trash className="w-4 h-4" /></button>
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
