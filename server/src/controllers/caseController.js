import mongoose from 'mongoose';
import { Case } from '../models/Case.js';
import { isDbConnected } from '../config/db.js';
import { generateMysteryCase, DIFFICULTY_CONFIG } from '../services/geminiService.js';

// In-Memory fallback store when MongoDB is not connected
const memoryCases = new Map();

/**
 * Strips confidential solution data from a case document for client-safe exposure
 */
function sanitizeCase(caseDoc) {
  const plain = caseDoc.toObject ? caseDoc.toObject() : JSON.parse(JSON.stringify(caseDoc));
  
  // Security Requirement: isCulprit, solution.culpritId, and solution.explanation MUST be omitted
  const sanitizedSuspects = (plain.suspects || []).map(s => {
    const { isCulprit, ...publicSuspect } = s;
    return publicSuspect;
  });

  const { solution, ...publicCase } = plain;
  publicCase.suspects = sanitizedSuspects;

  return publicCase;
}

/**
 * Helper to fetch a case by ID from DB or memory fallback
 */
async function findCaseById(id) {
  if (isDbConnected()) {
    return await Case.findById(id);
  }
  return memoryCases.get(id.toString()) || null;
}

/**
 * Helper to persist a case in DB or memory fallback
 */
async function saveCase(caseData) {
  if (isDbConnected()) {
    const newCase = new Case(caseData);
    return await newCase.save();
  }
  
  // Create simulated Mongoose-like doc with ObjectId
  const id = new mongoose.Types.ObjectId();
  const doc = {
    _id: id,
    ...caseData,
    suspects: caseData.suspects.map(s => ({ _id: new mongoose.Types.ObjectId(), ...s })),
    clues: caseData.clues.map(c => ({ _id: new mongoose.Types.ObjectId(), ...c })),
    hints: caseData.hints.map(h => ({ _id: new mongoose.Types.ObjectId(), ...h })),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Assign culpritId in solution referencing the culprit suspect
  const culprit = doc.suspects.find(s => s.isCulprit) || doc.suspects[0];
  doc.solution.culpritId = culprit._id;

  memoryCases.set(id.toString(), doc);
  return doc;
}

/**
 * POST /api/cases
 * Generates a new case and saves it
 */
export async function createCase(req, res) {
  try {
    const { premise, difficulty = 'Medium' } = req.body;

    if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return res.status(400).json({ error: 'Invalid difficulty. Must be Easy, Medium, or Hard.' });
    }

    const generated = await generateMysteryCase(premise, difficulty);

    // Prepare case data
    const caseData = {
      title: generated.title,
      story: generated.story,
      difficulty,
      suspects: generated.suspects.map(s => ({
        name: s.name,
        background: s.background,
        motive: s.motive,
        isCulprit: s.isCulprit || false
      })),
      clues: generated.clues.map(c => ({
        description: c.description,
        discovered: false
      })),
      hints: generated.hints.map(h => ({
        description: h.description,
        used: false
      })),
      solution: {
        culpritId: null, // Will be linked below
        explanation: generated.explanation
      },
      playerProgress: {
        status: 'active',
        accusedSuspectId: null,
        finalScore: 0
      }
    };

    let createdCase;
    if (isDbConnected()) {
      const caseDoc = new Case(caseData);
      // Link culpritId to the suspect subdoc with isCulprit = true
      const culpritSuspect = caseDoc.suspects.find(s => s.isCulprit);
      caseDoc.solution.culpritId = culpritSuspect ? culpritSuspect._id : caseDoc.suspects[0]._id;
      createdCase = await caseDoc.save();
    } else {
      createdCase = await saveCase(caseData);
    }

    // Return sanitized data with case ID
    const sanitized = sanitizeCase(createdCase);
    return res.status(201).json({
      message: 'Mystery successfully generated',
      caseId: createdCase._id,
      case: sanitized
    });
  } catch (error) {
    console.error('[CaseController] createCase error:', error);
    return res.status(500).json({ error: 'Failed to create case', details: error.message });
  }
}

/**
 * GET /api/cases/:id
 * Retrieves case without exposing solution or isCulprit flags
 */
export async function getCaseById(req, res) {
  try {
    const { id } = req.params;
    const caseItem = await findCaseById(id);

    if (!caseItem) {
      return res.status(404).json({ error: 'Mystery case not found.' });
    }

    const sanitized = sanitizeCase(caseItem);
    return res.status(200).json(sanitized);
  } catch (error) {
    console.error('[CaseController] getCaseById error:', error);
    return res.status(500).json({ error: 'Failed to fetch case', details: error.message });
  }
}

/**
 * POST /api/cases/:id/clues/:clueId/discover
 * Marks a clue as discovered
 */
export async function discoverClue(req, res) {
  try {
    const { id, clueId } = req.params;
    const caseItem = await findCaseById(id);

    if (!caseItem) {
      return res.status(404).json({ error: 'Mystery case not found.' });
    }

    if (caseItem.playerProgress && caseItem.playerProgress.status === 'resolved') {
      return res.status(400).json({ error: 'Case has already been resolved.' });
    }

    const clue = caseItem.clues.find(c => c._id.toString() === clueId.toString());
    if (!clue) {
      return res.status(404).json({ error: 'Clue not found.' });
    }

    clue.discovered = true;

    if (isDbConnected()) {
      await caseItem.save();
    } else {
      memoryCases.set(id.toString(), caseItem);
    }

    return res.status(200).json({
      message: 'Clue discovered',
      clue,
      discoveredCount: caseItem.clues.filter(c => c.discovered).length,
      totalClues: caseItem.clues.length
    });
  } catch (error) {
    console.error('[CaseController] discoverClue error:', error);
    return res.status(500).json({ error: 'Failed to discover clue', details: error.message });
  }
}

/**
 * POST /api/cases/:id/hints
 * Reveals the next available hint and records usage
 */
export async function useHint(req, res) {
  try {
    const { id } = req.params;
    const caseItem = await findCaseById(id);

    if (!caseItem) {
      return res.status(404).json({ error: 'Mystery case not found.' });
    }

    if (caseItem.playerProgress && caseItem.playerProgress.status === 'resolved') {
      return res.status(400).json({ error: 'Case has already been resolved.' });
    }

    // Find next unused hint
    const nextHint = caseItem.hints.find(h => !h.used);
    if (!nextHint) {
      return res.status(400).json({ error: 'No more hints available for this case.' });
    }

    nextHint.used = true;

    if (isDbConnected()) {
      await caseItem.save();
    } else {
      memoryCases.set(id.toString(), caseItem);
    }

    const usedCount = caseItem.hints.filter(h => h.used).length;
    return res.status(200).json({
      message: 'Hint revealed',
      hint: nextHint,
      usedHintsCount: usedCount,
      totalHints: caseItem.hints.length,
      penalty: 10
    });
  } catch (error) {
    console.error('[CaseController] useHint error:', error);
    return res.status(500).json({ error: 'Failed to request hint', details: error.message });
  }
}

/**
 * POST /api/cases/:id/accuse
 * Submits player's accusation, evaluates correctness, and calculates final score
 */
export async function accuseSuspect(req, res) {
  try {
    const { id } = req.params;
    const { suspectId } = req.body;

    if (!suspectId) {
      return res.status(400).json({ error: 'Suspect ID is required to make an accusation.' });
    }

    const caseItem = await findCaseById(id);
    if (!caseItem) {
      return res.status(404).json({ error: 'Mystery case not found.' });
    }

    if (caseItem.playerProgress && caseItem.playerProgress.status === 'resolved') {
      return res.status(400).json({ error: 'This case has already been resolved.' });
    }

    // Verify suspect belongs to case
    const suspect = caseItem.suspects.find(s => s._id.toString() === suspectId.toString());
    if (!suspect) {
      return res.status(400).json({ error: 'Selected suspect is not part of this investigation.' });
    }

    // Compare with solution.culpritId
    const trueCulpritId = caseItem.solution.culpritId.toString();
    const isCorrect = trueCulpritId === suspectId.toString();

    // Scoring formula from spec:
    // BasePoints: Easy=100, Medium=150, Hard=200
    // Total = (IsCorrect ? BasePoints : 0) + (DiscoveredClues * 5) - (UsedHints * 10)
    // FinalScore = Math.max(0, Total)
    const difficultyConfig = DIFFICULTY_CONFIG[caseItem.difficulty] || DIFFICULTY_CONFIG.Medium;
    const basePoints = isCorrect ? difficultyConfig.basePoints : 0;
    const discoveredClues = caseItem.clues.filter(c => c.discovered).length;
    const usedHints = caseItem.hints.filter(h => h.used).length;

    const total = basePoints + (discoveredClues * 5) - (usedHints * 10);
    const finalScore = Math.max(0, total);

    // Update case playerProgress
    caseItem.playerProgress = {
      status: 'resolved',
      accusedSuspectId: suspect._id,
      finalScore
    };

    if (isDbConnected()) {
      await caseItem.save();
    } else {
      memoryCases.set(id.toString(), caseItem);
    }

    const culpritSuspect = caseItem.suspects.find(s => s._id.toString() === trueCulpritId);

    return res.status(200).json({
      verdict: isCorrect ? 'Solved' : 'Failed',
      isCorrect,
      finalScore,
      scoreBreakdown: {
        basePoints,
        cluesDiscovered: discoveredClues,
        clueBonus: discoveredClues * 5,
        hintsUsed: usedHints,
        hintPenalty: usedHints * 10,
        totalCalculated: total
      },
      culprit: {
        id: culpritSuspect ? culpritSuspect._id : trueCulpritId,
        name: culpritSuspect ? culpritSuspect.name : 'Unknown',
        background: culpritSuspect ? culpritSuspect.background : ''
      },
      explanation: caseItem.solution.explanation
    });
  } catch (error) {
    console.error('[CaseController] accuseSuspect error:', error);
    return res.status(500).json({ error: 'Failed to submit accusation', details: error.message });
  }
}

/**
 * GET /api/cases/:id/result
 * Retrieves full case data including culprit, explanation, and final score
 * Only accessible if case is resolved
 */
export async function getCaseResult(req, res) {
  try {
    const { id } = req.params;
    const caseItem = await findCaseById(id);

    if (!caseItem) {
      return res.status(404).json({ error: 'Mystery case not found.' });
    }

    if (!caseItem.playerProgress || caseItem.playerProgress.status !== 'resolved') {
      return res.status(403).json({ 
        error: 'Forbidden: Case has not been resolved yet. You must make an accusation first before viewing results.' 
      });
    }

    const trueCulpritId = caseItem.solution.culpritId.toString();
    const culpritSuspect = caseItem.suspects.find(s => s._id.toString() === trueCulpritId);
    const accusedSuspect = caseItem.suspects.find(s => 
      caseItem.playerProgress.accusedSuspectId && 
      s._id.toString() === caseItem.playerProgress.accusedSuspectId.toString()
    );

    const isCorrect = trueCulpritId === (caseItem.playerProgress.accusedSuspectId ? caseItem.playerProgress.accusedSuspectId.toString() : '');
    const difficultyConfig = DIFFICULTY_CONFIG[caseItem.difficulty] || DIFFICULTY_CONFIG.Medium;
    const basePoints = isCorrect ? difficultyConfig.basePoints : 0;
    const discoveredClues = caseItem.clues.filter(c => c.discovered).length;
    const usedHints = caseItem.hints.filter(h => h.used).length;

    return res.status(200).json({
      caseId: caseItem._id,
      title: caseItem.title,
      difficulty: caseItem.difficulty,
      isCorrect,
      verdict: isCorrect ? 'Solved' : 'Failed',
      finalScore: caseItem.playerProgress.finalScore,
      scoreBreakdown: {
        basePoints,
        cluesDiscovered: discoveredClues,
        clueBonus: discoveredClues * 5,
        hintsUsed: usedHints,
        hintPenalty: usedHints * 10
      },
      accusedSuspect: accusedSuspect ? {
        id: accusedSuspect._id,
        name: accusedSuspect.name
      } : null,
      culprit: {
        id: culpritSuspect ? culpritSuspect._id : trueCulpritId,
        name: culpritSuspect ? culpritSuspect.name : 'Unknown',
        background: culpritSuspect ? culpritSuspect.background : '',
        motive: culpritSuspect ? culpritSuspect.motive : ''
      },
      explanation: caseItem.solution.explanation,
      suspects: caseItem.suspects,
      clues: caseItem.clues,
      hints: caseItem.hints
    });
  } catch (error) {
    console.error('[CaseController] getCaseResult error:', error);
    return res.status(500).json({ error: 'Failed to retrieve case results', details: error.message });
  }
}

