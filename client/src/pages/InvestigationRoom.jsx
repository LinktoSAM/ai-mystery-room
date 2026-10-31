import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  HelpCircle, 
  UserCheck, 
  FileText, 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Lock, 
  ArrowRight,
  Loader2,
  RefreshCw,
  Trophy,
  MinusCircle,
  PlusCircle,
  Sparkles
} from 'lucide-react';
import { caseApi } from '../services/api';

export default function InvestigationRoom() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [discoveringClue, setDiscoveringClue] = useState(false);
  const [requestingHint, setRequestingHint] = useState(false);
  const [hintNotification, setHintNotification] = useState('');

  // Fetch case data
  const loadCase = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await caseApi.getCase(id);
      setCaseData(data);
    } catch (err) {
      console.error('Failed to load case:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load case data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCase();
  }, [id]);

  // Discover next clue
  const handleDiscoverClue = async () => {
    if (!caseData || discoveringClue) return;

    // Find first undiscovered clue
    const undiscovered = caseData.clues.find(c => !c.discovered);
    if (!undiscovered) return;

    try {
      setDiscoveringClue(true);
      const res = await caseApi.discoverClue(id, undiscovered._id);
      
      // Update local state
      setCaseData(prev => ({
        ...prev,
        clues: prev.clues.map(c => 
          c._id === undiscovered._id ? { ...c, discovered: true } : c
        )
      }));
    } catch (err) {
      console.error('Failed to discover clue:', err);
      alert(err.response?.data?.error || 'Failed to search for clues.');
    } finally {
      setDiscoveringClue(false);
    }
  };

  // Request next hint
  const handleRequestHint = async () => {
    if (!caseData || requestingHint) return;

    const unusedHint = caseData.hints.find(h => !h.used);
    if (!unusedHint) return;

    const confirmHint = window.confirm(
      "Requesting a hint incurs a -10 points penalty on your final score. Do you wish to proceed?"
    );
    if (!confirmHint) return;

    try {
      setRequestingHint(true);
      const res = await caseApi.requestHint(id);

      setCaseData(prev => ({
        ...prev,
        hints: prev.hints.map(h => 
          h._id === res.hint._id ? { ...h, used: true } : h
        )
      }));
      setHintNotification('New hint recorded in your detective notes (-10 pts penalty applied).');
      setTimeout(() => setHintNotification(''), 4500);
    } catch (err) {
      console.error('Failed to request hint:', err);
      alert(err.response?.data?.error || 'Failed to request hint.');
    } finally {
      setRequestingHint(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
        <p className="font-mono text-sm text-gray-400">Opening crime scene docket #{id.slice(-6)}...</p>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-serif font-bold text-gray-100">Unable to Access Crime Scene</h2>
        <p className="text-gray-400 text-sm">{error || 'Case not found.'}</p>
        <Link
          to="/create"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-semibold text-sm hover:bg-amber-400 transition-all"
        >
          <span>Initiate New Mystery</span>
        </Link>
      </div>
    );
  }

  // Calculate live stats
  const discoveredClues = caseData.clues.filter(c => c.discovered);
  const undiscoveredCount = caseData.clues.length - discoveredClues.length;
  const usedHints = caseData.hints.filter(h => h.used);
  const remainingHints = caseData.hints.length - usedHints.length;

  const basePointsMap = { Easy: 100, Medium: 150, Hard: 200 };
  const basePoints = basePointsMap[caseData.difficulty] || 150;
  const potentialScore = Math.max(
    0,
    basePoints + (discoveredClues.length * 5) - (usedHints.length * 10)
  );

  const isResolved = caseData.playerProgress?.status === 'resolved';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Case Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#262d3d]">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-400">
              Active Case File
            </span>
            <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider ${
              caseData.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
              caseData.difficulty === 'Hard' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
              'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}>
              {caseData.difficulty} Stakes
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-gray-100">
            {caseData.title}
          </h1>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          {isResolved ? (
            <Link
              to={`/case/${id}/result`}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Trophy className="w-4 h-4" />
              <span>Review Final Verdict</span>
            </Link>
          ) : (
            <Link
              to={`/case/${id}/accuse`}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Make Accusation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Progress & Score Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-noir-card border border-[#262d3d] rounded-xl p-4">
          <div className="text-xs font-mono text-gray-400 mb-1">Clues Discovered</div>
          <div className="text-2xl font-serif font-bold text-gray-100 flex items-baseline gap-2">
            <span>{discoveredClues.length}</span>
            <span className="text-xs text-gray-500 font-mono">/ {caseData.clues.length}</span>
          </div>
          <div className="text-[11px] text-emerald-400/90 font-mono mt-1">
            +{discoveredClues.length * 5} bonus earned
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-noir-card border border-[#262d3d] rounded-xl p-4">
          <div className="text-xs font-mono text-gray-400 mb-1">Hints Used</div>
          <div className="text-2xl font-serif font-bold text-gray-100 flex items-baseline gap-2">
            <span>{usedHints.length}</span>
            <span className="text-xs text-gray-500 font-mono">/ {caseData.hints.length}</span>
          </div>
          <div className="text-[11px] text-rose-400/90 font-mono mt-1">
            -{usedHints.length * 10} pts deduction
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-noir-card border border-[#262d3d] rounded-xl p-4">
          <div className="text-xs font-mono text-gray-400 mb-1">Base Solve Value</div>
          <div className="text-2xl font-serif font-bold text-amber-400 font-mono">
            {basePoints} <span className="text-xs text-gray-500">pts</span>
          </div>
          <div className="text-[11px] text-gray-400 font-mono mt-1">
            Awarded on correct suspect
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-noir-card border border-amber-500/30 rounded-xl p-4 bg-gradient-to-br from-amber-500/5 to-transparent">
          <div className="text-xs font-mono text-amber-400/80 mb-1">Potential Max Score</div>
          <div className="text-2xl font-serif font-bold text-amber-300 font-mono">
            {potentialScore} <span className="text-xs text-gray-500">pts</span>
          </div>
          <div className="text-[11px] text-amber-400/70 font-mono mt-1">
            If accusation is accurate
          </div>
        </div>
      </div>

      {/* Main Grid: Story + Suspects */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Story Briefing & Clues */}
        <div className="lg:col-span-2 space-y-8">
          {/* Story Briefing */}
          <div className="bg-noir-card border border-[#262d3d] rounded-2xl p-6 sm:p-8 relative">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-serif font-bold text-gray-100">
                Official Incident Docket
              </h2>
            </div>
            <div className="text-sm sm:text-base text-gray-300 leading-relaxed space-y-3 font-serif whitespace-pre-line border-l-2 border-amber-500/40 pl-4 py-1">
              {caseData.story}
            </div>
          </div>

          {/* Clues Board */}
          <div className="bg-noir-card border border-[#262d3d] rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-serif font-bold text-gray-100 flex items-center gap-2">
                  <Search className="w-5 h-5 text-amber-400" />
                  Physical Evidence & Clues
                </h2>
                <p className="text-xs text-gray-400">
                  Search the crime scene systematically to uncover vital forensic leads.
                </p>
              </div>

              {undiscoveredCount > 0 && !isResolved && (
                <button
                  onClick={handleDiscoverClue}
                  disabled={discoveringClue}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:text-amber-300 transition-all self-start sm:self-auto disabled:opacity-50"
                >
                  {discoveringClue ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  <span>Search for Clues ({undiscoveredCount} left)</span>
                </button>
              )}
            </div>

            {/* Clue List */}
            <div className="space-y-3">
              {discoveredClues.length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-[#262d3d] text-center text-gray-500">
                  <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">No clues uncovered yet.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Click "Search for Clues" above to examine the premises.
                  </p>
                </div>
              ) : (
                discoveredClues.map((clue, idx) => (
                  <div
                    key={clue._id}
                    className="p-4 rounded-xl bg-detective-900/60 border border-amber-500/20 flex items-start gap-3.5 hover:border-amber-500/40 transition-all"
                  >
                    <span className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      #{idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-200 leading-relaxed font-sans">
                        {clue.description}
                      </p>
                      <span className="inline-block mt-2 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        +5 Pts Earned
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Suspects Dossier & Hints */}
        <div className="space-y-8">
          {/* Suspects Section */}
          <div className="bg-noir-card border border-[#262d3d] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-serif font-bold text-gray-100 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-400" />
                Persons of Interest
              </h2>
              <span className="text-xs font-mono text-gray-400">
                {caseData.suspects.length} Suspects
              </span>
            </div>

            <div className="space-y-4">
              {caseData.suspects.map((suspect, index) => (
                <div
                  key={suspect._id}
                  className="p-4 rounded-xl bg-detective-900/70 border border-[#262d3d] hover:border-gray-500 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-base text-gray-100 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      {suspect.name}
                    </h3>
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                      Suspect #{index + 1}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-mono text-gray-400 uppercase block">Background:</span>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {suspect.background}
                    </p>
                  </div>

                  <div className="pt-1 border-t border-[#262d3d]/60">
                    <span className="text-[11px] font-mono text-amber-400/80 uppercase block">Known Motive:</span>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {suspect.motive}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hints Section */}
          <div className="bg-noir-card border border-[#262d3d] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-serif font-bold text-gray-100 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                Investigative Hints
              </h2>
              <span className="text-xs font-mono text-gray-400">
                {remainingHints} available
              </span>
            </div>

            {hintNotification && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
                {hintNotification}
              </div>
            )}

            {/* Used hints list */}
            <div className="space-y-3">
              {usedHints.length === 0 ? (
                <p className="text-xs text-gray-400 italic">
                  No hints requested yet. Save your points for a higher detective ranking!
                </p>
              ) : (
                usedHints.map((hint, idx) => (
                  <div
                    key={hint._id}
                    className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200/90 leading-relaxed font-mono"
                  >
                    <span className="text-amber-400 font-bold block mb-1">
                      Hint #{idx + 1} (Penalty: -10 pts)
                    </span>
                    {hint.description}
                  </div>
                ))
              )}
            </div>

            {/* Request Hint Button */}
            {remainingHints > 0 && !isResolved && (
              <button
                onClick={handleRequestHint}
                disabled={requestingHint}
                className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-detective-800 hover:bg-detective-700 border border-[#262d3d] text-gray-300 hover:text-amber-300 transition-all flex items-center justify-center gap-2"
              >
                {requestingHint ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>Request Hint (-10 Pts Penalty)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

