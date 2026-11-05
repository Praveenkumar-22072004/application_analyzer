import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

interface AnalyzeResponse {
  requirements_text: string;
  features: string[];
  business_logic: string;
  ui_flow: string;
  ui_screens: string[];
  test_cases: string[];
}

function generateFallbackAnalysis(text: string): AnalyzeResponse {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const words = text.toLowerCase();
  
  // Intelligent heuristic extraction based on requirements text
  const extractedFeatures: string[] = [];
  const extractedScreens: string[] = [];
  
  // Check for common modules in requirement text
  if (words.includes('auth') || words.includes('login') || words.includes('user') || words.includes('sign in') || words.includes('register')) {
    extractedFeatures.push('Authentication & Authorization');
    extractedScreens.push('Login & Registration Screen');
  }
  if (words.includes('dash') || words.includes('overview') || words.includes('home') || words.includes('feed')) {
    extractedFeatures.push('Interactive Analytics Dashboard');
    extractedScreens.push('Home Dashboard');
  }
  if (words.includes('profile') || words.includes('account') || words.includes('setting')) {
    extractedFeatures.push('User Profile & Preferences');
    extractedScreens.push('Profile & Settings Screen');
  }
  if (words.includes('search') || words.includes('filter') || words.includes('explore')) {
    extractedFeatures.push('Advanced Search & Filter Engine');
    extractedScreens.push('Search & Discovery Screen');
  }
  if (words.includes('notify') || words.includes('alert') || words.includes('message')) {
    extractedFeatures.push('Real-time Notifications & Alerts');
    extractedScreens.push('Notifications Center');
  }
  if (words.includes('pay') || words.includes('checkout') || words.includes('order') || words.includes('cart') || words.includes('bill')) {
    extractedFeatures.push('Transaction & Order Management');
    extractedScreens.push('Checkout & Order Summary Screen');
  }

  // Parse list items from raw text
  for (const line of lines) {
    if (line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line)) {
      const clean = line.replace(/^[-*]|\d+\.\s*/, '').trim();
      if (clean.length > 3 && clean.length < 60 && !extractedFeatures.includes(clean)) {
        extractedFeatures.push(clean);
      }
    }
  }

  if (extractedFeatures.length === 0) {
    extractedFeatures.push('Core Application Interface', 'Data Management System', 'User Workflow Operations', 'Export & Reporting Engine');
  }
  if (extractedScreens.length === 0) {
    extractedScreens.push('Dashboard Screen', 'Details View', 'Configuration Screen', 'Audit & History Screen');
  }

  const businessLogic = `1. Request Processing & Validation:
- Ingest client requests and validate against input specifications.
- Verify user authorization token and session privileges.

2. Core Execution Engine:
- Coordinate transactional state across core features: ${extractedFeatures.slice(0, 3).join(', ')}.
- Enforce business invariants, deduplication checks, and concurrency locks.

3. Persistence & Event Dispatch:
- Commit state mutations to the primary database with optimistic locking.
- Emit asynchronous event triggers for notifications, audit logging, and metric tracking.`;

  const uiFlow = `1. Launch & Authentication:
- User accesses the application and is directed to ${extractedScreens[0] || 'Home Dashboard'}.
- State is verified; active session routes directly to primary workspace.

2. Workspace Navigation:
- User navigates between ${extractedScreens.slice(0, 3).join(' and ')} via primary navigation bar.
- Changes are instantly reflected across reactive UI cards and status indicators.

3. Execution & Confirmation:
- Primary actions invoke responsive validation modals with visual progress state.
- Successful completion triggers toast confirmations and refreshes the synchronized view.`;

  const testCases = extractedFeatures.map((f, i) => 
    `TC-${i + 1}01: Verify that [${f}] validates invalid inputs gracefully with clear field error messages.`
  );
  testCases.push(
    `TC-SEC-01: Ensure unauthorized access to protected endpoints returns HTTP 401/403.`,
    `TC-PERF-01: Confirm full screen load time remains below 800ms under standard network conditions.`
  );

  return {
    requirements_text: text,
    features: extractedFeatures,
    business_logic: businessLogic,
    ui_flow: uiFlow,
    ui_screens: extractedScreens,
    test_cases: testCases
  };
}

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Analyze endpoint
app.post(['/analyze', '/api/analyze'], async (req: Request, res: Response) => {
  const { requirements_text } = req.body;

  if (!requirements_text || typeof requirements_text !== 'string' || !requirements_text.trim()) {
    return res.status(400).json({ detail: 'requirements_text is required.' });
  }

  const text = requirements_text.trim();

  // Try Gemini API if GEMINI_API_KEY is available
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `Analyze the following application requirements thoroughly and extract the structured specification:
Requirements:
"""
${text}
"""

Please provide:
1. features: Array of specific key features (e.g. ["User Authentication", "Analytics Dashboard", "Role-based Access Control"]).
2. business_logic: Detailed backend workflow logic describing data flow, key algorithms, verification steps, and persistence rules.
3. ui_flow: Step-by-step description of the user interface flow showing how users move between screens and states.
4. ui_screens: Array of essential UI screen names (e.g. ["Login Screen", "Executive Dashboard", "User Settings Screen"]).
5. test_cases: Array of concrete acceptance test cases with IDs or clear descriptive specifications.`;

      const geminiPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              features: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of main features',
              },
              business_logic: {
                type: Type.STRING,
                description: 'Description of backend workflow and business logic',
              },
              ui_flow: {
                type: Type.STRING,
                description: 'User Interface navigation and interaction flow',
              },
              ui_screens: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of UI screen names',
              },
              test_cases: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of acceptance test cases',
              },
            },
            required: ['features', 'business_logic', 'ui_flow', 'ui_screens', 'test_cases'],
          },
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API call timed out')), 9000)
      );

      const response = await Promise.race([geminiPromise, timeoutPromise]);

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        requirements_text: text,
        features: Array.isArray(parsed.features) ? parsed.features : [],
        business_logic: parsed.business_logic || '',
        ui_flow: parsed.ui_flow || '',
        ui_screens: Array.isArray(parsed.ui_screens) ? parsed.ui_screens : [],
        test_cases: Array.isArray(parsed.test_cases) ? parsed.test_cases : [],
      });
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to heuristic engine:', err?.message || err);
    }
  }

  // Fallback heuristic engine if no API key or error
  const fallbackResult = generateFallbackAnalysis(text);
  return res.json(fallbackResult);
});

// Setup Vite or static serving
async function startServer() {
  const distPath = path.resolve(__dirname, 'dist');
  const hasDist = fs.existsSync(distPath);
  const isProd = process.env.NODE_ENV === 'production' || hasDist;

  if (!isProd) {
    try {
      const { createServer } = await import('vite');
      const vite = await createServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch {
      if (hasDist) {
        app.use(express.static(distPath));
        app.get('*', (_req, res) => {
          res.sendFile(path.resolve(distPath, 'index.html'));
        });
      }
    }
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
