
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { LegendItem, Department } from '../types';
import { Calculator, Copy, Building, Calendar, Layers, AlertTriangle, ChevronRight, ChevronDown, RefreshCw, GitMerge, DollarSign, PieChart, BarChart3, Lock, History, ChevronsLeft, ChevronsRight, Info } from 'lucide-react';

interface BudgetManagerProps {
  items: LegendItem[];
  setItems: React.Dispatch<React.SetStateAction<LegendItem[]>>;
  departments: Department[];
}

const MONTH_ORDER = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

// Accounts Order
const AUTOMATIC_ORDER_MAP: Record<string, number> = {
  "Venda Bruta - Estoque": 1, "Vendas - Balcão": 2, "Vendas - Oficina SG": 3, "Vendas - Oficina SC": 4, "Vendas - Acessórios": 5, "Outras Mercadorias": 6, "Combustíveis / Lubrif.": 7, "Garantia e Revisão": 8, "Vendas - Alliance": 9, "Mão de Obra Mecânica": 10, "Mão de Obra Funilaria": 11, "Mão de Obra Pintura": 12, "Mão de Obra Revisão": 13, "Mão de Obra Garantia": 14, "Mão de Obra Serv. Rápido": 15, "Lavagem e Lubrificação": 16, "Mão de Obra Terceiros": 17, "Outras Vendas": 18, "(-) Devoluções das Vendas": 19, "Impostos s/ Vendas": 20, "Custos das Vendas - Veículos": 21, "Custos com Acessórios Incluídos na NF do Veículo": 22, "Custo com Outros Incluídos na NF do Veículo": 23, "Custo - Balcão": 24, "Custo - Oficina SG": 25, "Custo - Oficina SC": 26, "Custo - Acessórios": 27, "Outras Mercadorias (Custo)": 28, "Custo Vendas - Combustíveis / Lubrif.": 29, "Custo Vendas - Garantia e Revisão": 30, "Lubrificantes - SG": 31, "(-) Custos das Devoluções Vendas Balcão": 32, "(-) Custos das Devoluções Vendas SG": 33, "Custos - Mão de Obra Mecânica": 34, "Custos - Mão de Obra Funilaria": 35, "Custos - Mão de Obra Pintura": 36, "Custos - Mão de Obra Revisão": 37, "Custos - Mão de Obra Serv. Rápido": 38, "Custos - Lavagem e Lubrificação": 39, "Custos - Serviços de Terceiros": 40, "Custos - Encargos e Provisões de Férias e 13º Salário dos Produtivos": 41, "Bônus - Vendas do Estoque": 42, "Impostos sobre Bônus acima": 43, "Bônus Localização - Fundo Estrela": 44, "Comissão Fadireto": 45, "Bônus StarClass": 46, "Outros Bônus/Comissões": 47, "(-) Deduções s/ Bonus e comissões": 48, "(-) Estorno de Comissões e Bonificações": 49, "Retorno Financiamentos": 50, "Comissão Consórcio": 51, "Verbas de Bancos": 52, "Receita de Despachante": 53, "Receita de Seguros": 54, "Contribuição Montadora": 55, "Bônus de Performance": 56, "Bônus Complementar": 57, "Valores Recuperados - Mídia": 58, "Valores Recuperados - Fretes": 59, "Valores Recuperados - Incobráveis": 60, "Valores Recuperados - Juros s/ Venda Direta": 61, "Valores Recuperados - Bônus": 62, "Transferências Internas": 63, "Bônus de Usados": 64, "Valores Recuperados": 65, "Outras Comissões": 66, "Outras Rendas": 67, "Outras Rendas 2": 68, "(-) Impostos s/ Receitas Acima": 69, "PLUS Antecipado": 70, "Bônus Incentivos - Atingimento de Metas": 71, "Outras Comissões (Banco de Couro e Consórcio)": 72, "Ganho ou Perda na Alienação do Ativo Permanente": 73, "Outras Receitas - Outros Departamentos": 74, "Recuperação Propaganda": 75, "Outras Rendas/Recuperações - S / tributos": 76, "Recuperação/Perda de Garantia": 77, "(-) Cancelamentos": 78, "(-) Impostos s/ Receitas": 79, "Rendimento do Hold Back": 80, "Rendimento Fundo Capitalização": 81, "Rendimento de Aplicação Financeira": 82, "Juros Recebidos": 83, "Desconto / Bônus Obtido na Antecipação de Rotativos": 84, "Outras Rendas Financeiras": 85, "Variação Monetária Ativa": 86, "(-) Impostos s/ Receitas Financeiras": 87, "Venda Imobilizado": 88, "Impostos Recuperados": 89, "Aluguel de Espaço": 90, "Receitas de Dividendos Consórcio": 91, "Outras Rendas não operacionais": 92, "Recompra": 93, "(-) Impostos s/ Receitas Não Operacionais": 94, "Salários - Folha de Pagto.": 95, "Estagiário / Temporário": 96, "Pro-Labore": 97, "DSR": 98, "Horas Extras": 99, "Gratificações": 100, "Encargos": 101, "F.G.T.S. - Recolhido": 102, "F.G.T.S. 40% Multa Recisão": 103, "Férias - Provisão + Enc": 104, "13º Salário - Provisão + Enc": 105, "I.N.S.S.": 106, "I.N.S.S. - Prolabore": 107, "Abono Pecuniário": 108, "Férias / 13 Salário Indenizado": 109, "Insalubridade": 110, "Indenizações Trabalhistas / Acordos trabalhistas": 111, "Adicional Noturno": 112, "Aviso Prévio": 113, "Repouso Remunerado": 114, "Outras despesas com pessoal": 115, "Vale Transporte": 116, "Alimentação e refeição": 117, "Cursos / Formação Profissional": 118, "Participação Lucro (14°)": 119, "Gastos c/ Pessoal": 120, "Salário Educação": 121, "Assistência Médica e Odontológica": 122, "Fardamento e EPI": 123, "Serviços de Terceiros": 124, "INSS sobre Prestação de Serviço Terceiros": 125, "Serviços de Assistência Jurídica": 126, "Serviços de Contabilidade": 127, "Consultoria/Auditoria": 128, "Internet": 129, "Vigilância": 130, "Limpeza": 131, "Processamento de Dados": 132, "Aluguéis": 133, "Leasing": 134, "IPTU": 135, "Amortizações / Depreciações": 136, "Água, Esgoto e Energia Elétrica": 137, "Copa e Bar": 138, "Bens de Natureza Permanente": 139, "Cortesias / Brindes e Bonificações": 140,
  "Condução, Pedágio e Estacionamento": 141, "Combustível / Lubrificante operação": 142, "Donativos e Contribuições": 143, "Associações de Classe": 144, "Multas": 145, "Despesas Judiciais e Legais": 146, "Impostos e Taxas Diversas": 147, "Despesas Telecomunicação": 148, "Locações de Máquinas e Equipamentos": 149, "Locação de Veículos": 150, "Manutenção de Máquinas e Equipamentos": 151, "Cons Manut Prédios e Benfeitorias": 152, "Cons Manut Maq, móveis e utensílios": 153, "Manutenção e reparo comp., sistemas e Software": 154, "Manut Veículos de uso": 155, "Impresso / Material de escritório": 156, "Malotes, Despachos, Cartas e Telegramas": 157, "Despesas com cópias": 158, "Despesas com Cartório": 159, "Materiais de consumo": 160, "Materiais de Limpeza": 161, "Materiais de Informática": 162, "Ferramentas, materiais e serviços": 163, "Eventos": 164, "Seguros": 165, "Garantias Recusadas": 166, "Licenciamento de veículos": 167, "Despesas bancárias e de cobrança": 168, "Fretes e carretos operacionais": 169, "Viagens e Representações": 170, "Despesas Indedutíveis": 171, "Outras Despesas": 172, "Despesas com Propaganda e Promoção de Vendas": 173, "Comissões a Empregados": 174, "Encargos INSS": 175, "Encargos FGTS": 176, "Lavagem": 177, "Despesas com Emplacamento": 178, "Taxa Cartão de Crédito": 179, "Despachante": 180, "Cortesias / Brindes": 181, "Combustível / Lubrificante": 182, "Fretes e carretos": 183, "Contrato de Manutenção": 184, "Despesas com Acessórios": 185, "Despesas com Vendas - Materiais Promocionais, Pinturas etc.": 186, "Revisão de entregas": 187, "Fretes / Guincho": 188, "IPVAs": 189, "Outras despesas de vendas": 190, "Juros - Passivos": 191, "Juros - Empréstimos Bancários": 192, "Juros - Estoque Financiado (Rotativo)": 193, "Juros - Conta Garantida": 194, "Juros - Refis": 195, "Juros - Titulos Negociados": 196, "Juros - Cheques Negociados": 197, "Juros - Financiamento de Test Drive": 198, "I.O.F. / I.O.C.": 199, "Despesas Adm. - Fundo de Capitalização": 200, "Despesa Bancária": 201, "Despesa Carta de Fiança": 202, "Descontos Concedidos": 203, "Despesa com Perda Op. Crédito": 204, "Despesas com Cartão de Crédito": 205, "Despesas com Antecipação de Cartão de Crédito": 206, "Variação Monetária Passiva": 207, "Custo da Venda do Imobilizado": 208, "Reformas e benfeitorias de imóveis": 209, "Depreciação Best Drive": 210, "Depreciação - Outros": 211, "Indenizações Trabalhistas de Processos Antigos": 212, "Juros - Capital Próprio": 213, "Outras Despesas não Operacionais": 214, "Fracionamento de Preços": 215,
};

// Groups Hierarchy
const PRESET_GROUP_ORDER: Record<string, number> = {
  "LUCRO BRUTO": 10, "DESPESAS OPERACIONAIS": 20, "FINANCEIRO E NÃO OPERACIONAL": 30,
  "VENDAS LÍQUIDAS": 10, "VENDAS LIQUIDAS": 10, "CUSTOS": 20, "DESPESAS VARIÁVEIS": 30, "DESPESAS VARIAVEIS": 30, "DESPESAS FIXAS": 40, "RESULTADO FINANCEIRO": 50, "RESULTADO NÃO OPERACIONAL": 60, "RESULTADO NAO OPERACIONAL": 60,
  "VENDAS BRUTAS": 100, "RECEITAS OPERACIONAIS": 110, "BÔNUS E COMISSÕES": 120, "BONUS E COMISSOES": 120, "DEDUÇÕES": 130, "DEDUCOES": 130, "COMISSÕES A EMPREGADOS": 200, "DESPESAS COM VENDAS": 210, "DESPESAS DE PROPAGANDA": 220, "DESP COM FUNCIONAMENTO": 300, "DESPESA COM PESSOAL": 310, "DESPESA COM BENEFÍCIOS": 320, "SERVIÇOS DE TERCEIROS": 330, "SERVICOS DE TERCEIROS": 330, "DESP COM OCUPAÇÃO": 340, "DESPESA COM OCUPAÇÃO": 340, "RECEITAS FINANCEIRAS": 400, "DESPESAS FINANCEIRAS": 410, "RECEITAS NÃO OPERACIONAIS": 500, "DESPESAS NÃO OPERACIONAIS": 510
};

interface TreeNode {
  type: string;
  label: string;
  children: Record<string, TreeNode>;
  values: Record<string, number>;
  realizedValues: Record<string, number>; 
  id: string;
  conta?: string;
  isLeaf?: boolean;
  order: number;
  hasFixedOrder?: boolean;
}

// FORMATTING HELPERS
const formatCurrencyBR = (value: number | string | undefined): string => {
  if (value === '' || value === undefined || value === null) return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
};

const parseCurrencyBR = (value: string): number => {
  const clean = value.replace(/\./g, '').replace(',', '.');
  return parseFloat(clean) || 0;
};

// COMPONENT: Formatted Input
const FormattedInput: React.FC<{
  value: number | string;
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
  isPercentage?: boolean;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
}> = ({ value, onChange, className, placeholder, isPercentage, onFocus }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [localVal, setLocalVal] = useState<string>('');

  // Sync when prop updates and not focused
  useEffect(() => {
    if (!isFocused) {
       if (typeof value === 'string' && value.endsWith('%')) {
          setLocalVal(value);
       } else {
          setLocalVal(formatCurrencyBR(value));
       }
    }
  }, [value, isFocused]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    // On focus, show raw number for easier editing
    // If it's a percentage string, keep it. If it's a number, make it raw string.
    if (typeof value === 'number') {
        setLocalVal(value.toString()); 
    } else {
        setLocalVal(value.toString());
    }
    e.target.select();
    if (onFocus) onFocus(e);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Trigger update
    onChange(localVal);
  };

  return (
    <input
      type="text"
      placeholder={placeholder}
      value={localVal}
      onChange={(e) => setLocalVal(e.target.value)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={className}
    />
  );
};

export const BudgetManager: React.FC<BudgetManagerProps> = ({ items, setItems, departments }) => {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [sourceYear, setSourceYear] = useState<string>(''); 
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedLegend, setSelectedLegend] = useState<string>('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [distributionMode, setDistributionMode] = useState<'history' | 'equal'>('history');
  const [showMonths, setShowMonths] = useState(false); 

  const { availableCompanies, availableYears } = useMemo(() => {
    const companies = new Set<string>();
    const years = new Set<string>();
    items.forEach(item => {
      if (item.breakdown) Object.keys(item.breakdown).forEach(c => companies.add(c));
      if (item.breakdownPlanned) Object.keys(item.breakdownPlanned).forEach(c => companies.add(c));
    });
    const currentYear = new Date().getFullYear();
    years.add(currentYear.toString());
    years.add((currentYear + 1).toString());

    return {
        availableCompanies: Array.from(companies).sort(),
        availableYears: Array.from(years).sort().reverse()
    };
  }, [items]);

  useEffect(() => {
      if(availableYears.length > 0 && !sourceYear) {
          setSourceYear(availableYears[0]);
      }
  }, [availableYears]);

  const legendGroups = useMemo(() => {
    const map = new Map<string, Set<string>>();
    departments.forEach(d => {
        const legend = d.descricao || d.nomeSetor || 'Outros';
        if (!map.has(legend)) map.set(legend, new Set());
        if (d.nomeSetor) map.get(legend)?.add(d.nomeSetor);
        if (d.codSetor) map.get(legend)?.add(d.codSetor);
    });
    return map;
  }, [departments]);

  const availableLegends = useMemo(() => Array.from(legendGroups.keys()).sort(), [legendGroups]);

  // Handle "Consolidated" Logic
  const isConsolidated = selectedLegend === '';
  
  const targetSectors = useMemo(() => {
      const set = new Set<string>();
      if (isConsolidated) {
          // If consolidated, we aggregate ALL sectors
          legendGroups.forEach(groupSet => {
             groupSet.forEach(s => set.add(s.toLowerCase().trim()));
          });
          availableLegends.forEach(l => set.add(l.toLowerCase().trim()));
      } else {
          const groupMembers = legendGroups.get(selectedLegend);
          if (groupMembers) groupMembers.forEach(s => set.add(s.toLowerCase().trim()));
          set.add(selectedLegend.toLowerCase().trim());
      }
      return set;
  }, [selectedLegend, legendGroups, isConsolidated, availableLegends]);

  const contextRevenues = useMemo((): Record<string, number> => {
     if (!selectedCompany) return {};
     const revenues: Record<string, number> = {};
     items.forEach(item => {
        const isRevenue = item.grupo2?.toUpperCase().includes('LÍQUIDA') || item.grupo2?.toUpperCase().includes('LIQUIDA');
        if (isRevenue) {
            const yearMap = item.breakdownPlanned?.[selectedCompany]?.[selectedYear];
            if (yearMap) {
                Object.keys(yearMap).forEach(secKey => {
                    const secKeyLower = secKey.toLowerCase().trim();
                    if (targetSectors.has(secKeyLower)) {
                         const vals = yearMap[secKey];
                         if (vals) Object.entries(vals).forEach(([m, v]) => { revenues[m] = (revenues[m] || 0) + (Number(v) || 0); });
                    }
                });
            }
        }
     });
     return revenues;
  }, [items, selectedCompany, selectedLegend, selectedYear, targetSectors]);

  // Total Annual Revenue (Planned) used for AV %
  const totalAnnualRevenue = (Object.values(contextRevenues) as number[]).reduce((a, b) => a + b, 0);

  const getPresetOrder = (label: string): number => {
      const upper = label.trim().toUpperCase();
      if (PRESET_GROUP_ORDER[upper]) return PRESET_GROUP_ORDER[upper];
      return 999999;
  };
  const getLeafOrder = (label: string): number => AUTOMATIC_ORDER_MAP[label.trim()] || 999999;

  const treeData = useMemo<TreeNode[]>(() => {
    if (!selectedCompany) return [];
    const root: Record<string, TreeNode> = {};

    const accumulate = (node: TreeNode, vals: Record<string, number>, realizedVals: Record<string, number>, childOrder?: number) => {
        Object.entries(vals).forEach(([m, v]) => node.values[m] = (node.values[m] || 0) + v);
        Object.entries(realizedVals).forEach(([m, v]) => node.realizedValues[m] = (node.realizedValues[m] || 0) + v);
        if (childOrder !== undefined && !node.hasFixedOrder && childOrder < node.order) node.order = childOrder;
    };

    const createNode = (id: string, label: string, type: string): TreeNode => {
        const preset = getPresetOrder(label);
        return {
            id, label, type, children: {}, values: {}, realizedValues: {}, 
            order: preset !== 999999 ? preset : 999999, hasFixedOrder: preset !== 999999
        };
    };

    items.forEach(item => {
        if (!item.grupo3) return;
        if (!root[item.grupo3]) root[item.grupo3] = createNode(`g3-${item.grupo3}`, item.grupo3, 'G3');
        const g3Node = root[item.grupo3];

        const g2Key = item.grupo2 || 'OUTROS';
        if (!g3Node.children[g2Key]) g3Node.children[g2Key] = createNode(`g2-${item.grupo3}-${g2Key}`, g2Key, 'G2');
        const g2Node = g3Node.children[g2Key];

        const g1Key = item.grupo1 || 'GERAL';
        if (!g2Node.children[g1Key]) g2Node.children[g1Key] = createNode(`g1-${item.grupo3}-${g2Key}-${g1Key}`, g1Key, 'G1');
        const g1Node = g2Node.children[g1Key];

        const itemKey = item.id;
        const leafOrder = getLeafOrder(item.label) !== 999999 ? getLeafOrder(item.label) : (getLeafOrder(item.tipoConta) || 999999);
        
        // Aggregation Logic:
        // We need to sum up ALL sectors that match the current selection (Consolidated or Specific)
        const currentPlanned: Record<string, number> = {};
        const currentRealized: Record<string, number> = {};

        // 1. PLANNED
        const companyPlanned = item.breakdownPlanned?.[selectedCompany]?.[selectedYear];
        if (companyPlanned) {
            Object.keys(companyPlanned).forEach(secKey => {
                if (targetSectors.has(secKey.toLowerCase().trim())) {
                    Object.entries(companyPlanned[secKey]).forEach(([m, v]) => currentPlanned[m] = (currentPlanned[m] || 0) + (Number(v)||0));
                }
            });
        }

        // 2. REALIZED
        if (sourceYear && item.breakdown?.[selectedCompany]?.[sourceYear]) {
             const companyRealized = item.breakdown[selectedCompany][sourceYear];
             Object.keys(companyRealized).forEach(secKey => {
                 if (targetSectors.has(secKey.toLowerCase().trim())) {
                     Object.entries(companyRealized[secKey]).forEach(([m, v]) => currentRealized[m] = (currentRealized[m] || 0) + (Number(v) || 0));
                 }
             });
        }
        
        g1Node.children[itemKey] = {
            type: 'ITEM', label: item.label, conta: item.conta, id: item.id,
            values: currentPlanned, realizedValues: currentRealized, isLeaf: true,
            children: {}, order: leafOrder, hasFixedOrder: true
        };

        accumulate(g1Node, currentPlanned, currentRealized, leafOrder);
        accumulate(g2Node, currentPlanned, currentRealized, g1Node.order);
        accumulate(g3Node, currentPlanned, currentRealized, g2Node.order);
    });
    return Object.values(root).sort((a, b) => a.order - b.order);
  }, [items, selectedCompany, selectedLegend, selectedYear, sourceYear, targetSectors, isConsolidated]);

  const toggleExpand = (id: string) => {
    setExpandedNodes(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
        return newSet;
    });
  };

  useEffect(() => {
      // Initially collapse all except Group 3 and 2
      const initialExpanded = new Set<string>();
      treeData.forEach((g3: TreeNode) => {
          initialExpanded.add(g3.id); // Expand G3
          (Object.values(g3.children) as TreeNode[]).forEach(g2 => {
              initialExpanded.add(g2.id); // Expand G2
              // G1 remains collapsed
          })
      });
      setExpandedNodes(initialExpanded);
  }, [treeData.length]); 


  const netResult = useMemo(() => {
    const planned: Record<string, number> = {};
    const realized: Record<string, number> = {};
    treeData.forEach((node: TreeNode) => {
        Object.entries(node.values).forEach(([m, v]) => planned[m] = (planned[m] || 0) + (v as number));
        Object.entries(node.realizedValues).forEach(([m, v]) => realized[m] = (realized[m] || 0) + (v as number));
    });
    return { planned, realized };
  }, [treeData]);

  const handleValueChange = (itemId: string, month: string, rawValue: string) => {
    if (isConsolidated) {
        alert("Não é possível editar no modo Consolidado. Selecione uma guia de Departamento.");
        return;
    }
    setItems((prevItems: LegendItem[]) => prevItems.map((item: LegendItem) => {
      if (item.id === itemId) {
        const newItem = { ...item };
        const storageSectorKey = selectedLegend;
        if (!newItem.breakdownPlanned) newItem.breakdownPlanned = {};
        if (!newItem.breakdownPlanned[selectedCompany]) newItem.breakdownPlanned[selectedCompany] = {};
        if (!newItem.breakdownPlanned[selectedCompany][selectedYear]) newItem.breakdownPlanned[selectedCompany][selectedYear] = {};
        if (!newItem.breakdownPlanned[selectedCompany][selectedYear][storageSectorKey]) newItem.breakdownPlanned[selectedCompany][selectedYear][storageSectorKey] = {};
        
        if (!newItem.breakdownPercentage) newItem.breakdownPercentage = {};
        if (!newItem.breakdownPercentage[selectedCompany]) newItem.breakdownPercentage[selectedCompany] = {};
        if (!newItem.breakdownPercentage[selectedCompany][selectedYear]) newItem.breakdownPercentage[selectedCompany][selectedYear] = {};
        if (!newItem.breakdownPercentage[selectedCompany][selectedYear][storageSectorKey]) newItem.breakdownPercentage[selectedCompany][selectedYear][storageSectorKey] = {};

        if (rawValue.trim().endsWith('%')) {
             const pctStr = rawValue.replace('%', '').trim();
             const pct = parseFloat(pctStr) / 100;
             newItem.breakdownPercentage[selectedCompany][selectedYear][storageSectorKey][month] = rawValue;
             const baseRevenue = contextRevenues[month] || 0;
             newItem.breakdownPlanned[selectedCompany][selectedYear][storageSectorKey][month] = baseRevenue * pct;
        } else {
             // Use parser for Brazilian format
             const val = parseCurrencyBR(rawValue);
             newItem.breakdownPlanned[selectedCompany][selectedYear][storageSectorKey][month] = val;
             delete newItem.breakdownPercentage[selectedCompany][selectedYear][storageSectorKey][month];
        }
        return newItem;
      }
      return item;
    }));
  };

  // Handles Distribution of Annual Total -> Months
  const handleAnnualDistribution = (node: TreeNode, newVal: number) => {
      if (isConsolidated) {
         alert("Selecione um departamento para editar.");
         return;
      }

      const getLeaves = (n: TreeNode): TreeNode[] => {
          const list: TreeNode[] = [];
          if (n.isLeaf) list.push(n);
          if (n.children) (Object.values(n.children) as TreeNode[]).forEach(c => list.push(...getLeaves(c)));
          return list;
      };

      const leaves = getLeaves(node);
      if (leaves.length === 0) return;

      const groupRealizedTotal = leaves.reduce((acc: number, leaf: TreeNode) => {
          return acc + (Object.values(leaf.realizedValues) as number[]).reduce((sum: number, v: number) => sum + v, 0);
      }, 0);

      // 1. Distribute Total Annual to Leaf Nodes
      const leafAllocations: { id: string; target: number; realizedMap: Record<string, number> }[] = leaves.map((leaf: TreeNode) => {
          const leafRealizedTotal = (Object.values(leaf.realizedValues) as number[]).reduce((sum: number, v: number) => sum + v, 0);
          let leafAnnualTarget = 0;
          if (groupRealizedTotal !== 0) {
               leafAnnualTarget = newVal * (leafRealizedTotal / groupRealizedTotal);
          } else {
               leafAnnualTarget = newVal / leaves.length;
          }
          return { id: leaf.id, target: leafAnnualTarget, realizedMap: leaf.realizedValues };
      });

      // 2. Distribute Annual Target to Months for each Leaf
      setItems((prevItems: LegendItem[]) => prevItems.map((item: LegendItem) => {
          const allocation = leafAllocations.find(a => a.id === item.id);
          if (allocation) {
               const newItem = { ...item };
               const storageSectorKey = selectedLegend;
               if (!newItem.breakdownPlanned) newItem.breakdownPlanned = {};
               if (!newItem.breakdownPlanned[selectedCompany]) newItem.breakdownPlanned[selectedCompany] = {};
               if (!newItem.breakdownPlanned[selectedCompany][selectedYear]) newItem.breakdownPlanned[selectedCompany][selectedYear] = {};
               if (!newItem.breakdownPlanned[selectedCompany][selectedYear][storageSectorKey]) newItem.breakdownPlanned[selectedCompany][selectedYear][storageSectorKey] = {};

               const annualRealized = (Object.values(allocation.realizedMap) as number[]).reduce((sum: number, v: number) => sum + v, 0);

               MONTH_ORDER.forEach(month => {
                   let monthValue = 0;
                   if (distributionMode === 'history' && annualRealized !== 0) {
                        const weight = (Number(allocation.realizedMap[month]) || 0) / annualRealized;
                        monthValue = allocation.target * weight;
                   } else {
                        // Equal
                        monthValue = allocation.target / 12;
                   }
                   newItem.breakdownPlanned[selectedCompany][selectedYear][storageSectorKey][month] = monthValue;
                   
                   // Clean up percentage configs if manual override happens
                   if (newItem.breakdownPercentage?.[selectedCompany]?.[selectedYear]?.[storageSectorKey]?.[month]) {
                        delete newItem.breakdownPercentage[selectedCompany][selectedYear][storageSectorKey][month];
                   }
               });
               return newItem;
          }
          return item;
      }));
  };

  const handleCopyRealized = () => {
    if (!selectedCompany || isConsolidated || !sourceYear) {
        alert("Selecione um departamento específico e uma empresa para copiar.");
        return;
    }
    if (!confirm(`ATENÇÃO: Isso irá COPIAR o realizado de ${sourceYear} para o orçamento de ${selectedYear} (Grupo "${selectedLegend}").`)) return;
    
    setItems((prevItems: LegendItem[]) => prevItems.map((item: LegendItem) => {
        const yearRealized = item.breakdown?.[selectedCompany]?.[sourceYear];
        if (yearRealized) {
            const aggregatedRealized: Record<string, number> = {};
            let hasData = false;
            Object.keys(yearRealized).forEach(secKey => {
                // Here we match specifically the items belonging to the selected Legend
                if (targetSectors.has(secKey.toLowerCase().trim())) {
                    Object.entries(yearRealized[secKey]).forEach(([m, v]) => {
                        aggregatedRealized[m] = (aggregatedRealized[m] || 0) + (v as number);
                        hasData = true;
                    });
                }
            });
            if (hasData) {
                const newItem = { ...item };
                if (!newItem.breakdownPlanned) newItem.breakdownPlanned = {};
                if (!newItem.breakdownPlanned[selectedCompany]) newItem.breakdownPlanned[selectedCompany] = {};
                if (!newItem.breakdownPlanned[selectedCompany][selectedYear]) newItem.breakdownPlanned[selectedCompany][selectedYear] = {};
                newItem.breakdownPlanned[selectedCompany][selectedYear][selectedLegend] = aggregatedRealized;
                return newItem;
            }
        }
        return item;
    }));
  };

  const fmt = (v: number) => formatCurrencyBR(v);
  const fmtPct = (v: number) => totalAnnualRevenue ? `${((v / totalAnnualRevenue) * 100).toFixed(1)}%` : '-';

  const renderRow = (node: TreeNode, level: number) => {
      const isExpanded = expandedNodes.has(node.id);
      const hasChildren = Object.keys(node.children).length > 0;
      const paddingLeft = level * 20 + 12;
      let bgClass = 'bg-white';
      let textClass = 'text-slate-600 font-normal';
      let isGroup = false;

      if (level === 0) { bgClass = 'bg-slate-100 border-t border-slate-300'; textClass = 'font-bold text-slate-900 uppercase'; isGroup = true; }
      else if (level === 1) { bgClass = 'bg-slate-50'; textClass = 'font-bold text-slate-800'; isGroup = true; }
      else if (level === 2) { textClass = 'font-semibold text-slate-700'; isGroup = true; }

      const rowTotal = (Object.values(node.values) as number[]).reduce((a, b) => a + (Number(b) || 0), 0);
      const rowRealizedTotal = (Object.values(node.realizedValues) as number[]).reduce((a, b) => a + (Number(b) || 0), 0);
      const rowRealizedAvg = rowRealizedTotal / 12;
      const sortedChildren = (Object.values(node.children) as TreeNode[]).sort((a, b) => a.order - b.order);

      return (
          <React.Fragment key={node.id}>
              <tr className={`hover:bg-blue-50/50 transition-colors group border-b border-slate-100 ${bgClass}`}>
                  <td className={`p-2 border-r border-slate-200 sticky left-0 z-10 ${bgClass} shadow-[2px_0_5px_rgba(0,0,0,0.02)] min-w-[300px] w-[300px]`}>
                      <div className="flex items-center gap-2" style={{ paddingLeft: `${paddingLeft}px` }}>
                          {!node.isLeaf && hasChildren && (
                              <button onClick={() => toggleExpand(node.id)} className="p-0.5 rounded hover:bg-slate-200 text-slate-500">
                                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              </button>
                          )}
                          {(node.isLeaf) && <span className="w-4" />}
                          <div className="truncate">
                              <span className={textClass}>{node.label}</span>
                              {node.conta && <div className="text-[9px] text-slate-400 font-mono ml-6">{node.conta}</div>}
                          </div>
                      </div>
                  </td>

                  {/* REFERENCE COLUMN (Total & Avg Realized) */}
                  <td className={`p-2 border-r border-slate-200 text-right min-w-[100px] sticky left-[300px] z-20 bg-slate-50 text-slate-500 text-xs shadow-[2px_0_5px_rgba(0,0,0,0.02)]`}>
                      <div className="flex flex-col justify-center h-full gap-0.5">
                           <div className="flex justify-between gap-2">
                               <span className="text-[9px] uppercase font-bold text-slate-400">Tot:</span>
                               <span className="font-mono">{fmt(rowRealizedTotal)}</span>
                           </div>
                           <div className="flex justify-between gap-2">
                               <span className="text-[9px] uppercase font-bold text-slate-400">Ø:</span>
                               <span className="font-mono">{fmt(rowRealizedAvg)}</span>
                           </div>
                      </div>
                  </td>

                  {/* ANNUAL TARGET COLUMN */}
                  <td className={`p-2 border-r border-slate-200 text-right min-w-[140px] sticky left-[400px] z-20 ${bgClass} shadow-[2px_0_5px_rgba(0,0,0,0.05)]`}>
                      <div className="flex items-center justify-end gap-2">
                         <div className="flex flex-col items-end">
                            <FormattedInput
                              placeholder="-"
                              value={rowTotal}
                              onChange={(valStr) => {
                                  const val = parseCurrencyBR(valStr);
                                  handleAnnualDistribution(node, val);
                              }}
                              className={`w-28 text-right text-xs p-1.5 rounded border border-transparent hover:border-slate-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all font-bold text-purple-700 bg-purple-50/50 ${isConsolidated ? 'cursor-not-allowed opacity-50' : ''}`}
                            />
                            {/* Vertical Analysis % */}
                            <span className="text-[9px] text-slate-400 font-mono">
                               AV: {fmtPct(rowTotal)}
                            </span>
                         </div>
                      </div>
                  </td>
                  
                  {showMonths && MONTH_ORDER.map(m => {
                      const val = node.values[m] || 0;
                      const refVal = node.realizedValues[m] || 0;
                      
                      let displayVal: string | number = val !== 0 ? val : '';
                      let isPct = false;

                      if (node.isLeaf && node.id) {
                         const pctMap = items.find(i => i.id === node.id)?.breakdownPercentage?.[selectedCompany]?.[selectedYear]?.[selectedLegend];
                         if (pctMap && pctMap[m]) { displayVal = pctMap[m]; isPct = true; }
                      }

                      // Monthly AV% Calculation
                      const monthlyBase = contextRevenues[m] || 0;
                      const monthlyPct = monthlyBase ? (val / monthlyBase) * 100 : 0;

                      return (
                          <td key={m} className="p-2 border-r border-slate-50 text-right min-w-[100px]">
                              <div className="relative">
                                  {refVal !== 0 && (
                                      <div className="text-[9px] text-slate-400 mb-1 text-right font-mono">
                                        R: {fmt(refVal)}
                                      </div>
                                  )}
                                  <FormattedInput 
                                      placeholder="-"
                                      value={displayVal}
                                      onChange={(valStr) => {
                                          if (node.isLeaf) handleValueChange(node.id, m, valStr);
                                          else handleAnnualDistribution(node, parseCurrencyBR(valStr)); 
                                      }}
                                      className={`w-full text-right text-xs p-1.5 rounded border border-transparent hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all 
                                        ${isPct ? 'text-purple-600 font-bold bg-purple-50' : ''}
                                        ${isGroup ? 'font-bold text-slate-800 bg-white/50 border-slate-200' : 'bg-transparent text-slate-700 font-mono'}
                                        ${isConsolidated ? 'cursor-not-allowed opacity-50' : ''}
                                      `}
                                  />
                                  <div className="text-[8px] text-slate-400 text-right mt-0.5 font-mono">
                                      {monthlyBase ? `${monthlyPct.toFixed(1)}%` : '-'}
                                  </div>
                              </div>
                          </td>
                      )
                  })}
              </tr>
              {isExpanded && sortedChildren.map(child => renderRow(child, level + 1))}
          </React.Fragment>
      );
  };

  const netRealizedTotal = (Object.values(netResult.realized) as number[]).reduce((a,b)=>a+b, 0);
  const netPlannedTotal = (Object.values(netResult.planned) as number[]).reduce((a,b)=>a+b, 0);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm flex-shrink-0">
         <div className="flex justify-between items-start">
             <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Calculator className="w-6 h-6 text-orange-600" />
                    Gestão de Orçamento
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                    Defina a <strong>Meta Anual</strong> ou detalhe mês a mês.
                </p>
             </div>
             
             <div className="flex gap-4">
                 <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                    <Building className="w-4 h-4 text-slate-400 ml-2" />
                    <select 
                        value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)}
                        className={`py-2 pr-4 bg-transparent text-sm outline-none cursor-pointer border-none font-medium text-slate-700`}
                    >
                        <option value="">Selecione a Empresa...</option>
                        {availableCompanies.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div className="w-px h-6 bg-slate-300"></div>
                    
                    <Calendar className="w-4 h-4 text-slate-400 ml-2" />
                     <select 
                        value={selectedYear} onChange={e => setSelectedYear(e.target.value)}
                        className="py-2 pr-4 bg-transparent text-sm outline-none cursor-pointer border-none font-medium text-slate-700"
                    >
                       {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                 </div>

                 {/* Toggle Month Visibility */}
                 <div className="flex items-center">
                    <button
                        onClick={() => setShowMonths(!showMonths)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            showMonths 
                            ? 'bg-slate-200 text-slate-700 border-slate-300' 
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}
                        title={showMonths ? "Ocultar colunas mensais" : "Mostrar colunas mensais"}
                    >
                        {showMonths ? <ChevronsLeft className="w-4 h-4" /> : <ChevronsRight className="w-4 h-4" />}
                        {showMonths ? 'Ocultar Meses' : 'Detalhar Meses'}
                    </button>
                 </div>

                 {/* Distribution Mode Toggle */}
                 <div className="flex items-center bg-purple-50 border border-purple-100 rounded-lg p-1">
                    <span className="text-[10px] font-bold text-purple-800 uppercase px-2">Distribuir:</span>
                    <button 
                       onClick={() => setDistributionMode('history')}
                       className={`px-3 py-1.5 text-xs rounded font-bold transition-all ${distributionMode === 'history' ? 'bg-purple-600 text-white shadow-sm' : 'text-purple-600 hover:bg-purple-100'}`}
                       title="Distribui conforme a sazonalidade do realizado"
                    >
                       Histórico
                    </button>
                    <button 
                       onClick={() => setDistributionMode('equal')}
                       className={`px-3 py-1.5 text-xs rounded font-bold transition-all ${distributionMode === 'equal' ? 'bg-purple-600 text-white shadow-sm' : 'text-purple-600 hover:bg-purple-100'}`}
                       title="Divide igualmente por 12"
                    >
                       Linear
                    </button>
                 </div>

                 <div className="flex items-center gap-2 bg-blue-50 p-1 rounded-lg border border-blue-100">
                    <span className="px-2 text-[10px] font-bold text-blue-800 uppercase">Copiar Real:</span>
                    <select
                        value={sourceYear} onChange={e => setSourceYear(e.target.value)}
                        className="bg-white border border-blue-200 text-blue-700 text-xs rounded py-1 pl-2 pr-6 outline-none cursor-pointer font-medium"
                    >
                         {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <button
                        onClick={handleCopyRealized}
                        disabled={!selectedCompany || isConsolidated || !sourceYear}
                        className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        title="Copiar integralmente"
                    >
                        <RefreshCw className="w-3 h-3" />
                    </button>
                 </div>
             </div>
         </div>
      </div>
      
      {/* Department Tabs Bar - Matches AnalysisView */}
      <div className="bg-white border-b border-slate-200 overflow-x-auto flex-shrink-0">
         <div className="flex px-8 gap-6 min-w-max">
            <button
               onClick={() => setSelectedLegend('')}
               className={`py-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
                   selectedLegend === '' 
                   ? 'border-blue-600 text-blue-600' 
                   : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-200'
               }`}
            >
               <Layers className="w-4 h-4" />
               Visão Consolidada (Leitura)
            </button>
            {availableLegends.map(l => (
               <button
                  key={l}
                  onClick={() => setSelectedLegend(l)}
                  className={`py-4 text-sm font-medium border-b-2 transition-all ${
                      selectedLegend === l
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-200'
                  }`}
               >
                  {l}
               </button>
            ))}
         </div>
      </div>

      <div className="flex-1 overflow-auto p-6 bg-slate-50/50">
         {!selectedCompany ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-400">
                 <div className="p-6 bg-white rounded-full mb-4 shadow-sm border border-slate-100">
                    <AlertTriangle className="w-12 h-12 text-orange-400" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-700 mb-2">Selecione uma Empresa</h3>
                 <p className="max-w-md text-center">Para iniciar o orçamento, selecione a empresa no menu superior.</p>
             </div>
         ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full animate-fade-in">
                 {isConsolidated && (
                    <div className="bg-blue-50 p-2 text-center text-xs text-blue-800 font-medium border-b border-blue-100 flex items-center justify-center gap-2">
                        <Info className="w-4 h-4" />
                        Modo Consolidado: Os valores exibidos são a soma de todos os departamentos. Para editar, selecione uma guia específica.
                    </div>
                 )}
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs tracking-wider sticky top-0 z-40 shadow-sm">
                            <tr>
                                <th className="p-3 border-b border-r sticky left-0 z-50 bg-slate-50 min-w-[300px] w-[300px]">Conta / Descrição</th>
                                
                                <th className="p-3 border-b border-r sticky left-[300px] z-50 bg-slate-50 text-slate-600 text-right min-w-[100px] shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                                    Histórico (Ref)
                                </th>

                                <th className="p-3 border-b border-r sticky left-[400px] z-50 bg-purple-50 text-purple-800 text-right min-w-[140px] shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                                   Meta Anual
                                </th>
                                {showMonths && MONTH_ORDER.map(m => (
                                    <th key={m} className="p-3 border-b text-right min-w-[100px]">{m}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {treeData.map(node => renderRow(node, 0))}
                        </tbody>
                        <tfoot className="sticky bottom-0 z-40 bg-slate-900 text-white shadow-[0_-2px_10px_rgba(0,0,0,0.2)]">
                            <tr>
                                <td className="p-3 font-bold uppercase tracking-wider text-sm sticky left-0 z-50 bg-slate-900 border-r border-slate-700 flex items-center gap-2 min-w-[300px]">
                                     <div className="p-1 bg-white/10 rounded"><DollarSign className="w-4 h-4" /></div>
                                     RESULTADO / TOTAL
                                </td>
                                
                                <td className="p-3 text-right font-bold text-slate-400 border-r border-slate-700 sticky left-[300px] z-50 bg-slate-900 min-w-[100px]">
                                     <div className="flex flex-col gap-0.5">
                                         <span className="text-[9px] uppercase">Tot: {fmt(netRealizedTotal)}</span>
                                         <span className="text-[9px] uppercase">Ø: {fmt(netRealizedTotal/12)}</span>
                                     </div>
                                </td>

                                <td className="p-3 text-right font-bold text-yellow-400 border-r border-slate-700 sticky left-[400px] z-50 bg-slate-900 min-w-[140px]">
                                   {fmt(netPlannedTotal)}
                                </td>
                                
                                {showMonths && MONTH_ORDER.map(m => {
                                    const val = netResult.planned[m] || 0;
                                    const refVal = netResult.realized[m] || 0;
                                    return (
                                        <td key={m} className="p-3 text-right font-mono font-bold border-r border-slate-700">
                                            {refVal !== 0 && (
                                                <div className="text-[9px] text-slate-400 mb-1 font-normal">
                                                    R: {fmt(refVal)}
                                                </div>
                                            )}
                                            <div className={val < 0 ? 'text-red-400' : 'text-green-400'}>
                                                {fmt(val)}
                                            </div>
                                        </td>
                                    )
                                })}
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
         )}
      </div>
    </div>
  );
};
