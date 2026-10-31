import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Sparkles, 
  ShieldCheck, 
  BrainCircuit, 
  HelpCircle, 
  Award, 
  ArrowRight,
  Flame,
  FileText
} from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative px-4 pt-16 pb-20 md:pt-24 md:pb-28 max-w-5xl mx-auto text-center">
        {/* Ambient Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono tracking-wide mb-8 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          <span>POWERED BY GOOGLE GEMINI API</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-extrabold tracking-tight text-gray-100 leading-[1.1] mb-6">
          Step into the Noir. <br />
          <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
            Every Mystery is One of a Kind.
          </span>
        </h1>

        {/* Subhead */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-400 mb-10 leading-relaxed font-light">
          Static mystery games get solved once and lose their thrill. Here, an AI game master drafts unique suspects, concealed clues, and interlocking alibis for every playthrough. Will you crack the case?
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/create"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-semibold bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
          >
            <Search className="w-5 h-5" />
            <span>Start Investigating</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>

          <a
            href="#how-it-works"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-medium text-gray-300 bg-detective-850/80 hover:bg-detective-800 border border-[#262d3d] hover:border-amber-500/40 transition-all"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>How It Works</span>
          </a>
        </div>
      </section>

      {/* Highlights / Features */}
      <section id="how-it-works" className="py-16 border-t border-[#262d3d]/50 bg-[#0c0f18]/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-xs uppercase font-mono tracking-widest text-amber-400 mb-2">Investigation Protocol</h2>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-gray-100">Designed for True Amateur Sleuths</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-noir-card/90 border border-[#262d3d] rounded-2xl p-6 hover:border-amber-500/40 transition-all hover:shadow-[0_0_25px_rgba(229,184,105,0.08)]">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-semibold text-lg text-gray-100 mb-2">Infinite Dynamic Plots</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Provide any premise — from a 1920s speakeasy murder to a lunar heist. Gemini crafts an airtight plot with consistent motives and realistic alibis.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-noir-card/90 border border-[#262d3d] rounded-2xl p-6 hover:border-amber-500/40 transition-all hover:shadow-[0_0_25px_rgba(229,184,105,0.08)]">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-semibold text-lg text-gray-100 mb-2">Zero-Leak Security</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                No peeking in browser dev tools! The backend strictly locks away the culprit identity and deduction proof until your accusation is registered.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-noir-card/90 border border-[#262d3d] rounded-2xl p-6 hover:border-amber-500/40 transition-all hover:shadow-[0_0_25px_rgba(229,184,105,0.08)]">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-semibold text-lg text-gray-100 mb-2">Calculated Sleuth Score</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Earn base points based on difficulty, gain +5 bonus for each discovered clue, and manage hints wisely — each hint deducts -10 points.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Difficulty Overview */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="text-center mb-10">
          <h3 className="text-xs uppercase font-mono tracking-widest text-amber-400 mb-2">Case Clearance Levels</h3>
          <h4 className="text-2xl sm:text-3xl font-serif font-bold text-gray-100">Choose Your Investigation Stakes</h4>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-detective-900/60 border border-[#262d3d] flex flex-col justify-between">
            <div>
              <div className="inline-block px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium mb-3">
                CASUAL SLEUTH
              </div>
              <h5 className="text-xl font-serif font-bold text-gray-100 mb-2">Easy</h5>
              <p className="text-sm text-gray-400 mb-4">Straightforward connections and fewer red herrings.</p>
              <ul className="space-y-2 text-xs text-gray-300 font-mono">
                <li className="flex justify-between border-b border-[#262d3d]/50 pb-1">
                  <span className="text-gray-400">Suspects:</span>
                  <span className="text-amber-400">3 Suspects</span>
                </li>
                <li className="flex justify-between border-b border-[#262d3d]/50 pb-1">
                  <span className="text-gray-400">Clues Available:</span>
                  <span className="text-amber-400">5 Clues</span>
                </li>
                <li className="flex justify-between border-b border-[#262d3d]/50 pb-1">
                  <span className="text-gray-400">Emergency Hints:</span>
                  <span className="text-amber-400">2 Hints</span>
                </li>
                <li className="flex justify-between pt-1">
                  <span className="text-gray-400">Base Victory Points:</span>
                  <span className="text-emerald-400 font-bold">100 Pts</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-detective-900/90 border border-amber-500/40 relative shadow-[0_0_25px_rgba(229,184,105,0.08)] flex flex-col justify-between">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono text-[10px] font-bold uppercase tracking-wider">
              Recommended
            </div>
            <div>
              <div className="inline-block px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-medium mb-3">
                SEASONED DETECTIVE
              </div>
              <h5 className="text-xl font-serif font-bold text-gray-100 mb-2">Medium</h5>
              <p className="text-sm text-gray-400 mb-4">Plausible alibis, forensic trace clues, and conflicting testimonies.</p>
              <ul className="space-y-2 text-xs text-gray-300 font-mono">
                <li className="flex justify-between border-b border-[#262d3d]/50 pb-1">
                  <span className="text-gray-400">Suspects:</span>
                  <span className="text-amber-400">4 Suspects</span>
                </li>
                <li className="flex justify-between border-b border-[#262d3d]/50 pb-1">
                  <span className="text-gray-400">Clues Available:</span>
                  <span className="text-amber-400">7 Clues</span>
                </li>
                <li className="flex justify-between border-b border-[#262d3d]/50 pb-1">
                  <span className="text-gray-400">Emergency Hints:</span>
                  <span className="text-amber-400">3 Hints</span>
                </li>
                <li className="flex justify-between pt-1">
                  <span className="text-gray-400">Base Victory Points:</span>
                  <span className="text-amber-400 font-bold">150 Pts</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-detective-900/60 border border-[#262d3d] flex flex-col justify-between">
            <div>
              <div className="inline-block px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-medium mb-3">
                MASTER SLEUTH
              </div>
              <h5 className="text-xl font-serif font-bold text-gray-100 mb-2">Hard</h5>
              <p className="text-sm text-gray-400 mb-4">Intricate web of deception, subtle clues, and tight timelines.</p>
              <ul className="space-y-2 text-xs text-gray-300 font-mono">
                <li className="flex justify-between border-b border-[#262d3d]/50 pb-1">
                  <span className="text-gray-400">Suspects:</span>
                  <span className="text-amber-400">5 Suspects</span>
                </li>
                <li className="flex justify-between border-b border-[#262d3d]/50 pb-1">
                  <span className="text-gray-400">Clues Available:</span>
                  <span className="text-amber-400">9 Clues</span>
                </li>
                <li className="flex justify-between border-b border-[#262d3d]/50 pb-1">
                  <span className="text-gray-400">Emergency Hints:</span>
                  <span className="text-amber-400">3 Hints</span>
                </li>
                <li className="flex justify-between pt-1">
                  <span className="text-gray-400">Base Victory Points:</span>
                  <span className="text-rose-400 font-bold">200 Pts</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link
            to="/create"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all"
          >
            <span>Launch Case Generator</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

