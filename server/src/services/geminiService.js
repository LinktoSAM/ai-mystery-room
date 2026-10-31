import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

export const DIFFICULTY_CONFIG = {
  Easy: { suspects: 3, clues: 5, hints: 2, basePoints: 100 },
  Medium: { suspects: 4, clues: 7, hints: 3, basePoints: 150 },
  Hard: { suspects: 5, clues: 9, hints: 3, basePoints: 200 },
};

const MysteryOutputSchema = z.object({
  title: z.string(),
  story: z.string(),
  suspects: z.array(
    z.object({
      name: z.string(),
      background: z.string(),
      motive: z.string(),
      isCulprit: z.boolean(),
    })
  ),
  clues: z.array(
    z.object({
      description: z.string(),
    })
  ),
  hints: z.array(
    z.object({
      description: z.string(),
    })
  ),
  culpritName: z.string(),
  explanation: z.string(),
});

/**
 * Procedural fallback mystery generator in case GEMINI_API_KEY is not set or API fails
 */
function generateProceduralMystery(premise, difficulty) {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.Medium;
  const cleanPremise = premise && premise.trim().length > 0 
    ? premise.trim() 
    : "A wealthy collector is found poisoned inside a locked penthouse library during an exclusive gala.";

  const suspectTemplates = [
    {
      name: "Arthur Pendelton",
      background: "The loyal butler who has managed the estate for over 25 years and knew every secret.",
      motive: "Was recently discovered embezzling family funds and was facing imminent termination."
    },
    {
      name: "Dr. Evelyn Vance",
      background: "Renowned personal physician and long-time confidant who prescribed all medications.",
      motive: "Deep in debt from illicit investments and stood to gain a substantial bequest in the revised will."
    },
    {
      name: "Marcus Aurelius Thorne",
      background: "A charismatic business rival and private investor seeking control of the company assets.",
      motive: "A multimillion-dollar hostile takeover deal was about to be officially vetoed that evening."
    },
    {
      name: "Celeste Morneau",
      background: "An enigmatic Parisian art dealer who arrived uninvited with a mysterious ledger.",
      motive: "Seeking revenge for a forged antique sale that ruined her family's auction house decades ago."
    },
    {
      name: "Julian Gray",
      background: "The eccentric tech entrepreneur and nephew who had a heated argument in the study earlier.",
      motive: "Cut out of the family trust due to radical, unapproved research expenditures."
    }
  ];

  // Pick required number of suspects
  const selectedSuspects = suspectTemplates.slice(0, config.suspects).map((s, index) => ({
    name: s.name,
    background: s.background,
    motive: s.motive,
    isCulprit: index === 1 // Dr. Evelyn Vance by default or chosen index
  }));

  const culprit = selectedSuspects.find(s => s.isCulprit) || selectedSuspects[0];
  culprit.isCulprit = true;

  const cluePool = [
    `A shattered glass tumbler smelling faintly of bitter almonds found near the mahogany desk.`,
    `A faint smudge of blue ink matching the fountain pen in ${culprit.name}'s leather coat pocket.`,
    `Security logs show the rear terrace door was unlocked from the inside precisely at 10:14 PM.`,
    `A torn pharmacy receipt indicating a purchase of digitalis derivatives dated two days prior.`,
    `Muddy footprints size 9 leading toward the conservatory where a spare master key was kept.`,
    `A whispered recording captured by a smart speaker: "Tonight everything ends, one way or another."`,
    `A burn mark on the fireplace grate where a corner of a handwritten codicil escaped incineration.`,
    `CCTV footage confirms ${culprit.name} slipped out of the banquet hall for 12 unexplained minutes.`,
    `An unsent telegram discovered hidden in a hollow book detailing an urgent escape itinerary.`
  ];

  const hintPool = [
    `Review the physical trace evidence carefully: look at which suspect had direct access to medical or chemical substances.`,
    `Compare the timeline: the victim succumbed within 15 minutes of ingesting their customary nightcap.`,
    `Cross-reference the alibis: one suspect claimed to be in the parlor, yet their personal accessories were recovered from the study.`
  ];

  return {
    title: `The Riddle of the ${difficulty} Investigation: ${cleanPremise.slice(0, 35)}...`,
    story: `The scene was set under unusual tension. Regarding the incident: "${cleanPremise}". When midnight struck, cries echoed down the corridor. The victim was discovered lifeless in the study. Local authorities were delayed by a heavy storm, leaving the investigation in your capable hands. ${config.suspects} prime individuals were detained in the manor salon, each with a plausible facade and a simmering motive. Uncover the clues, examine the alibis, and deduce the true perpetrator before they slip away.`,
    suspects: selectedSuspects,
    clues: cluePool.slice(0, config.clues).map(description => ({ description })),
    hints: hintPool.slice(0, config.hints).map(description => ({ description })),
    culpritName: culprit.name,
    explanation: `The evidence decisively implicates ${culprit.name}. The shattered tumbler contained traces of digitalis, matching the torn pharmacy receipt traced directly to them. Furthermore, the timing of the dose coincides exactly with the 12-minute window during which ${culprit.name} vanished from the parlor. The ink smudges and altered codicil prove premeditation, leaving no doubt of their guilt.`
  };
}

/**
 * Generates an interactive mystery case using Gemini API (or procedural fallback)
 * @param {string} premise - Custom user scenario
 * @param {'Easy' | 'Medium' | 'Hard'} difficulty - Selected difficulty level
 */
export async function generateMysteryCase(premise, difficulty = 'Medium') {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.Medium;
  let rawKey = process.env.GEMINI_API_KEY || '';
  const apiKey = rawKey.replace(/^["']|["']$/g, '').trim();

  if (!apiKey || apiKey === '' || apiKey.includes('your_gemini_api_key')) {
    console.log('[GeminiService] No valid GEMINI_API_KEY configured. Utilizing procedural AI mystery generator.');
    return generateProceduralMystery(premise, difficulty);
  }

  try {
    console.log(`[GeminiService] Calling Gemini API (model: gemini-3.5-flash-lite) for difficulty=${difficulty}...`);
    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are a master mystery writer and interactive detective game architect.
Generate a compelling, airtight murder or heist mystery based on the user's premise.
Strict requirements:
- Difficulty: "${difficulty}".
- Exactly ${config.suspects} suspects. Each suspect must have a distinct name, background, and realistic motive.
- EXACTLY ONE suspect must have isCulprit set to true. The other ${config.suspects - 1} suspects MUST have isCulprit set to false.
- Exactly ${config.clues} clues. Clues must be distinct, investigative pieces of physical evidence, testimonies, or forensic findings. Together they must logically point to the single true culprit and refute innocent alibis.
- Exactly ${config.hints} sequential hints. Hint 1 must be subtle; later hints provide sharper deductive nudges without directly naming the culprit.
- title: A catchy noir/mystery case title.
- story: A rich, atmospheric 2-3 paragraph case briefing describing the setting, crime discovery, initial situation, and stakes.
- culpritName: The exact name of the suspect who is the culprit.
- explanation: A detailed step-by-step breakdown of how the clues connect together to expose the culprit and debunk their alibi.

You must respond ONLY with valid JSON conforming to this schema:
{
  "title": "string",
  "story": "string",
  "suspects": [
    { "name": "string", "background": "string", "motive": "string", "isCulprit": boolean }
  ],
  "clues": [
    { "description": "string" }
  ],
  "hints": [
    { "description": "string" }
  ],
  "culpritName": "string",
  "explanation": "string"
}`;

    const userPrompt = `User Premise: ${premise || "Murder in an ancient grand library during a midnight thunderstorm."}\nDifficulty: ${difficulty}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text;
    const parsedData = JSON.parse(responseText);

    // Validate with Zod
    const validated = MysteryOutputSchema.safeParse(parsedData);
    if (!validated.success) {
      console.warn('[GeminiService] Gemini JSON did not strictly match schema. Fallback to procedural.', validated.error);
      return generateProceduralMystery(premise, difficulty);
    }

    const data = validated.data;

    // Ensure exactly 1 culprit
    let culpritCount = data.suspects.filter(s => s.isCulprit).length;
    if (culpritCount === 0) {
      data.suspects[0].isCulprit = true;
    } else if (culpritCount > 1) {
      let foundOne = false;
      for (const s of data.suspects) {
        if (s.isCulprit) {
          if (!foundOne) foundOne = true;
          else s.isCulprit = false;
        }
      }
    }

    // Ensure correct counts according to difficulty
    if (data.suspects.length > config.suspects) {
      data.suspects = data.suspects.slice(0, config.suspects);
    }
    if (data.clues.length > config.clues) {
      data.clues = data.clues.slice(0, config.clues);
    }
    if (data.hints.length > config.hints) {
      data.hints = data.hints.slice(0, config.hints);
    }

    return data;
  } catch (error) {
    console.error('[GeminiService] Error calling Gemini API:', error.message);
    console.log('[GeminiService] Falling back to high-fidelity procedural generation.');
    return generateProceduralMystery(premise, difficulty);
  }
}

