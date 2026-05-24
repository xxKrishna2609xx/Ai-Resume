# 🚀 AI Resume Analyzer & Job Matcher

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Gemini](https://img.shields.io/badge/Google_Gemini-8E75C2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://deepmind.google/technologies/gemini/)

An ultra-premium, AI-powered intelligent talent acquisition and career optimization platform. The system leverages **Google Gemini AI** to extract skills, evaluate resume quality, and match candidates with real-time job listings scraped from the **Adzuna API**, offering bespoke dashboards for both recruiters and job seekers.

---

## ✨ Features

### 1. 📂 Smart PDF & OCR Resume Parser
*   **Extracts text cleanly** from standard and image-based PDFs using a hybrid pipeline of `pdfminer.six` and optical character recognition (`pytesseract` + `pdf2image`).
*   Intelligent handling of complex multi-column layouts and tables.

### 2. 🧠 Gemini AI Resume Analysis
*   Extracts structural information: **candidate name, contact details, standard list of skills, years of experience, professional summary, education, and detailed work history**.
*   Generates a **Resume Quality Score** with actionable AI feedback on how to improve formatting, impact verbs, and layout.

### 3. 💼 Real-Time Job Aggregation & Advanced Filters
*   Integrated with the **Adzuna API** to pull live, active job descriptions globally.
*   Advanced filtering based on location, salary range, job type (full-time, part-time, contract), and specific skill keywords.

### 4. 🎯 Smart Resume-to-Job Matching
*   Calculates a personalized compatibility score for each job based on candidate experience and skill sets.
*   Ranks and sorts jobs dynamically, putting the best-fitting opportunities right at the top.

### 5. 👥 Twin-Role Dashboard Ecosystem
*   **Job Seekers**: Track uploaded resumes, monitor AI-analysis scores, view recommendations, and control "Open to Work" status.
*   **Companies**: Search candidate database using granular criteria (experience years, specific skills), and view deep-dive analysis profiles.

---

## 🛠️ Tech Stack

| Layer | Technologies & Libraries |
| :--- | :--- |
| **Frontend UI** | React 18, Vite, TypeScript, Tailwind CSS, Radix UI (shadcn/ui), Framer Motion (smooth micro-animations), Recharts, Three.js / React Three Fiber (premium 3D effects), Lucide Icons |
| **Backend API** | FastAPI (Python 3.10+), Uvicorn, Pydantic, python-dotenv, requests |
| **AI & Document Processing** | Google Gemini API (`google-generativeai`), `pdfminer.six` (text-based PDFs), `pytesseract` (OCR), `pdf2image` + `Pillow` (PDF rendering) |
| **Database & Auth** | Firebase (Auth & Firestore DB), Firebase Admin SDK (Backend), Firebase Client SDK (Frontend) |

---

## 📂 Project Structure

```text
├── Backend/                 # Python FastAPI Backend
│   ├── app/                 # Backend App Module
│   │   ├── api/             # API Router definitions (routes.py)
│   │   ├── core/            # Authentication & Configuration logic
│   │   ├── services/        # AI Matcher, PDF Parser, Job Aggregator logic
│   │   └── main.py          # FastAPI application server entry point
│   ├── poppler/             # Poppler binaries (optional, for PDF converting)
│   ├── requirements.txt     # Python backend dependencies
│   └── serviceAccountKey.json # Firebase Admin service account credential
│
├── New Frontend/            # React Client + Vite Dev Server
│   ├── client/              # React SPA source files
│   │   ├── components/      # Reusable Radix UI & custom components
│   │   ├── hooks/           # Custom React hooks (auth, query hooks)
│   │   ├── pages/           # Pages (Analyzer, Jobs, Dashboard, Setup, index)
│   │   └── lib/             # API clients, utils
│   ├── shared/              # Shared types/schemas (TypeScript definitions)
│   ├── server/              # Dev Express server scripts / Netlify integrations
│   ├── package.json         # Frontend package script & dependency manifest
│   └── vite.config.ts       # Vite config with custom Express plugin
│
├── start.py                 # Multi-server automatic orchestrator script
└── .env                     # Global Environment configuration file
```

---

## ⚙️ Prerequisites

Before launching the servers, make sure you have the following installed:

1.  **Node.js** (v18.x or above) & **npm** / **pnpm** (pnpm is recommended).
2.  **Python** (v3.10 or above).
3.  **Tesseract OCR** (Required for processing image-only PDFs):
    *   **Windows**: Download installer from [UB Mannheim](https://github.com/UB-Mannheim/tesseract/wiki) and add `C:\Program Files\Tesseract-OCR` to your System Environment variables under `PATH`.
    *   **macOS**: Install via Homebrew: `brew install tesseract`.
    *   **Linux**: `sudo apt install tesseract-ocr`.
4.  **Poppler** (Required by `pdf2image` for converting PDF pages to images for OCR):
    *   **Windows**: Download latest binaries, extract them, and add the `/bin` folder to your Path. (An optional `poppler/` directory can also be placed directly inside `Backend/` for self-containment).
    *   **macOS**: Install via Homebrew: `brew install poppler`.
    *   **Linux**: `sudo apt install poppler-utils`.

---

## 🚀 Quick Start Guide

You can launch the AI Resume Analyzer in two ways: using the **Unified Launcher Script** (automated) or running **Separate Dev Servers** (recommended for active development).

### Option A: The Unified Launcher (Automated)

The workspace features a Python script `start.py` in the root folder that will spin up the backend server, wait for it to stabilize, and open the static frontend page automatically.

1.  Ensure you have configured the environment variables (see [Environment Setup](#-environment-setup)).
2.  Open your terminal in the root directory and run:
    ```bash
    python start.py
    ```
3.  The launcher will start FastAPI at `http://localhost:8000` and launch the browser at the static front-end url: `http://localhost:8000/static/index.html`.
4.  To exit both servers, press `Ctrl+C` in your terminal window.

---

### Option B: Separate Servers (Recommended for Development)

For full development capabilities, hot-reloading, and debug outputs, run the frontend and backend servers in separate terminals.

#### Step 1: Spin up the FastAPI Backend

1.  Open a terminal and navigate to the `Backend` directory:
    ```bash
    cd Backend
    ```
2.  Create a Python virtual environment:
    ```bash
    python -m venv venv
    ```
3.  Activate the virtual environment:
    *   **Windows**: `venv\Scripts\activate`
    *   **macOS / Linux**: `source venv/bin/activate`
4.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
5.  Start the FastAPI backend with hot reloading:
    ```bash
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    ```
6.  The backend api will be live at `http://localhost:8000`. You can check the interactive swagger docs at `http://localhost:8000/docs`.

#### Step 2: Spin up the Vite + React Frontend

1.  Open a second terminal and navigate to the `New Frontend` directory:
    ```bash
    cd "New Frontend"
    ```
2.  Install dependencies:
    ```bash
    npm install
    # OR if you prefer pnpm (recommended)
    pnpm install
    ```
3.  Start the frontend dev server:
    ```bash
    npm run dev
    # OR
    pnpm dev
    ```
4.  The frontend client will start up at `http://localhost:8080` (or `http://localhost:5173` depending on network bindings). Open this URL in your web browser.

---

## 🔒 Environment Setup

To run successfully, you need to set up environment credentials in both backend and frontend.

### 1. Backend Environment Setup (`Backend/.env`)
Create a file named `.env` in the `Backend` folder and populate it with:
```env
GEMINI_API_KEY=your_google_gemini_api_key
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key
```

*   **Google Gemini Key**: Get yours from [Google AI Studio](https://aistudio.google.com/).
*   **Adzuna API Credentials**: Register for a developer account at [Adzuna Developer Portal](https://developer.adzuna.com/).
*   **Firebase Credentials**: Place your Firebase service account config file saved as `serviceAccountKey.json` inside the `Backend/` folder. This is used by the admin SDK to securely manage Firestore profiles and authenticate users.

### 2. Frontend Environment Setup (`New Frontend/.env`)
Create a `.env` file in the `New Frontend` folder and configure:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_FIREBASE_API_KEY=your_firebase_client_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 🔌 API Endpoints Reference

Here are the key API endpoints exposed by the FastAPI server:

### Authentication & Profiles
*   `GET /auth/me`: Fetches the authenticated user profile from Firestore using the Firebase Bearer token.
*   `POST /auth/profile`: Creates or updates a detailed candidate/company profile.
*   `PATCH /auth/open-to-work`: Toggles a candidate's availability status.

### Document Processing & AI
*   `POST /upload-resume`: Uploads a PDF resume, parses its text, extracts JSON fields using Gemini, and saves details in the Firebase database.
*   `GET /get-resume/{resume_id}`: Retrieves parsed and structured resume data by ID.

### Job Aggregation & Matching
*   `POST /jobs/search`: Interacts with the Adzuna API to fetch real-time vacancies based on criteria filters.
*   `POST /jobs/match-resume`: Automatically extracts skills and experience from the user's uploaded resume and matches, scores, and ranks live job listings.
*   `GET /jobs/locations`: Fetches supported global country locations for searches.

---

## 🤝 Troubleshooting

*   **Firebase Authentication Fails**: Verify that you've imported the correct `serviceAccountKey.json` in the `Backend` directory and populated `.env` in the `New Frontend` folder with client-side details. Ensure Firebase Auth is enabled in the Firebase Console.
*   **PDF Upload Failing / Empty Text**: Ensure `Tesseract` and `Poppler` are correctly configured in your system environment PATH. Restart your terminals after adding them.
*   **Gemini API returning errors**: Check that your `GEMINI_API_KEY` is active and has appropriate rate limits.
