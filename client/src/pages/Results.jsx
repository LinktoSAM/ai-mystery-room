import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Trophy, 
  XCircle, 
  CheckCircle, 
  Award, 
  RotateCcw, 
  Search, 
  HelpCircle, 
  FileText, 
  ShieldAlert, 
  Loader2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { caseApi } from '../services/api';

export default function Results() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchResult() {
      try {
        setLoading(true);
        const data = await caseApi.getCaseResult(id);
        setResult(data);

        // Fire celebratory confetti on victory
        if (data.isCorrect) {
          try {
            confetti({
              particleCount: 120,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#e5b869', '#10b981', '#f59e0b', '#ffffff']
            });
          } catch (e) {
            console.log('Confetti effect unavailable');
          }
        }
      } catch (err) {
        console.error('Failed to load result:', err);
        setError(err.response?.data?.error || 'Failed to retrieve case results.');
      } finally {
        setLoading(false);
      }
    }
    fetchResult();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
        <p className="font-mono text-sm text-gray-400">Unsealing verdict and forensic debrief...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-serif font-bold text-gray-100">Dossier Locked</h2>
        <p className="text-gray-400 text-sm">{error || 'Unable to access results.'}</p>
        <Link
          to={`/case/${id}`}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-semibold text-sm hover:bg-amber-400 transition-all"
        >
          <span>Return to Investigation</span>
        </Link>
      </div>
    );
  }

  const { isCorrect, verdict, finalScore, scoreBreakdown, culprit, accusedSuspect, explanation, title, difficulty } = result;

  // Determine detective rank based on score
  const getRank = (score, isWin) => {
    if (!isWin) return { title: 'Case Goes Cold', color: 'text-rose-400', badge: 'Cold Case' };
    if (score >= 180) return { title: 'Master Sleuth (Sherlock Tier)', color: 'text-amber-400', badge: 'Legendary' };
    if (score >= 130) return { title: 'Chief Inspector', color: 'text-emerald-400', badge: 'Exceptional' };
    if (score >= 90) return { title: 'Senior Detective', color: 'text-sky-400', badge: 'Competent' };
    return { title: 'Rookie Investigator', color: 'text-gray-300', badge: 'Cleared' };
  };

  const rank = getRank(finalScore, isCorrect);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      {/* Top Verdict Banner */}
      <div className={`p-8 sm:p-12 rounded-3xl border text-center relative overflow-hidden ${
        isCorrect
          ? 'bg-gradient-to-b from-emerald-950/40 via-noir-card to-[#0b0d13] border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.15)]'
          : 'bg-gradient-to-b from-rose-950/40 via-noir-card to-[#0b0d13] border-rose-500/50 shadow-[0_0_50px_rgba(201,59,59,0.15)]'
      }`}>
        {/* Glow ambient circle */}
        <div className={`absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${
          isCorrect ? 'bg-emerald-400' : 'bg-rose-500'
        }`} />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-mono text-xs uppercase tracking-wider mb-2">
            {isCorrect ? (
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                Case Officially Closed
              </span>
            ) : (
              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-3 py-1 rounded-full flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                Flawed Accusation
              </span>
            )}
          </div>

          <h1 className="text-4xl sm:text-6xl font-serif font-extrabold text-gray-100 tracking-tight">
            {isCorrect ? 'Mystery Solved!' : 'Wrong Suspect Accused'}
          </h1>

          <p className="max-w-xl mx-auto text-sm sm:text-base text-gray-400">
            {isCorrect
              ? `Astute deduction, detective! Your evidence conclusively convicted the true perpetrator.`
              : `The suspect you named had an airtight defense. The actual culprit managed to evade immediate arrest.`}
          </p>

          {/* Big Score Display */}
          <div className="pt-6 flex flex-col items-center">
            <span className="text-xs font-mono uppercase tracking-widest text-gray-400">
              Final Investigation Score
            </span>
            <div className="text-6xl sm:text-7xl font-serif font-black text-amber-400 font-mono tracking-tight my-1">
              {finalScore}
            </div>
            <div className="inline-flex items-center gap-2 text-sm font-mono mt-1">
              <span className="text-gray-400">Rank Earned:</span>
              <span className={`font-bold ${rank.color}`}>{rank.title}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Score Breakdown Table */}
      <div className="bg-noir-card border border-[#262d3d] rounded-2xl p-6 sm:p-8 space-y-4">
        <h3 className="font-serif font-bold text-lg text-gray-100 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          Score Audit Breakdown
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Base Points */}
          <div className="p-4 rounded-xl bg-detective-900/60 border border-[#262d3d] space-y-1">
            <span className="text-xs font-mono text-gray-400 block">Base Accusation Points</span>
            <div className="text-2xl font-serif font-bold text-gray-100">
              {scoreBreakdown?.basePoints || 0} <span className="text-xs text-gray-500 font-mono">pts</span>
            </div>
            <p className="text-[11px] text-gray-400">
              {isCorrect ? `${difficulty} difficulty clearance reward` : '0 pts for inaccurate accusation'}
            </p>
          </div>

          {/* Clues Bonus */}
          <div className="p-4 rounded-xl bg-detective-900/60 border border-[#262d3d] space-y-1">
            <span className="text-xs font-mono text-gray-400 block">Clue Discovery Bonus</span>
            <div className="text-2xl font-serif font-bold text-emerald-400">
              +{scoreBreakdown?.clueBonus || 0} <span className="text-xs text-gray-500 font-mono">pts</span>
            </div>
            <p className="text-[11px] text-gray-400">
              {scoreBreakdown?.cluesDiscovered || 0} clues found × 5 pts each
            </p>
          </div>

          {/* Hint Deductions */}
          <div className="p-4 rounded-xl bg-detective-900/60 border border-[#262d3d] space-y-1">
            <span className="text-xs font-mono text-gray-400 block">Hint Penalty Deductions</span>
            <div className="text-2xl font-serif font-bold text-rose-400">
              -{scoreBreakdown?.hintPenalty || 0} <span className="text-xs text-gray-500 font-mono">pts</span>
            </div>
            <p className="text-[11px] text-gray-400">
              {scoreBreakdown?.hintsUsed || 0} hints consulted × 10 pts penalty
            </p>
          </div>
        </div>
      </div>

      {/* The Reveal: True Culprit & Explanation */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Culprit Dossier */}
        <div className="bg-noir-card border border-amber-500/30 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-amber-400">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-serif font-bold text-lg text-gray-100">The True Culprit</h3>
          </div>

          <div className="p-5 rounded-2xl bg-detective-900/90 border border-amber-500/30 space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-serif font-bold text-xl">
              {culprit.name.charAt(0)}
            </div>
            <div>
              <h4 className="font-serif font-bold text-xl text-amber-300">
                {culprit.name}
              </h4>
              <span className="text-[11px] font-mono text-rose-400 uppercase tracking-widest block mt-0.5">
                Perpetrator Identified
              </span>
            </div>

            <div className="pt-2 border-t border-[#262d3d] space-y-2 text-xs text-gray-300">
              <div>
                <span className="font-mono text-gray-400 block text-[10px] uppercase">Background:</span>
                <p>{culprit.background}</p>
              </div>
              <div>
                <span className="font-mono text-amber-400/80 block text-[10px] uppercase">True Motive:</span>
                <p>{culprit.motive}</p>
              </div>
              {accusedSuspect && accusedSuspect.name !== culprit.name && (
                <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/30 text-rose-300 text-[11px]">
                  You accused: <strong>{accusedSuspect.name}</strong> (Innocent)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Deductive Proof */}
        <div className="md:col-span-2 bg-noir-card border border-[#262d3d] rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-amber-400">
            <FileText className="w-5 h-5" />
            <h3 className="font-serif font-bold text-lg text-gray-100">
              The AI Mastermind's Deduction Proof
            </h3>
          </div>

          <div className="text-sm text-gray-300 leading-relaxed font-serif whitespace-pre-line border-l-2 border-amber-500/40 pl-4 py-2 space-y-3 bg-[#0d1017]/60 rounded-r-xl p-4">
            {explanation}
          </div>
        </div>
      </div>

      {/* Restart / Play Again CTA */}
      <div className="text-center pt-4 pb-8">
        <Link
          to="/create"
          className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Start Another Mystery</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
}

