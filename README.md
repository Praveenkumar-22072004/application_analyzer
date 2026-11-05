# AI Application Analyzer

A full-stack React and Node.js application that converts raw application requirements into structured features, backend business logic, UI navigation flows, key UI screen specifications, acceptance test cases, and responsive interactive wireframe previews.

## Features

- **Requirements Ingestion**: Direct paste or instant file upload (`.txt`, `.md`, `.json`, `.csv`).
- **Feature Extraction**: Identification of core application modules, workflows, and functional capabilities.
- **Business Logic Architecture**: In-depth backend workflow details covering validation, execution rules, concurrency, and persistence.
- **UI Flow & Screen Mapping**: Screen-by-screen user journey and structural screen breakdown.
- **Acceptance Test Cases**: Systematic test scenarios across functional, security, and performance criteria.
- **Interactive Device Mockups**: Dynamic wireframe simulation adapting to the selected screen (Login, Dashboard, Profile, or Custom module).
- **Dual AI Engine with Resilient Fallback**: Powered by Gemini API (`gemini-3.8-flash`) with automatic heuristic fallback for guaranteed uptime.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Framer Motion, Lucide Icons
- **Backend**: Express, Node.js, `@google/genai`
- **Port**: 3000 (`0.0.0.0`)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```
