import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  HelpCircle, 
  AlertCircle, 
  ChevronRight, 
  Lightbulb, 
  ShieldAlert,
  Loader2,
  FileSpreadsheet
} from 'lucide-react';
import { caseApi } from '../services/api';

const PRESET_IDEAS = [
  "Murder at a 1920s underground jazz speakeasy during a torrential downpour",
  "The stolen royal sapphire aboard the Trans-Siberian midnight train",
  "Poisoned vintage champagne at an exclusive French vineyard auction",
  "Cyber-sabotage and missing scientist in an underwater research station",
  "The cursed emerald disappearance inside the British Museum vault"
];

const LOADING_MESSAGES = [
  "The AI is constructing the crime scene...",
  "Fabricating suspect dossiers and conflicting alibis...",
  "Planting subtle forensic clues and testimonies...",
  "Drafting progressive hints for the lead investigator...",
  "Locking the confidential case file in the secure evidence vault..."
];

export default function CreateMystery() {
  const navigate = useNavigate();
  const [premise, setPremise] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [error, setError] = useState('');

  // Cycle loading messages smoothly
  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await caseApi.createCase(
        premise.trim() || 'A mysterious poisoning in an aristocratic Victorian manor library.',
        difficulty
      );
      if (data && data.caseId) {
        navigate(`/case/${data.caseId}`);
      } else {
        throw new Error('Case ID was not returned by server.');
      }
    } catch (err) {
      console.error('Failed to create case:', err);
      setError(err.response?.data?.error || err.message || 'Failed to generate case. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Page Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>CASE COMMISSIONER</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-gray-100 mb-3">
          Commission a New Mystery
        </h1>
        <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
          Describe the crime setting or premise, pick your investigation clearance level, and let the Gemini intelligence weave the case.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-noir-card border border-[#262d3d] rounded-2xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin flex items-center justify-center">
              </div>
              <Sparkles className="w-8 h-8 text-amber-400 absolute inset-0 m-auto animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-100">
                Generating Case File...
              </h3>
              <p className="text-sm font-mono text-amber-400/90 transition-all duration-300">
                {LOADING_MESSAGES[loadingMsgIndex]}
              </p>
              <p className="text-xs text-gray-500 pt-2">
                This takes approximately 3 to 6 seconds.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
                <div>
                  <p className="font-semibold">Unable to initiate investigation</p>
                  <p className="text-xs text-rose-300/80">{error}</p>
                </div>
              </div>
            )}

            {/* Premise Input */}
            <div className="space-y-2">
              <label htmlFor="premise" className="block text-sm font-medium text-gray-200">
                Case Premise or Crime Setting
              </label>
              <textarea
                id="premise"
                rows={4}
                value={premise}
                onChange={(e) => setPremise(e.target.value)}
                placeholder="e.g. Murder at a 1920s jazz club during an eclipse, where a priceless emerald disappears..."
                className="w-full bg-[#0d1017] border border-[#262d3d] focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/50 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 transition-all outline-none"
              />
              <p className="text-xs text-gray-400">
                Leave blank or choose a prompt below to use an atmospheric pre-crafted scenario.
              </p>

              {/* Inspiration Chips */}
              <div className="pt-3">
                <span className="text-xs font-mono text-gray-400 flex items-center gap-1 mb-2">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  Quick Inspiration:
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_IDEAS.map((idea, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPremise(idea)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-detective-800/80 hover:bg-detective-700/80 border border-[#262d3d] hover:border-amber-500/30 text-gray-300 hover:text-amber-300 transition-all text-left"
                    >
                      {idea}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Difficulty Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-200">
                Select Difficulty Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Easy */}
                <div
                  onClick={() => setDifficulty('Easy')}
                  className={`cursor-pointer p-4 rounded-xl border transition-all ${
                    difficulty === 'Easy'
                      ? 'bg-amber-500/10 border-amber-500/80 shadow-[0_0_15px_rgba(229,184,105,0.15)] ring-1 ring-amber-500'
                      : 'bg-[#0d1017] border-[#262d3d] hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-serif font-bold text-gray-100">Easy</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">100 Pts</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">Straightforward clues, clear connections.</p>
                  <div className="text-[11px] font-mono text-gray-300 space-y-0.5">
                    <div>• 3 Suspects</div>
                    <div>• 5 Clues</div>
                    <div>• 2 Hints</div>
                  </div>
                </div>

                {/* Medium */}
                <div
                  onClick={() => setDifficulty('Medium')}
                  className={`cursor-pointer p-4 rounded-xl border transition-all ${
                    difficulty === 'Medium'
                      ? 'bg-amber-500/10 border-amber-500/80 shadow-[0_0_15px_rgba(229,184,105,0.15)] ring-1 ring-amber-500'
                      : 'bg-[#0d1017] border-[#262d3d] hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-serif font-bold text-gray-100">Medium</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono">150 Pts</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">Complex alibis & conflicting motives.</p>
                  <div className="text-[11px] font-mono text-gray-300 space-y-0.5">
                    <div>• 4 Suspects</div>
                    <div>• 7 Clues</div>
                    <div>• 3 Hints</div>
                  </div>
                </div>

                {/* Hard */}
                <div
                  onClick={() => setDifficulty('Hard')}
                  className={`cursor-pointer p-4 rounded-xl border transition-all ${
                    difficulty === 'Hard'
                      ? 'bg-amber-500/10 border-amber-500/80 shadow-[0_0_15px_rgba(229,184,105,0.15)] ring-1 ring-amber-500'
                      : 'bg-[#0d1017] border-[#262d3d] hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-serif font-bold text-gray-100">Hard</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono">200 Pts</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">Subtle clues, misdirection & red herrings.</p>
                  <div className="text-[11px] font-mono text-gray-300 space-y-0.5">
                    <div>• 5 Suspects</div>
                    <div>• 9 Clues</div>
                    <div>• 3 Hints</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-base bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>Generate Case File</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

