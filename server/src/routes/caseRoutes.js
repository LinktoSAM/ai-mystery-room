import { Router } from 'express';
import {
  createCase,
  getCaseById,
  discoverClue,
  useHint,
  accuseSuspect,
  getCaseResult
} from '../controllers/caseController.js';

const router = Router();

// POST /api/cases - Create and generate mystery
router.post('/', createCase);

// GET /api/cases/:id - Get mystery details (safe, no solution)
router.get('/:id', getCaseById);

// POST /api/cases/:id/clues/:clueId/discover - Mark clue as discovered
router.post('/:id/clues/:clueId/discover', discoverClue);

// POST /api/cases/:id/hints - Request hint
router.post('/:id/hints', useHint);

// POST /api/cases/:id/accuse - Submit accusation & calculate score
router.post('/:id/accuse', accuseSuspect);

// GET /api/cases/:id/result - Retrieve final score and solution
router.get('/:id/result', getCaseResult);

export default router;

