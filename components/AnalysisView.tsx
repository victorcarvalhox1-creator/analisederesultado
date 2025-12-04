
import React, { useMemo, useState, useEffect } from 'react';
import { BrandingConfig, LegendItem, Department, GroupOrder } from '../types';
import { ChevronRight, ChevronDown, DollarSign, Calendar, Search, Sparkles, Filter, Percent, Building, CalendarClock, Target, Edit3, Layers } from 'lucide-react';
import { analyzeData } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface AnalysisViewProps {
  branding: BrandingConfig;
  items: LegendItem[];
  departments: Department[];
  aiAnalysis: string | null;
  onAnalysisUpdate: (analysis: string | null) => void;
  groupOrder?: GroupOrder;
  onBudgetUpdate?: (itemId: string, month: string, value: number, company?: string, year?: string) => void;
}

interface TreeNode {
  type: string;
  label: string;
  children: Record<string, TreeNode>;
  values: Record<string, number>;        // Realized
  plannedValues: Record<string, number>; // Budget/Planned
  id: string;
  conta?: string;
  isLeaf?: boolean;
  order: number; // For sorting
  hasFixedOrder?: boolean;
}

const MONTH_ORDER = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

// Definition of the Automatic Order from the provided image (Accounts)
const AUTOMATIC_ORDER_MAP: Record<string, number> = {
  "Venda Bruta - Estoque": 1, "Vendas - Balcão": 2, "Vendas - Oficina SG": 3, "Vendas - Oficina SC": 4, "Vendas - Acessórios": 5, "Outras Mercadorias": 6, "Combustíveis / Lubrif.": 7, "Garantia e Revisão": 8, "Vendas - Alliance": 9, "Mão de Obra Mecânica": 10, "Mão de Obra Funilaria": 11, "Mão de Obra Pintura": 12, "Mão de Obra Revisão": 13, "Mão de Obra Garantia": 14, "Mão de Obra Serv. Rápido": 15, "Lavagem e Lubrificação": 16, "Mão de Obra Terceiros": 17, "Outras Vendas": 18, "(-) Devoluções das Vendas": 19, "Impostos s/ Vendas": 20, "Custos das Vendas - Veículos": 21, "Custos com Acessórios Incluídos na NF do Veículo": 22, "Custo com Outros Incluídos na NF do Veículo": 23, "Custo - Balcão": 24, "Custo - Oficina SG": 25, "Custo - Oficina SC": 26, "Custo - Acessórios": 27, "Outras Mercadorias (Custo)": 28, "Custo Vendas - Combustíveis / Lubrif.": 29, "Custo Vendas - Garantia e Revisão": 30, "Lubrificantes - SG": 31, "(-) Custos das Devoluções Vendas Balcão": 32, "(-) Custos das Devoluções Vendas SG": 33, "Custos - Mão de Obra Mecânica": 34, "Custos - Mão de Obra Funilaria": 35, "Custos - Mão de Obra Pintura": 36, "Custos - Mão de Obra Revisão": 37, "Custos - Mão de Obra Serv. Rápido": 38, "Custos - Lavagem e Lubrificação": 39, "Custos - Serviços de Terceiros": 40, "Custos - Encargos e Provisões de Férias e 13º Salário dos Produtivos": 41, "Bônus - Vendas do Estoque": 42, "Impostos sobre Bônus acima": 43, "Bônus Localização - Fundo Estrela": 44, "Comissão Fadireto": 45, "Bônus StarClass": 46, "Outros Bônus/Comissões": 47, "(-) Deduções s/ Bonus e comissões": 48, "(-) Estorno de Comissões e Bonificações": 49, "Retorno Financiamentos": 50, "Comissão Consórcio": 51, "Verbas de Bancos": 52, "Receita de Despachante": 53, "Receita de Seguros": 54, "Contribuição Montadora": 55, "Bônus de Performance": 56, "Bônus Complementar": 57, "Valores Recuperados - Mídia": 58, "Valores Recuperados - Fretes": 59, "Valores Recuperados - Incobráveis": 60, "Valores Recuperados - Juros s/ Venda Direta": 61, "Valores Recuperados - Bônus": 62, "Transferências Internas": 63, "Bônus de Usados": 64, "Valores Recuperados": 65, "Outras Comissões": 66, "Outras Rendas": 67, "Outras Rendas 2": 68, "(-) Impostos s/ Receitas Acima": 69, "PLUS Antecipado": 70, "Bônus Incentivos - Atingimento de Metas": 71, "Outras Comissões (Banco de Couro e Consórcio)": 72, "Ganho ou Perda na Alienação do Ativo Permanente": 73, "Outras Receitas - Outros Departamentos": 74, "Recuperação Propaganda": 75, "Outras Rendas/Recuperações - S / tributos": 76, "Recuperação/Perda de Garantia": 77, "(-) Cancelamentos": 78, "(-) Impostos s/ Receitas": 79, "Rendimento do Hold Back": 80, "Rendimento Fundo Capitalização": 81, "Rendimento de Aplicação Financeira": 82, "Juros Recebidos": 83, "Desconto / Bônus Obtido na Antecipação de Rotativos": 84, "Outras Rendas Financeiras": 85, "Variação Monetária Ativa": 86, "(-) Impostos s/ Receitas Financeiras": 87, "Venda Imobilizado": 88, "Impostos Recuperados": 89, "Aluguel de Espaço": 90, "Receitas de Dividendos Consórcio": 91, "Outras Rendas não operacionais": 92, "Recompra": 93, "(-) Impostos s/ Receitas Não Operacionais": 94, "Salários - Folha de Pagto.": 95, "Estagiário / Temporário": 96, "Pro-Labore": 97, "DSR": 98, "Horas Extras": 99, "Gratificações": 100, "Encargos": 101, "F.G.T.S. - Recolhido": 102, "F.G.T.S. 40% Multa Recisão": 103, "Férias - Provisão + Enc": 104, "13º Salário - Provisão + Enc": 105, "I.N.S.S.": 106, "I.N.S.S. - Prolabore": 107, "Abono Pecuniário": 108, "Férias / 13 Salário Indenizado": 109, "Insalubridade": 110, "Indenizações Trabalhistas / Acordos trabalhistas": 111, "Adicional Noturno": 112, "Aviso Prévio": 113, "Repouso Remunerado": 114, "Outras despesas com pessoal": 115, "Vale Transporte": 116, "Alimentação e refeição": 117, "Cursos / Formação Profissional": 118, "Participação Lucro (14°)": 119, "Gastos c/ Pessoal": 120, "Salário Educação": 121, "Assistência Médica e Odontológica": 122, "Fardamento e EPI": 123, "Serviços de Terceiros": 124, "INSS sobre Prestação de Serviço Terceiros": 125, "Serviços de Assistência Jurídica": 126, "Serviços de Contabilidade": 127, "Consultoria/Auditoria": 128, "Internet": 129, "Vigilância": 130, "Limpeza": 131, "Processamento de Dados": 132, "Aluguéis": 133, "Leasing": 134, "IPTU": 135, "Amortizações / Depreciações": 136, "Água, Esgoto e Energia Elétrica": 137, "Copa e Bar": 138, "Bens de Natureza Permanente": 139, "Cortesias / Brindes e Bonificações": 140,
  "Condução, Pedágio e Estacionamento": 141, "Combustível / Lubrificante operação": 142, "Donativos e Contribuições": 143, "Associações de Classe": 144, "Multas": 145, "Despesas Judiciais e Legais": 146, "Impostos e Taxas Diversas": 147, "Despesas Telecomunicação": 148, "Locações de Máquinas e Equipamentos": 149, "Locação de Veículos": 150, "Manutenção de Máquinas e Equipamentos": 151, "Cons Manut Prédios e Benfeitorias": 152, "Cons Manut Maq, móveis e utensílios": 153, "Manutenção e reparo comp., sistemas e Software": 154, "Manut Veículos de uso": 155, "Impresso / Material de escritório": 156, "Malotes, Despachos, Cartas e Telegramas": 157, "Despesas com cópias": 158, "Despesas com Cartório": 159, "Materiais de consumo": 160, "Materiais de Limpeza": 161, "Materiais de Informática": 162, "Ferramentas, materiais e serviços": 163, "Eventos": 164, "Seguros": 165, "Garantias Recusadas": 166, "Licenciamento de veículos": 167, "Despesas bancárias e de cobrança": 168, "Fretes e carretos operacionais": 169, "Viagens e Representações": 170, "Despesas Indedutíveis": 171, "Outras Despesas": 172, "Despesas com Propaganda e Promoção de Vendas": 173, "Comissões a Empregados": 174, "Encargos INSS": 175, "Encargos FGTS": 176, "Lavagem": 177, "Despesas com Emplacamento": 178, "Taxa Cartão de Crédito": 179, "Despachante": 180, "Cortesias / Brindes": 181, "Combustível / Lubrificante": 182, "Fretes e carretos": 183, "Contrato de Manutenção": 184, "Despesas com Acessórios": 185, "Despesas com Vendas - Materiais Promocionais, Pinturas etc.": 186, "Revisão de entregas": 187, "Fretes / Guincho": 188, "IPVAs": 189, "Outras despesas de vendas": 190, "Juros - Passivos": 191, "Juros - Empréstimos Bancários": 192, "Juros - Estoque Financiado (Rotativo)": 193, "Juros - Conta Garantida": 194, "Juros - Refis": 195, "Juros - Titulos Negociados": 196, "Juros - Cheques Negociados": 197, "Juros - Financiamento de Test Drive": 198, "I.O.F. / I.O.C.": 199, "Despesas Adm. - Fundo de Capitalização": 200, "Despesa Bancária": 201, "Despesa Carta de Fiança": 202, "Descontos Concedidos": 203, "Despesa com Perda Op. Crédito": 204, "Despesas com Cartão de Crédito": 205, "Despesas com Antecipação de Cartão de Crédito": 206, "Variação Monetária Passiva": 207, "Custo da Venda do Imobilizado": 208, "Reformas e benfeitorias de imóveis": 209, "Depreciação Best Drive": 210, "Depreciação - Outros": 211, "Indenizações Trabalhistas de Processos Antigos": 212, "Juros - Capital Próprio": 213, "Outras Despesas não Operacionais": 214, "Fracionamento de Preços": 215,
};

// PRESET GROUP ORDER based on the Image Structure (Group 3 > 2 > 1)
const PRESET_GROUP_ORDER: Record<string, number> = {
  // GRUPO 3 (High Level)
  "LUCRO BRUTO": 10,
  "DESPESAS OPERACIONAIS": 20,
  "FINANCEIRO E NÃO OPERACIONAL": 30,

  // GRUPO 2
  "VENDAS LÍQUIDAS": 10,
  "VENDAS LIQUIDAS": 10,
  "CUSTOS": 20,
  "DESPESAS VARIÁVEIS": 30,
  "DESPESAS VARIAVEIS": 30,
  "DESPESAS FIXAS": 40,
  "RESULTADO FINANCEIRO": 50,
  "RESULTADO NÃO OPERACIONAL": 60,
  "RESULTADO NAO OPERACIONAL": 60,

  // GRUPO 1
  "VENDAS BRUTAS": 100,
  "RECEITAS OPERACIONAIS": 110,
  "BÔNUS E COMISSÕES": 120,
  "BONUS E COMISSOES": 120,
  "DEDUÇÕES": 130,
  "DEDUCOES": 130,
  // CUSTOS G1 will naturally sort inside CUSTOS G2
  "COMISSÕES A EMPREGADOS": 200,
  "DESPESAS COM VENDAS": 210,
  "DESPESAS DE PROPAGANDA": 220,
  "DESP COM FUNCIONAMENTO": 300,
  "DESPESA COM PESSOAL": 310,
  "DESPESA COM BENEFÍCIOS": 320,
  "SERVIÇOS DE TERCEIROS": 330,
  "SERVICOS DE TERCEIROS": 330,
  "DESP COM OCUPAÇÃO": 340,
  "DESPESA COM OCUPAÇÃO": 340,
  "RECEITAS FINANCEIRAS": 400,
  "DESPESAS FINANCEIRAS": 410,
  "RECEITAS NÃO OPERACIONAIS": 500,
  "DESPESAS NÃO OPERACIONAIS": 510
};

export const AnalysisView: React.FC<AnalysisViewProps> = ({ branding, items, departments, aiAnalysis, onAnalysisUpdate, groupOrder = {}, onBudgetUpdate }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedLegend, setSelectedLegend] = useState<string>(''); 
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  
  const [showAV, setShowAV] = useState(false);
  const [showBudget, setShowBudget] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);

  const availableMonths = useMemo(() => {
    if (selectedYear || isEditingBudget) return MONTH_ORDER;

    const months = new Set<string>();
    items.forEach(item => {
      Object.keys(item.monthlyValues).forEach(m => months.add(m));
      if (item.monthlyPlanned) Object.keys(item.monthlyPlanned).forEach(m => months.add(m));
    });
    
    return Array.from(months).sort((a, b) => {
      const idxA = MONTH_ORDER.indexOf(a.toLowerCase());
      const idxB = MONTH_ORDER.indexOf(b.toLowerCase());
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      return a.localeCompare(b);
    });
  }, [items, selectedYear, isEditingBudget]);

  const { availableCompanies, availableYears } = useMemo(() => {
    const companies = new Set<string>();
    const years = new Set<string>();

    items.forEach(item => {
      if (item.breakdown) {
        Object.keys(item.breakdown).forEach(c => {
            companies.add(c);
            const yearMap = item.breakdown![c];
            if (yearMap) Object.keys(yearMap).forEach(y => years.add(y));
        });
      }
      if (item.breakdownPlanned) {
        Object.keys(item.breakdownPlanned).forEach(c => {
            companies.add(c);
            const yearMap = item.breakdownPlanned![c];
            if (yearMap) Object.keys(yearMap).forEach(y => years.add(y));
        });
      }
    });

    return {
        availableCompanies: Array.from(companies).sort(),
        availableYears: Array.from(years).sort().reverse()
    };
  }, [items]);

  useEffect(() => {
    if (availableYears.length > 0 && !selectedYear) {
        setSelectedYear(availableYears[0]);
    }
  }, [availableYears]);

  const uniqueLegends = useMemo(() => {
    const groups = new Map<string, { label: string, order: number, sectorKeys: Set<string> }>();
    
    departments.forEach(d => {
      const label = d.descricao || d.nomeSetor || 'Outros'; 
      if (!groups.has(label)) {
        groups.set(label, { label, order: d.ordem || 999, sectorKeys: new Set() });
      }
      const g = groups.get(label)!;
      if (d.nomeSetor) g.sectorKeys.add(d.nomeSetor);
      if (d.codSetor) g.sectorKeys.add(d.codSetor);
      g.sectorKeys.add(label);
      if ((d.ordem || 999) < g.order) g.order = d.ordem || 999;
    });

    return Array.from(groups.values()).sort((a, b) => a.order - b.order);
  }, [departments]);

  const getEffectiveValues = (item: LegendItem, type: 'realized' | 'planned'): Record<string, number> => {
    const breakdownSource = type === 'realized' ? item.breakdown : item.breakdownPlanned;
    const flatSource = type === 'realized' ? item.monthlyValues : item.monthlyPlanned;

    if (!breakdownSource) {
       if (!selectedCompany && !selectedLegend && !selectedYear) return flatSource || {};
       if (type === 'planned' && flatSource) return flatSource; 
       return {}; 
    }

    const result: Record<string, number> = {};
    const companiesToInclude = selectedCompany ? [selectedCompany] : Object.keys(breakdownSource);
    const legendGroup = selectedLegend ? uniqueLegends.find(l => l.label === selectedLegend) : null;
    const yearsToInclude = selectedYear ? [selectedYear] : availableYears; 

    companiesToInclude.forEach(companyKey => {
       const yearMap = breakdownSource[companyKey];
       if (!yearMap) return;

       yearsToInclude.forEach(yearKey => {
          const sectorMap = yearMap[yearKey];
          if (!sectorMap) return;

          Object.keys(sectorMap).forEach(sectorKey => {
            if (legendGroup) {
                if (!legendGroup.sectorKeys.has(sectorKey)) return;
            }
            const values = sectorMap[sectorKey];
            Object.entries(values).forEach(([month, val]) => {
                result[month] = (result[month] || 0) + val;
            });
          });
       });
    });

    return result;
  };

  function accumulateValues(target: TreeNode, sourceRealized: Record<string, number>, sourcePlanned: Record<string, number>, childOrder?: number) {
    Object.entries(sourceRealized).forEach(([month, val]) => {
      target.values[month] = (target.values[month] || 0) + val;
    });
    Object.entries(sourcePlanned).forEach(([month, val]) => {
      target.plannedValues[month] = (target.plannedValues[month] || 0) + val;
    });

    // Bubble up order logic: 
    // Only apply child order if the target does NOT have a fixed preset order
    if (childOrder !== undefined && !target.hasFixedOrder) {
      if (childOrder < target.order) {
        target.order = childOrder;
      }
    }
  }

  const getPresetOrder = (label: string): number => {
      const upper = label.trim().toUpperCase();
      if (PRESET_GROUP_ORDER[upper]) return PRESET_GROUP_ORDER[upper];
      return 999999;
  };

  const getLeafOrder = (label: string): number => {
     if (AUTOMATIC_ORDER_MAP[label.trim()]) return AUTOMATIC_ORDER_MAP[label.trim()];
     return 999999;
  }

  const treeData = useMemo<TreeNode[]>(() => {
    const root: Record<string, TreeNode> = {};

    items.forEach(item => {
      if (!item.grupo3) return; 
      
      const effectiveRealized = getEffectiveValues(item, 'realized');
      const effectivePlanned = getEffectiveValues(item, 'planned');
      
      const hasValues = Object.keys(effectiveRealized).length > 0 || Object.keys(effectivePlanned).length > 0;
      if (!hasValues && !isEditingBudget) return;

      const createNode = (id: string, label: string, type: string, conta?: string, isLeaf?: boolean): TreeNode => {
          const preset = !isLeaf ? getPresetOrder(label) : 999999;
          return {
            id, label, type, conta, isLeaf, children: {}, values: {}, plannedValues: {}, 
            order: preset !== 999999 ? preset : 999999,
            hasFixedOrder: preset !== 999999
          };
      };

      // Level 1: Grupo 3
      if (!root[item.grupo3]) {
        root[item.grupo3] = createNode(`g3-${item.grupo3}`, item.grupo3, 'G3');
      }
      const g3Node = root[item.grupo3];
      
      // Level 2: Grupo 2
      const g2Key = item.grupo2 || 'OUTROS';
      if (!g3Node.children[g2Key]) {
        g3Node.children[g2Key] = createNode(`g2-${item.grupo3}-${g2Key}`, g2Key, 'G2');
      }
      const g2Node = g3Node.children[g2Key];

      // Level 3: Grupo 1
      const g1Key = item.grupo1 || 'GERAL';
      if (!g2Node.children[g1Key]) {
         g2Node.children[g1Key] = createNode(`g1-${item.grupo3}-${g2Key}-${g1Key}`, g1Key, 'G1');
      }
      const g1Node = g2Node.children[g1Key];

      // Level 4: Tipo Conta
      const typeKey = item.tipoConta || 'PADRÃO';
      if (!g1Node.children[typeKey]) {
         g1Node.children[typeKey] = createNode(`tp-${item.id}-${typeKey}`, typeKey, 'TYPE');
         // Check if Type itself has a preset (unlikely for Types, but safe check)
         const typeOrder = getLeafOrder(typeKey);
         if (typeOrder !== 999999) {
             g1Node.children[typeKey].order = typeOrder;
             g1Node.children[typeKey].hasFixedOrder = true;
         }
      }
      const typeNode = g1Node.children[typeKey];

      // Level 5: Item (Leaf)
      const itemKey = item.id;
      const leafOrder = getLeafOrder(item.label) !== 999999 ? getLeafOrder(item.label) : (getLeafOrder(item.tipoConta) !== 999999 ? getLeafOrder(item.tipoConta) : 999999);
      
      typeNode.children[itemKey] = { 
        type: 'ITEM', 
        label: item.label, 
        conta: item.conta, 
        values: effectiveRealized, 
        plannedValues: effectivePlanned,
        id: item.id,
        isLeaf: true,
        children: {},
        order: leafOrder,
        hasFixedOrder: true
      };

      accumulateValues(typeNode, effectiveRealized, effectivePlanned, leafOrder);
      accumulateValues(g1Node, effectiveRealized, effectivePlanned, typeNode.order);
      accumulateValues(g2Node, effectiveRealized, effectivePlanned, g1Node.order);
      accumulateValues(g3Node, effectiveRealized, effectivePlanned, g2Node.order);

      if (item.transactions && item.transactions.length > 0) {
         const filteredTrans = item.transactions.filter(t => {
            const matchCompany = !selectedCompany || t.company === selectedCompany;
            const matchYear = !selectedYear || t.year == selectedYear; 
            let matchSector = true;
            if (selectedLegend) {
               const legendGroup = uniqueLegends.find(l => l.label === selectedLegend);
               matchSector = legendGroup ? legendGroup.sectorKeys.has(t.sector) : false;
            }
            return matchCompany && matchYear && matchSector;
         });

         const historyGroups: Record<string, Record<string, number>> = {};
         filteredTrans.forEach(t => {
            if(!historyGroups[t.history]) historyGroups[t.history] = {};
            const mLower = t.month.toLowerCase();
            historyGroups[t.history][mLower] = (historyGroups[t.history][mLower] || 0) + t.value;
         });

         const leafNode = typeNode.children[itemKey];
         Object.entries(historyGroups).forEach(([histText, vals], idx) => {
            leafNode.children[`hist-${item.id}-${idx}`] = {
               type: 'HISTORY',
               label: histText,
               id: `hist-${item.id}-${idx}`,
               values: vals,
               plannedValues: {}, 
               isLeaf: true,
               children: {},
               order: idx
            }
         });
      }
    });

    return Object.values(root).sort((a, b) => {
      // 1. Automatic/Preset Order
      if (a.order !== 999999 || b.order !== 999999) {
          return a.order - b.order;
      }

      // 2. Manual User Group Order
      const orderA = groupOrder[a.label] ?? 9999;
      const orderB = groupOrder[b.label] ?? 9999;
      if (orderA !== orderB) return orderA - orderB;
      
      // 3. Alphabetical
      return a.label.localeCompare(b.label);
    }); 
  }, [items, selectedLegend, selectedCompany, selectedYear, uniqueLegends, groupOrder, isEditingBudget]);

  const avBaseValues = useMemo<Record<string, number>>(() => {
     if (!showAV) return {};
     const findCandidate = (nodes: TreeNode[]): Record<string, number> | null => {
        for (const node of nodes) {
            const label = node.label.toUpperCase();
            if (label.includes('VENDAS LÍQUIDAS') || label.includes('RECEITA LÍQUIDA') || label.includes('VENDAS LIQUIDAS')) {
                return node.values;
            }
        }
        for (const node of nodes) {
             if (node.children && Object.keys(node.children).length > 0) {
                 const found = findCandidate(Object.values(node.children));
                 if (found) return found;
             }
        }
        return null;
     };
     const match = findCandidate(treeData);
     if (match) return match;

     const findFallback = (nodes: TreeNode[]): Record<string, number> | null => {
         for (const node of nodes) {
            const label = node.label.toUpperCase();
            if (label.includes('VENDAS BRUTAS') || label.includes('RECEITA BRUTA')) {
                return node.values;
            }
         }
         for (const node of nodes) {
             if (node.children && Object.keys(node.children).length > 0) {
                 const found = findFallback(Object.values(node.children));
                 if (found) return found;
             }
        }
        return null;
     }
     return findFallback(treeData) || {};
  }, [treeData, showAV]);


  const netResult = useMemo<{ realized: Record<string, number>, planned: Record<string, number> }>(() => {
    const totalsRealized: Record<string, number> = {};
    const totalsPlanned: Record<string, number> = {};
    treeData.forEach((node) => {
       Object.entries(node.values).forEach(([month, val]) => {
          totalsRealized[month] = (totalsRealized[month] || 0) + (Number(val) || 0);
       });
       Object.entries(node.plannedValues).forEach(([month, val]) => {
          totalsPlanned[month] = (totalsPlanned[month] || 0) + (Number(val) || 0);
       });
    });
    return { realized: totalsRealized, planned: totalsPlanned };
  }, [treeData]);

  const netResultTotalRealized = Object.values(netResult.realized).reduce<number>((acc, curr) => acc + (Number(curr) || 0), 0);
  const netResultTotalPlanned = Object.values(netResult.planned).reduce<number>((acc, curr) => acc + (Number(curr) || 0), 0);
  const totalBaseValue = Object.values(avBaseValues).reduce<number>((acc, curr) => acc + (Number(curr) || 0), 0);

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedNodes);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedNodes(newSet);
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeData(branding, items);
    onAnalysisUpdate(result);
    setIsAnalyzing(false);
  };

  const handleInputChange = (nodeId: string, month: string, newVal: string) => {
      if (onBudgetUpdate) {
          const val = parseFloat(newVal) || 0;
          onBudgetUpdate(nodeId, month, val, selectedCompany, selectedYear);
      }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
  };

  const formatPercent = (val: number, base: number) => {
      if (!base || base === 0) return '0%';
      const pct = (val / base) * 100;
      return `${pct.toFixed(1)}%`;
  };

  const getRowTotal = (values: Record<string, number>): number => {
    return Object.values(values).reduce<number>((acc, curr) => acc + (Number(curr) || 0), 0);
  };

  const colWidth = showBudget ? '190px' : '110px';
  const gridTemplateColumns = `350px repeat(${availableMonths.length}, minmax(${colWidth}, 1fr)) 160px`;

  const renderRow = (node: TreeNode, level: number) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = (!node.isLeaf && Object.keys(node.children).length > 0) || (node.isLeaf && Object.keys(node.children).length > 0);
    const paddingLeft = level * 24 + 12;
    
    const sortedChildren = hasChildren 
      ? Object.values(node.children).sort((a, b) => {
          if (a.order !== 999999 || b.order !== 999999) {
             return a.order - b.order;
          }
          const orderA = groupOrder[a.label] ?? 9999;
          const orderB = groupOrder[b.label] ?? 9999;
          if (orderA !== orderB) return orderA - orderB;
          if (a.conta && b.conta) return a.conta.localeCompare(b.conta);
          return a.label.localeCompare(b.label);
        })
      : [];
    
    let bgClass = 'bg-white';
    let textClass = 'text-slate-600 font-normal';
    if (level === 0) { bgClass = 'bg-slate-100 border-t border-slate-300'; textClass = 'font-bold text-slate-900 uppercase'; }
    else if (level === 1) { bgClass = 'bg-slate-50'; textClass = 'font-bold text-slate-800'; }
    else if (level === 2) { textClass = 'font-semibold text-slate-700'; }
    else if (node.type === 'HISTORY') { textClass = 'text-xs text-slate-500 italic'; bgClass = 'bg-yellow-50/30'; }

    const rowTotalRealized = getRowTotal(node.values);
    const rowTotalPlanned = getRowTotal(node.plannedValues);

    return (
      <React.Fragment key={node.id}>
        <div 
          className={`grid border-b border-slate-100 hover:bg-blue-50/30 transition-colors ${bgClass}`}
          style={{ gridTemplateColumns, width: 'max-content', minWidth: '100%' }}
        >
          <div 
            className={`p-2 flex items-center gap-2 ${textClass} sticky left-0 z-30 ${bgClass} border-r border-slate-200/50 shadow-[2px_0_5px_rgba(0,0,0,0.02)]`} 
            style={{ paddingLeft: `${paddingLeft}px` }}
          >
            {hasChildren && node.type !== 'HISTORY' && (
              <button onClick={() => toggleExpand(node.id)} className="p-0.5 rounded hover:bg-slate-200 text-slate-500">
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            )}
            {!hasChildren && node.type !== 'HISTORY' && <span className="w-5" />}
            <span className="truncate" title={node.label}>
              {(node.isLeaf && node.type !== 'HISTORY') && <span className="text-slate-400 font-mono text-xs mr-2">{node.conta}</span>}
              {node.label}
            </span>
          </div>

          {availableMonths.map(month => {
            const val = node.values[month] || 0;
            const planned = node.plannedValues[month] || 0;
            const base = avBaseValues[month] || 0;
            
            return (
              <div key={month} className={`p-2 text-right border-l border-slate-100 flex flex-col justify-center ${textClass} text-sm h-full`}>
                <div className="flex justify-end gap-3 items-center h-6">
                   <span className={val < 0 ? 'text-red-600' : ''}>{val !== 0 ? formatCurrency(val) : '-'}</span>
                   {showBudget && (
                       node.isLeaf && isEditingBudget ? (
                          <input 
                             type="number"
                             placeholder="0"
                             value={planned || ''}
                             onFocus={(e) => e.target.select()}
                             onChange={(e) => handleInputChange(node.id, month, e.target.value)}
                             className="w-20 text-right text-[12px] px-2 py-1 border border-indigo-300 rounded bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none text-indigo-700 font-semibold"
                          />
                       ) : (
                          <span className="text-[10px] text-slate-400 font-mono w-20 truncate" title="Orçamento">
                             {planned !== 0 ? formatCurrency(planned) : '-'}
                          </span>
                       )
                   )}
                </div>
                {showAV && (
                   <span className="text-[10px] text-slate-400 font-mono mt-1">{formatPercent(val, base)}</span>
                )}
              </div>
            );
          })}

          <div className={`p-2 text-right border-l border-slate-200 font-bold ${level === 0 ? 'text-black' : 'text-slate-700'} text-sm flex flex-col justify-center`}>
             <div className="flex justify-end gap-3 items-baseline">
                 <span className={rowTotalRealized < 0 ? 'text-red-600' : ''}>{formatCurrency(rowTotalRealized)}</span>
                 {showBudget && (
                   <span className="text-[10px] text-slate-400 font-mono w-20">{formatCurrency(rowTotalPlanned)}</span>
                 )}
             </div>
             {showAV && (
               <span className="text-[10px] text-slate-500 font-mono">{formatPercent(rowTotalRealized, totalBaseValue)}</span>
             )}
          </div>
        </div>
        {isExpanded && sortedChildren.map((child) => renderRow(child, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-100" style={{ fontFamily: branding.fontFamily }}>
      <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm flex-shrink-0">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-6">
            {branding.logoUrl && (
              <img src={branding.logoUrl} alt="Logo" className="h-16 w-auto object-contain" />
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {branding.companyName || 'Análise de Resultado'}
              </h1>
              <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4" /> 
                {selectedYear ? `Exercício ${selectedYear}` : 'Exercício Consolidado'}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3">
             <div className="flex gap-3">
                 <button
                    onClick={() => {
                        setShowBudget(!showBudget);
                        if(showBudget) setIsEditingBudget(false);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                       showBudget 
                       ? 'bg-orange-50 border-orange-200 text-orange-700' 
                       : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                 >
                    <Target className="w-4 h-4" />
                    Comparar Orçamento
                 </button>

                 {showBudget && (
                    <button
                        onClick={() => setIsEditingBudget(!isEditingBudget)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        isEditingBudget
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <Edit3 className="w-4 h-4" />
                        {isEditingBudget ? 'Modo de Edição Ativo' : 'Editar Valores'}
                    </button>
                 )}

                 <button
                    onClick={() => setShowAV(!showAV)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                       showAV 
                       ? 'bg-blue-50 border-blue-200 text-blue-700' 
                       : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                 >
                    <Percent className="w-4 h-4" />
                    Análise Vertical
                 </button>

                 <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <CalendarClock className="w-4 h-4 text-slate-400" />
                    </div>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="pl-9 pr-8 py-2 bg-slate-800 text-white border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer w-32 font-medium"
                    >
                        <option value="">Ano</option>
                        {availableYears.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                     <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                 </div>

                 <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Building className="w-4 h-4 text-slate-400" />
                    </div>
                    <select
                        value={selectedCompany}
                        onChange={(e) => setSelectedCompany(e.target.value)}
                        className="pl-9 pr-8 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer w-48 font-medium text-slate-700 truncate"
                    >
                        <option value="">Todas Empresas</option>
                        {availableCompanies.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                     <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                 </div>

                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Filtrar contas..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 outline-none w-48 transition-all"
                    />
                 </div>
             </div>

             <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || items.length === 0}
              className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              {isAnalyzing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {aiAnalysis ? 'Atualizar Análise IA' : 'Gerar Análise IA'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Department Tabs Bar */}
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
               Visão Consolidada
            </button>
            {uniqueLegends.map(l => (
               <button
                  key={l.label}
                  onClick={() => setSelectedLegend(l.label)}
                  className={`py-4 text-sm font-medium border-b-2 transition-all ${
                      selectedLegend === l.label
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-200'
                  }`}
               >
                  {l.label}
               </button>
            ))}
         </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row p-6 gap-6">
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto">
              <div className="inline-block min-w-full align-middle">
                 <div 
                  className="grid bg-slate-800 text-white text-sm font-bold uppercase tracking-wider sticky top-0 z-40 shadow-md"
                  style={{ gridTemplateColumns, width: 'max-content', minWidth: '100%' }}
                >
                  <div className="p-4 sticky left-0 z-50 bg-slate-800 border-r border-slate-700 shadow-[2px_0_5px_rgba(0,0,0,0.1)] flex items-center">
                      Contas / Descrição
                  </div>
                  {availableMonths.map(m => (
                    <div key={m} className="p-4 text-right border-l border-slate-700">
                        <div className="capitalize">{m}</div>
                        {showBudget && (
                           <div className="flex justify-end gap-3 text-[10px] text-slate-400 mt-1 normal-case font-normal items-center">
                              <span>Real.</span>
                              <span className="w-20 text-center text-white/90 font-bold">Plan.</span>
                           </div>
                        )}
                        {showAV && !showBudget && <div className="text-[9px] text-slate-400 normal-case mt-1">% AV</div>}
                    </div>
                  ))}
                  <div className="p-4 text-right border-l border-slate-700 bg-slate-900 sticky right-0 flex flex-col justify-center">
                      <span>Total</span>
                      {showBudget && (
                         <div className="flex justify-end gap-3 text-[10px] text-slate-400 mt-1 normal-case font-normal">
                            <span>Real.</span>
                            <span className="w-20 text-center">Plan.</span>
                         </div>
                      )}
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {items.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                      Nenhum dado disponível. Vá em "Importar Base" ou "Dados DRE".
                    </div>
                  ) : (
                    <>
                      {treeData.map((node) => renderRow(node, 0))}
                      
                      <div 
                        className="grid bg-slate-900 text-white border-t-4 border-double border-slate-600 hover:bg-slate-800 transition-colors sticky bottom-0 z-40 shadow-[0_-2px_5px_rgba(0,0,0,0.1)]"
                        style={{ gridTemplateColumns, width: 'max-content', minWidth: '100%' }}
                      >
                          <div className="p-4 font-bold uppercase tracking-wider text-sm flex items-center gap-2 sticky left-0 z-50 bg-slate-900 border-r border-slate-700 shadow-[2px_0_5px_rgba(0,0,0,0.1)]">
                              <div className="p-1 bg-white/10 rounded"><DollarSign className="w-4 h-4" /></div>
                              LUCRO LÍQUIDO / RESULTADO
                          </div>
                          {availableMonths.map(month => {
                              const val = Number(netResult.realized[month]) || 0;
                              const planned = Number(netResult.planned[month]) || 0;
                              const base = Number(avBaseValues[month]) || 0;
                              return (
                                <div key={month} className={`p-4 text-right flex flex-col justify-center font-bold font-mono text-sm border-l border-slate-700`}>
                                  <div className="flex justify-end gap-3 items-baseline">
                                    <span className={val < 0 ? 'text-red-400' : 'text-green-400'}>{formatCurrency(val)}</span>
                                    {showBudget && (
                                       <span className="text-[10px] text-slate-500 w-20">{formatCurrency(planned)}</span>
                                    )}
                                  </div>
                                  {showAV && <span className="text-[10px] text-slate-400">{formatPercent(val, base)}</span>}
                                </div>
                              );
                            })}
                            <div className={`p-4 text-right flex flex-col justify-center font-bold font-mono text-sm border-l border-slate-700`}>
                                <div className="flex justify-end gap-3 items-baseline">
                                   <span className={netResultTotalRealized < 0 ? 'text-red-400' : 'text-yellow-400'}>{formatCurrency(netResultTotalRealized)}</span>
                                   {showBudget && (
                                      <span className="text-[10px] text-slate-500 w-20">{formatCurrency(netResultTotalPlanned)}</span>
                                   )}
                                </div>
                                {showAV && <span className="text-[10px] text-slate-500 font-mono">{formatPercent(netResultTotalRealized, totalBaseValue)}</span>}
                            </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
        </div>

        {aiAnalysis && (
          <div className="w-full lg:w-[400px] bg-white border border-slate-200 rounded-xl flex flex-col shadow-xl animate-slide-in-right overflow-hidden flex-shrink-0">
            <div className="p-6 bg-purple-50 border-b border-purple-100 flex justify-between items-center">
               <h3 className="font-bold text-purple-900 flex items-center gap-2">
                 <Sparkles className="w-5 h-5 text-purple-600" />
                 Insights Estratégicos
               </h3>
               <button onClick={() => onAnalysisUpdate(null)} className="text-purple-400 hover:text-purple-700">
                 ✕
               </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 prose prose-sm prose-purple max-w-none">
              <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
