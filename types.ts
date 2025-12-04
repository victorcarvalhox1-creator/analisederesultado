
export interface BrandingConfig {
  companyName: string;
  logoUrl: string | null;
  fontFamily: string;
  primaryColor: string;
  backgroundColor: string;
  accentColor: string;
}

export interface LegendItem {
  id: string;
  conta: string;      // e.g., 3.1.01.01.99.01
  label: string;      // DESCRIÇÃO e.g., CAMINHÕES
  codigo: string;     // CÓDIGO e.g., 159
  tipoConta: string;  // CONTAS e.g., Venda Bruta - Estoque
  grupo1: string;     // GRUPO 1 e.g., VENDAS BRUTAS
  grupo2: string;     // GRUPO 2 e.g., VENDAS LÍQUIDAS
  grupo3: string;     // GRUPO 3 e.g., LUCRO BRUTO
  
  // Realized Data
  monthlyValues: Record<string, number>; 
  breakdown?: Record<string, Record<string, Record<string, Record<string, number>>>>; // Company -> Year -> Sector -> Month -> Value
  
  // Planned/Budget Data
  monthlyPlanned?: Record<string, number>;
  breakdownPlanned?: Record<string, Record<string, Record<string, Record<string, number>>>>; // Company -> Year -> Sector -> Month -> Value
  
  // Percentage configs for variable costs
  breakdownPercentage?: Record<string, Record<string, Record<string, Record<string, string>>>>; // ... -> Month -> "5%"

  sectorValues?: Record<string, Record<string, number>>; // Deprecated
  
  // Transaction Drill-down
  transactions?: TransactionDetail[];
  
  description: string; 
  color: string;
}

export interface TransactionDetail {
  id: string;
  date: string; // YYYY-MM-DD or Display String
  history: string;
  value: number;
  company: string;
  sector: string;
  month: string;
  year: string;
}

export interface Department {
  id: string;
  codSetor: string;       // CÓD SETOR e.g., 100
  nomeSetor: string;      // DESCRIÇÃO SETOR e.g., VEICULOS NOVOS
  descricao: string;      // DESCRIÇÃO e.g., C & O
  ordem: number;          // ORDEM e.g., 1
}

export interface TransactionRow {
  empresa: string;
  contaContabil: string;
  data: string | number; // Excel date serial or string
  centroCusto: string;
  debito: number;
  credito: number;
  historico: string;
}

export type GroupOrder = Record<string, number>;

export interface AnalysisState {
  branding: BrandingConfig;
  legends: LegendItem[];
  departments: Department[];
  groupOrder: GroupOrder;
  aiAnalysis: string | null;
  isAnalyzing: boolean;
}

export type ViewMode = 'branding' | 'legends' | 'departments' | 'importer' | 'ordering' | 'dashboard' | 'budget';

export const FONT_OPTIONS = [
  { name: 'Modern Sans (Inter)', value: "'Inter', sans-serif" },
  { name: 'Clean (Lato)', value: "'Lato', sans-serif" },
  { name: 'Elegant (Playfair)', value: "'Playfair Display', serif" },
  { name: 'Technical (Roboto Mono)', value: "'Roboto Mono', monospace" },
  { name: 'Geometric (Montserrat)', value: "'Montserrat', sans-serif" },
  { name: 'Corporate (Open Sans)', value: "'Open Sans', sans-serif" },
  { name: 'Friendly (Poppins)', value: "'Poppins', sans-serif" },
  { name: 'Classic (Merriweather)', value: "'Merriweather', serif" },
];

export const BACKGROUND_OPTIONS = [
  { name: 'Clean White', value: '#ffffff' },
  { name: 'Soft Gray', value: '#f8fafc' },
  { name: 'Warm Paper', value: '#fdfbf7' },
  { name: 'Cool Slate', value: '#f1f5f9' },
  { name: 'Mint Cream', value: '#f0fdf4' },
  { name: 'Azure Mist', value: '#f0f9ff' },
  { name: 'Lavender Blush', value: '#fdf4ff' },
  { name: 'Dark Mode', value: '#0f172a' },
  { name: 'Midnight', value: '#1e293b' },
  { name: 'Deep Forest', value: '#064e3b' },
  { name: 'Navy Blue', value: '#1e3a8a' },
];
