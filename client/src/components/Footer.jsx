import React from 'react';
import { Shield, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#262d3d]/60 bg-[#080a0f] py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-500/70" />
          <span>AI Mystery Room • Powered by Google Gemini API & Mongoose</span>
        </div>
        <div className="flex items-center gap-4 text-gray-400 font-mono">
          <span>Zero Spoilers Guaranteed</span>
          <span>•</span>
          <span>Dynamic Scoring Engine</span>
        </div>
      </div>
    </footer>
  );
}

