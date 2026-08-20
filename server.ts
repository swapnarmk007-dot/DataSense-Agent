import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// In-memory active dataset session store
let currentDataset: Record<string, any>[] = [];
let currentDatasetName = 'sample_sales.csv';

// Lazy Gemini client helper
function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'DataSense Agent REST API',
    developer: 'Swapna V | Agentic AI Engineer | IPEC Solutions',
    version: '1.0.0',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
  });
});

// 2. Upload dataset endpoint
app.post('/api/upload', (req: Request, res: Response) => {
  try {
    const { dataset, datasetName } = req.body;
    if (!dataset || !Array.isArray(dataset) || dataset.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Invalid or empty dataset payload.' });
    }

    currentDataset = dataset;
    currentDatasetName = datasetName || 'uploaded_dataset.csv';

    return res.json({
      status: 'success',
      message: `Dataset "${currentDatasetName}" successfully loaded.`,
      recordsCount: currentDataset.length,
      columnsCount: Object.keys(currentDataset[0] || {}).length,
    });
  } catch (err: any) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

// 3. Multi-agent analytical query endpoint
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const { question, dataset, datasetName } = req.body;
    const workingData = dataset && Array.isArray(dataset) && dataset.length > 0 ? dataset : currentDataset;
    const targetName = datasetName || currentDatasetName;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ status: 'error', message: 'Question parameter is required.' });
    }

    const ai = getGeminiClient();
    let geminiInsightText = '';

    if (ai && workingData.length > 0) {
      try {
        const dataSample = workingData.slice(0, 15);
        const colNames = Object.keys(workingData[0] || {});
        const prompt = `You are the Insight Agent in DataSense Agent, developed by Swapna V (Agentic AI Engineer).
Analyze the user's business question regarding the dataset "${targetName}".
Columns: ${colNames.join(', ')}
Dataset sample (first 15 rows):
${JSON.stringify(dataSample, null, 2)}

User Question: "${question}"

Instructions:
1. Provide a professional, concise executive response.
2. Formulate 3 key strategic business takeaways.
3. Formulate 2 actionable operational recommendations.
4. Output cleanly in structured markdown.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
        });

        geminiInsightText = response.text || '';
      } catch (err) {
        console.warn('Gemini API call optional fallback:', err);
      }
    }

    return res.json({
      status: 'success',
      question,
      geminiInsight: geminiInsightText,
      datasetName: targetName,
      recordsAnalyzed: workingData.length,
    });
  } catch (err: any) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

// 4. Sample sales dataset loader
app.get('/api/sample-dataset', (req: Request, res: Response) => {
  try {
    const csvPath = path.join(process.cwd(), 'data', 'sample_sales.csv');
    if (fs.existsSync(csvPath)) {
      const content = fs.readFileSync(csvPath, 'utf8');
      return res.json({ status: 'success', rawCsv: content });
    }
    return res.status(404).json({ status: 'error', message: 'Sample dataset not found' });
  } catch (err: any) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

// 5. Codebase manifest endpoint
app.get('/api/codebase', (req: Request, res: Response) => {
  try {
    const rootDir = path.join(process.cwd(), 'DataSense-Agent');
    const files: { path: string; content: string }[] = [];

    function readDirRecursive(dir: string, base = '') {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = base ? `${base}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          readDirRecursive(fullPath, relPath);
        } else if (entry.isFile()) {
          files.push({
            path: relPath,
            content: fs.readFileSync(fullPath, 'utf8'),
          });
        }
      }
    }

    readDirRecursive(rootDir);
    return res.json({ status: 'success', filesCount: files.length, files });
  } catch (err: any) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

// 6. Download file endpoint
app.get('/api/download/:filename', (req: Request, res: Response) => {
  const { filename } = req.params;
  const filePath = path.join(process.cwd(), 'data', filename);
  if (fs.existsSync(filePath)) {
    return res.download(filePath);
  }
  return res.status(404).json({ status: 'error', message: 'File not found' });
});

// Vite middleware & Production Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DataSense Agent Server running on http://localhost:${PORT}`);
  });
}

startServer();
