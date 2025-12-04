
import React, { useMemo, useEffect } from 'react';
import { LegendItem, GroupOrder } from '../types';
import { ArrowUp, ArrowDown, ListOrdered } from 'lucide-react';

interface GroupOrderManagerProps {
  items: LegendItem[];
  groupOrder: GroupOrder;
  setGroupOrder: (order: GroupOrder) => void;
}

export const GroupOrderManager: React.FC<GroupOrderManagerProps> = ({ items, groupOrder, setGroupOrder }) => {
  
  // Extract unique groups from items
  const { g3List, g2List, g1List } = useMemo(() => {
    const g3 = new Set<string>();
    const g2 = new Set<string>();
    const g1 = new Set<string>();

    items.forEach(item => {
      if (item.grupo3) g3.add(item.grupo3);
      if (item.grupo2) g2.add(item.grupo2);
      if (item.grupo1) g1.add(item.grupo1);
    });

    // Sort helper based on current groupOrder map
    const sorter = (a: string, b: string) => {
      const orderA = groupOrder[a] ?? 9999;
      const orderB = groupOrder[b] ?? 9999;
      if (orderA !== orderB) return orderA - orderB;
      return a.localeCompare(b);
    };

    return {
      g3List: Array.from(g3).sort(sorter),
      g2List: Array.from(g2).sort(sorter),
      g1List: Array.from(g1).sort(sorter),
    };
  }, [items, groupOrder]);

  const moveItem = (list: string[], index: number, direction: 'up' | 'down') => {
    const newList = [...list];
    if (direction === 'up' && index > 0) {
      [newList[index], newList[index - 1]] = [newList[index - 1], newList[index]];
    } else if (direction === 'down' && index < newList.length - 1) {
      [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
    } else {
      return;
    }

    // Rebuild the entire order map to preserve other levels
    const newOrderMap = { ...groupOrder };
    newList.forEach((name, idx) => {
      newOrderMap[name] = idx + 1;
    });
    setGroupOrder(newOrderMap);
  };

  const OrderList = ({ title, list }: { title: string, list: string[] }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="bg-slate-50 p-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">{title}</h3>
      </div>
      <div className="p-2 overflow-y-auto max-h-[500px] space-y-2">
        {list.length === 0 && <p className="text-center text-slate-400 text-xs p-4">Nenhum item encontrado.</p>}
        {list.map((name, index) => (
          <div key={name} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg hover:border-blue-200 hover:shadow-sm transition-all group">
            <span className="text-sm font-medium text-slate-700">{name}</span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => moveItem(list, index, 'up')}
                disabled={index === 0}
                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 disabled:opacity-20"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button 
                onClick={() => moveItem(list, index, 'down')}
                disabled={index === list.length - 1}
                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 disabled:opacity-20"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ListOrdered className="w-6 h-6 text-orange-500" />
            Ordenação de Grupos
          </h2>
          <p className="text-slate-500 text-sm">Defina a ordem de apresentação dos grupos no relatório (Dashboard).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OrderList title="Nível 1 (Grupo 3)" list={g3List} />
        <OrderList title="Nível 2 (Grupo 2)" list={g2List} />
        <OrderList title="Nível 3 (Grupo 1)" list={g1List} />
      </div>
    </div>
  );
};
