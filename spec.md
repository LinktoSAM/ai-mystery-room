# Project Specification: AI Mystery Room

## A. Project Requirements

**Project Overview & Problem Statement**
AI Mystery Room is an interactive web application that allows users to generate and solve unique, AI-crafted mysteries. Traditional mystery games often suffer from limited replayability due to static storylines. This project solves that by leveraging the Gemini API to dynamically generate plots, suspects, clues, and hints based on user-provided premises and difficulty settings.

**Target Users & Expected User Experience**
*   **Target Users:** Puzzle enthusiasts, amateur sleuths, and gamers looking for short, replayable interactive fiction.
*   **User Experience:** Intuitive, immersive, and suspenseful. Users should feel like detectives piecing together a case without being overwhelmed by complex mechanics. The UI should be clean and responsive.

**Core Features**
*   Dynamic mystery generation (story, suspects, clues) via Gemini API.
*   Interactive investigation board to discover clues and request hints.
*   A secure backend that hides the final solution until an accusation is made.
*   Dynamic scoring system based on difficulty, clues found, and hints used.

**Technology Stack**
*   **Frontend:** React, Vite, Tailwind CSS, React Router, Axios.
*   **Backend:** Node.js, Express, MongoDB, Mongoose.
*   **AI Integration:** Google GenAI SDK (Gemini API), Zod (for schema validation).

**Project Limitations & Final Deliverables**
*   **Limitations:** Text-based gameplay (no generative images/audio in v1). Player progress is not saved across sessions (no user authentication required for MVP).
*   **Deliverables:** A complete `SPEC.md`, a fully functional deployed frontend (Vercel) and backend (render/heroku/etc. with MongoDB Atlas), and a GitHub repository containing the complete source code.

---

## B. User Flow

1.  **Initialization:** User opens the website and lands on the Home page.
2.  **Setup:** User navigates to "Create Mystery", enters a custom premise (e.g., "Murder at a 1920s jazz club"), and selects a difficulty (Easy, Medium, Hard).
3.  **Generation:** The backend calls the Gemini API, which generates the narrative, suspects, clues, and hints.
4.  **Investigation:** User enters the Investigation Room. They read the story, review suspect profiles, and click to "discover" clues.
5.  **Assistance:** If stuck, the user requests a hint (penalizing their potential score).
6.  **Accusation:** User selects a suspect and submits their accusation to the backend.
7.  **Resolution:** The backend validates the accusation, calculates the final score, and reveals the verdict (Correct/Incorrect), the actual culprit, the explanation, and the score.
8.  **Restart:** User clicks "Start Another Mystery" to begin a new game.

---

## C. UI and Page Specifications

**1. Home (`/`)**
*   **Purpose:** Project introduction and call to action.
*   **Elements:** Title, brief description, "Start Investigating" button.

**2. Create Mystery (`/create`)**
*   **Purpose:** Gather parameters for AI generation.
*   **Elements:** Text input for the premise, Dropdown/Radio buttons for difficulty (Easy, Medium, Hard), "Generate Case" submit button.
*   **States:** Loading spinner with text like "The AI is constructing the crime scene..." during API call.

**3. Investigation Room (`/case/:id`)**
*   **Purpose:** Main gameplay loop.
*   **Elements:** 
    *   Story briefing section.
    *   Grid of Suspect Cards (Name, motive, alibi, description).
    *   Clues section (Hidden by default, revealed one by one via a "Search for Clues" button).
    *   Hints section (Button to request hint, displaying used hints).
    *   Progress tracker (Score tally, clues found X/Y).
    *   "Make Accusation" navigation button.

**4. Accusation (`/case/:id/accuse`)**
*   **Purpose:** Finalize the game.
*   **Elements:** Dropdown or grid selection of the suspects, "Submit Accusation" button. Warning prompt: "Are you sure? This cannot be undone."

**5. Results (`/case/:id/result`)**
*   **Purpose:** Debrief and score reveal.
*   **Elements:** Verdict banner (Success/Failure), Final Score, True Culprit reveal, Detailed explanation of the crime, "Play Again" button.

---

## D. Backend and Database Design

### API Endpoints

*   **`POST /api/cases`**
    *   *Body:* `{ premise: string, difficulty: string }`
    *   *Action:* Calls Gemini API, saves mystery to DB. Returns case ID and public data.
*   **`GET /api/cases/:id`**
    *   *Action:* Retrieves active mystery data (excludes culprit and explanation).
*   **`POST /api/cases/:id/clues/:clueId/discover`**
    *   *Action:* Marks a clue as discovered, updates score state in DB.
*   **`POST /api/cases/:id/hints`**
    *   *Action:* Reveals next available hint, deducts from score state in DB.
*   **`POST /api/cases/:id/accuse`**
    *   *Body:* `{ suspectId: string }`
    *   *Action:* Compares accusation with true culprit, marks case as resolved, calculates final score.
*   **`GET /api/cases/:id/result`**
    *   *Action:* Retrieves full case data including culprit, explanation, and final score (only accessible if case is resolved).

### Database Model (Mongoose)

```javascript
// Case Schema
{
  title: String,
  story: String,
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] },
  suspects: [{ _id: ObjectId, name: String, background: String, motive: String, isCulprit: Boolean }], // isCulprit is NEVER sent to frontend until resolution
  clues: [{ _id: ObjectId, description: String, discovered: { type: Boolean, default: false } }],
  hints: [{ _id: ObjectId, description: String, used: { type: Boolean, default: false } }],
  solution: {
    culpritId: ObjectId, // references a suspect
    explanation: String
  },
  playerProgress: {
    status: { type: String, enum: ['active', 'resolved'], default: 'active' },
    accusedSuspectId: ObjectId,
    finalScore: Number
  }
}
```

**Security Requirement:** The `isCulprit` flag, `solution.culpritId`, and `solution.explanation` MUST be omitted from the JSON payload returned by `GET /api/cases/:id`.

---

## E. AI Behavior and Scoring Rules

### AI Generation Parameters
The Gemini prompt must enforce structured JSON output matching the requested difficulty settings:

| Difficulty | Suspects | Clues | Hints | Base Points (Correct Accusation) |
| :--- | :--- | :--- | :--- | :--- |
| **Easy** | 3 | 5 | 2 | 100 |
| **Medium** | 4 | 7 | 3 | 150 |
| **Hard** | 5 | 9 | 3 | 200 |

### Scoring Rules
*   **Correct Accusation:** Base points assigned according to the table above.
*   **Incorrect Accusation:** 0 base points.
*   **Clues Discovered:** +5 points for *each* clue discovered.
*   **Hints Used:** -10 points for *each* hint requested.
*   **Minimum Score:** The score cannot drop below 0. 

*Score Calculation Formula (Backend):* 
`Total = (IsCorrect ? BasePoints : 0) + (DiscoveredClues * 5) - (UsedHints * 10)`
`FinalScore = Math.max(0, Total)`

---

## F. Acceptance Criteria

1.  **Generation:** Users can successfully generate mysteries at Easy, Medium, and Hard difficulty levels.
2.  **Gameplay:** Players can investigate suspects, uncover clues progressively, request hints, and submit an accusation.
3.  **Security:** The true culprit and the solution explanation are completely hidden from the browser network tab and state until the final accusation is submitted.
4.  **Scoring:** Scores are calculated entirely on the backend and accurately reflect the rules (+5 for clues, -10 for hints, correct base points).
5.  **Resolution:** The Results page accurately displays whether the user won or lost, the correct culprit, the AI's explanation, and the total score.
6.  **Deployment:** The application functions flawlessly on the live deployed URLs (Vercel/Atlas/Hosting Provider).