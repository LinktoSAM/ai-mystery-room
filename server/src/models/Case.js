import mongoose from 'mongoose';

const suspectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  background: { type: String, required: true },
  motive: { type: String, required: true },
  isCulprit: { type: Boolean, default: false }
});

const clueSchema = new mongoose.Schema({
  description: { type: String, required: true },
  discovered: { type: Boolean, default: false }
});

const hintSchema = new mongoose.Schema({
  description: { type: String, required: true },
  used: { type: Boolean, default: false }
});

const caseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  story: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  suspects: [suspectSchema],
  clues: [clueSchema],
  hints: [hintSchema],
  solution: {
    culpritId: { type: mongoose.Schema.Types.ObjectId, ref: 'Suspect' },
    explanation: { type: String, required: true }
  },
  playerProgress: {
    status: {
      type: String,
      enum: ['active', 'resolved'],
      default: 'active'
    },
    accusedSuspectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Suspect',
      default: null
    },
    finalScore: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

export const Case = mongoose.model('Case', caseSchema);
export default Case;

