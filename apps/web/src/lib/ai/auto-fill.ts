'use client';

import { extractTextFromFile, uploadAndExtract, type ExtractedText } from './extractor';

export interface AutoFillResult {
  name: string;
  description: string;
  documentType: string;
  department: string;
  fiscalYear: string;
  isConfidential: boolean;
}

function inferFromText(text: string, fileName: string): AutoFillResult {
  const lower = text.toLowerCase();
  const nameLower = fileName.toLowerCase();

  let documentType = 'Other';
  if (/budget|financial|cost|expense|revenue/i.test(lower)) documentType = 'Budget';
  else if (/policy|procedure|guideline|regulation/i.test(lower)) documentType = 'Policy';
  else if (/memo|notice|circular|notification/i.test(lower)) documentType = 'Memo';
  else if (/report|summary|analysis|review/i.test(lower)) documentType = 'Report';
  else if (/invoice|bill|payment|receipt/i.test(lower)) documentType = 'Invoice';
  else if (/contract|agreement|mou|sla/i.test(lower)) documentType = 'Contract';
  else if (/hr|employee|staff|recruitment|payroll/i.test(lower)) documentType = 'HR';
  else if (/technical|spec|architecture|design|api/i.test(lower)) documentType = 'Technical';

  let department = 'General';
  if (/finance|account|treasury|audit/i.test(lower)) department = 'Finance';
  else if (/hr|human.resource|personnel|staffing/i.test(lower)) department = 'HR';
  else if (/it|technology|software|technical|engineering|digital/i.test(lower)) department = 'IT';
  else if (/marketing|sales|commercial|advertising/i.test(lower)) department = 'Marketing';
  else if (/legal|compliance|regulatory/i.test(lower)) department = 'Legal';
  else if (/operation|logistics|supply.chain/i.test(lower)) department = 'Operations';

  const yearMatch = text.match(/\b(20\d{2})\b/);
  const fiscalYear = yearMatch ? yearMatch[1] : String(new Date().getFullYear());

  const name = fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

  const isConfidential = /confidential|private|secret|classified|sensitive/i.test(lower);

  const firstLine = text.split('\n')[0]?.trim() || '';
  const description = firstLine.length > 10 ? firstLine : `Auto-processed ${documentType.toLowerCase()} document`;

  return { name, description, documentType, department, fiscalYear, isConfidential };
}

export async function runAutoFill(file: File): Promise<{
  extractedText: ExtractedText;
  inferResult: AutoFillResult;
}> {
  const extracted = await extractTextFromFile(file);
  const inferResult = inferFromText(extracted.text, extracted.fileName);
  return { extractedText: extracted, inferResult };
}

export async function runAutoFillWithGemini(
  file: File,
  geminiApiKey?: string,
): Promise<{
  extractedText: ExtractedText;
  inferResult: AutoFillResult;
  aiEnhanced?: boolean;
}> {
  const extracted = await extractTextFromFile(file);
  const inferResult = inferFromText(extracted.text, extracted.fileName);

  if (!geminiApiKey || !extracted.text) {
    return { extractedText: extracted, inferResult };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Extract document metadata from this text. Return ONLY a JSON object with these fields: name (document title), description (brief summary), documentType (one of: Budget, Policy, Memo, Report, Invoice, Contract, HR, Technical, Other), department, fiscalYear (YYYY), isConfidential (boolean).\n\nDocument text:\n${extracted.text.slice(0, 30000)}`,
                },
              ],
            },
          ],
        }),
      },
    );

    if (!response.ok) return { extractedText: extracted, inferResult };

    const data = await response.json();
    const geminiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const jsonMatch = geminiText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as Partial<AutoFillResult>;
      return {
        extractedText: extracted,
        inferResult: {
          name: parsed.name || inferResult.name,
          description: parsed.description || inferResult.description,
          documentType: parsed.documentType || inferResult.documentType,
          department: parsed.department || inferResult.department,
          fiscalYear: parsed.fiscalYear || inferResult.fiscalYear,
          isConfidential: parsed.isConfidential ?? inferResult.isConfidential,
        },
        aiEnhanced: true,
      };
    }
  } catch {
    // Fall through to inferred result
  }

  return { extractedText: extracted, inferResult, aiEnhanced: false };
}
