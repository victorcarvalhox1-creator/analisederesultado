
import { GoogleGenAI } from "@google/genai";
import { BrandingConfig, LegendItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeData = async (
  branding: BrandingConfig,
  legends: LegendItem[]
): Promise<string> => {
  try {
    // Summarize data differently to account for monthly trends
    // We will group by Group 3 and calculate monthly totals for context
    const summaryByG3: Record<string, Record<string, number>> = {};
    const months = new Set<string>();

    legends.forEach(item => {
      const g3 = item.grupo3 || 'OUTROS';
      if (!summaryByG3[g3]) summaryByG3[g3] = {};
      
      Object.entries(item.monthlyValues).forEach(([month, val]) => {
        months.add(month);
        summaryByG3[g3][month] = (summaryByG3[g3][month] || 0) + val;
      });
    });

    // Create a text summary of the trends
    const trendText = Object.entries(summaryByG3).map(([group, monthData]) => {
      const formattedMonths = Object.entries(monthData)
        .map(([m, v]) => `${m}: ${v.toFixed(0)}`)
        .join(', ');
      return `- GRUPO MACRO: ${group} | HISTÓRICO: [${formattedMonths}]`;
    }).join('\n');

    // Also include top specific line items (offenders/winners)
    const topItems = [...legends]
      .sort((a, b) => {
        const totalA = Object.values(a.monthlyValues).reduce((sum, v) => sum + v, 0);
        const totalB = Object.values(b.monthlyValues).reduce((sum, v) => sum + v, 0);
        return Math.abs(totalB) - Math.abs(totalA);
      })
      .slice(0, 5)
      .map(item => `${item.label} (${item.grupo3}): Total ${Object.values(item.monthlyValues).reduce((sum, v) => sum + v, 0).toFixed(0)}`)
      .join('; ');

    const prompt = `
      Atue como um CFO (Diretor Financeiro) experiente.
      Analise os dados financeiros da empresa "${branding.companyName}" estruturados como DRE.
      
      RESUMO DOS GRUPOS MACRO (Tendência Mensal):
      ${trendText}

      TOP 5 ITENS MAIS RELEVANTES (Valor Absoluto):
      ${topItems}
      
      Gere um relatório estratégico conciso:

      1. **Análise de Tendência (Trend Analysis)**
         - Como os resultados variaram mês a mês? Houve queda ou crescimento consistente?
         - Identifique sazonalidade ou anomalias nos meses informados.

      2. **Drivers de Resultado**
         - Comente sobre os principais ofensores de custo ou impulsionadores de receita listados.

      3. **Plano de Ação**
         - 3 ações corretivas diretas baseadas na tendência observada.

      Use Markdown. Seja direto, use negrito para valores e meses críticos.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Nenhuma análise gerada.";
  } catch (error) {
    console.error("Error generating analysis:", error);
    return "Ocorreu um erro ao gerar a análise. Verifique se há dados suficientes.";
  }
};
