# 🔍 AI Mystery Room

> An interactive, AI-crafted detective mystery puzzle web application powered by the **Google Gemini API**, Express, Node.js, and React.

Traditional murder mystery games suffer from static storylines and lack replayability. **AI Mystery Room** dynamically generates unique plots, suspects, physical clues, progressive hints, and airtight deductive solutions on demand based on user-provided premises and clearance difficulty levels.

---

## 🌟 Key Features

1. **Infinite Dynamic Mysteries**: Powered by Google GenAI SDK (`@google/genai`) to generate compelling narratives across Easy, Medium, and Hard clearance levels.
2. **Zero-Leak Security**: Confidential solution data (`isCulprit`, `solution.culpritId`, and `solution.explanation`) is strictly omitted by the backend until the player submits their final accusation.
3. **Interactive Investigation Board**:
   - Progressive clue discovery ("Search for Clues" button).
   - Suspect dossiers with alibis and motives.
   - Hint request system with explicit score penalties.
   - Live potential score tally.
4. **Irreversible Accusation Room**: Pick the prime suspect and seal your verdict.
5. **Debrief & Results**: Unlocks the AI Mastermind's deduction proof, reveals the true culprit, awards a detective rank, and fires victory confetti.
6. **Resilient Fallback Mode**: If MongoDB or `GEMINI_API_KEY` is not configured locally, the server activates an intelligent procedural generator and in-memory session store so you can play immediately with zero setup hurdles.

---

## 📐 Difficulty & Scoring Rules

| Clearance | Suspects | Clues | Hints | Base Victory Points |
| :--- | :---: | :---: | :---: | :---: |
| **Easy** | 3 | 5 | 2 | 100 |
| **Medium** | 4 | 7 | 3 | 150 |
| **Hard** | 5 | 9 | 3 | 200 |

### Scoring Formula
$$\text{FinalScore} = \max(0, (\text{isCorrect} ? \text{BasePoints} : 0) + (\text{DiscoveredClues} \times 5) - (\text{UsedHints} \times 10))$$

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **npm** (v9+)
- (Optional) **MongoDB** / MongoDB Atlas connection string
- (Optional) **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/))

### 2. Environment Setup

#### Server Configuration
Navigate to `server/` and create or edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ai_mystery_room
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_URL=http://localhost:5173
```
*(Note: If `GEMINI_API_KEY` is left blank, the app will automatically use the built-in procedural AI mystery engine).*

---

## 💻 Running the Application

You can run both client and server from the root directory or separately:

### Root Commands:
```bash
# Start backend server (port 5000)
npm run dev:server

# Start frontend development server (port 5173)
npm run dev:client
```

### Alternatively, in separate terminals:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

Then open your browser at **`http://localhost:5173`**.

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/cases` | Creates and generates a new mystery via Gemini API. |
| `GET` | `/api/cases/:id` | Returns active case data (**sanitized**: culprit and solution omitted). |
| `POST` | `/api/cases/:id/clues/:clueId/discover` | Discovers a clue and updates clue state. |
| `POST` | `/api/cases/:id/hints` | Reveals the next hint and applies the -10 point penalty. |
| `POST` | `/api/cases/:id/accuse` | Submits player accusation, checks validity, and computes final score. |
| `GET` | `/api/cases/:id/result` | Retrieves full debrief, culprit, and solution (**only after case is resolved**). |
| `GET` | `/api/health` | Service health check. |

---

## 📂 Project Structure

```
project_nextwave_1/
├── spec.md                     # Specification requirements & rubric
├── package.json                # Root package scripts
├── README.md                   # Documentation
├── server/
│   ├── .env.example            # Environment template
│   ├── package.json
│   └── src/
│       ├── app.js              # Express app setup & middleware
│       ├── server.js           # Server entry point & DB connection
│       ├── config/
│       │   └── db.js           # Mongoose connection & in-memory fallback
│       ├── models/
│       │   └── Case.js         # Mongoose schema for cases & progress
│       ├── services/
│       │   └── geminiService.js# Google GenAI integration & procedural fallback
│       ├── controllers/
│       │   └── caseController.js# Case logic, scoring, and security sanitization
│       └── routes/
│           └── caseRoutes.js   # API route definitions
└── client/
    ├── index.html
    ├── package.json
    ├── vite.config.js          # Vite config with API proxy
    ├── tailwind.config.js      # Noir/sleuth theme configuration
    └── src/
        ├── main.jsx
        ├── App.jsx             # React router configuration
        ├── index.css           # Tailwind base styles & noir glow effects
        ├── services/
        │   └── api.js          # Axios API client
        ├── components/
        │   ├── Navbar.jsx      # Navigation header
        │   └── Footer.jsx      # Noir footer
        └── pages/
            ├── Home.jsx             # Landing page (/)
            ├── CreateMystery.jsx    # Premise & difficulty setup (/create)
            ├── InvestigationRoom.jsx# Main gameplay board (/case/:id)
            ├── Accusation.jsx       # Accusation line-up (/case/:id/accuse)
            └── Results.jsx          # Verdict & deduction proof (/case/:id/result)
```

---

## 🛡️ Acceptance Criteria Verified

- [x] **Dynamic Generation**: Generates cases across Easy, Medium, and Hard difficulty with accurate counts.
- [x] **Investigation Flow**: Suspect investigation, progressive clue search, sequential hints, and accusation submission.
- [x] **Strict Security**: True culprit and explanation are strictly stripped from all pre-accusation API payloads.
- [x] **Server-side Scoring**: Points computed on the backend using the formula with 0-point minimum floor.
- [x] **Debrief & Verdict**: Results page provides complete forensic proof, true culprit identity, and score audit.
- [x] **Production Build**: Both server and client pass production build and integration checks.

