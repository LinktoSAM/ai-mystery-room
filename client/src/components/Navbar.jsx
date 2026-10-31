import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Compass, ShieldAlert, Sparkles } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0b0d13]/85 border-b border-[#262d3d]/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link 
          to="/" 
          className="flex items-center gap-2.5 group transition-transform duration-200 active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:border-amber-400 group-hover:shadow-[0_0_15px_rgba(229,184,105,0.3)] transition-all">
            <Search className="w-5 h-5 transition-transform group-hover:scale-110" />
          </div>
          <div>
            <span className="font-serif tracking-wider font-bold text-lg text-gray-100 group-hover:text-amber-400 transition-colors">
              AI MYSTERY <span className="text-amber-400 font-sans font-light">ROOM</span>
            </span>
            <span className="block text-[10px] tracking-widest text-gray-400 uppercase font-mono">
              Detective Intelligence v1.0
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-3">
          <Link
            to="/"
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isActive('/')
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-detective-800/40'
            }`}
          >
            Home
          </Link>

          <Link
            to="/create"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-900/20 hover:shadow-amber-500/20 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>New Case</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

