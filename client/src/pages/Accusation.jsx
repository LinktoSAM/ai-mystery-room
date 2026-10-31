import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Check, 
  ArrowLeft, 
  Loader2, 
  Lock,
  UserCheck
} from 'lucide-react';
import { caseApi } from '../services/api';

export default function Accusation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [selectedSuspectId, setSelectedSuspectId] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCase() {
      try {
        setLoading(true);
        const data = await caseApi.getCase(id);
        if (data.playerProgress?.status === 'resolved') {
          navigate(`/case/${id}/result`);
          return;
        }
        setCaseData(data);
      } catch (err) {
        console.error('Failed to load case:', err);
        setError(err.response?.data?.error || 'Failed to load case data.');
      } finally {
        setLoading(false);
      }
    }
    fetchCase();
  }, [id, navigate]);

  const handleSubmitAccusation = async (e) => {
    e.preventDefault();
    if (!selectedSuspectId) {
      alert('Please select a suspect before submitting your accusation.');
      return;
    }
    if (!confirmed) {
      alert('Please confirm that you understand this accusation is final and irreversible.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await caseApi.submitAccusation(id, selectedSuspectId);
      navigate(`/case/${id}/result`);
    } catch (err) {
      console.error('Failed to submit accusation:', err);
      setError(err.response?.data?.error || 'Failed to submit accusation.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
        <p className="font-mono text-sm text-gray-400">Summoning suspects for interrogation line-up...</p>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-serif font-bold text-gray-100">Unable to Proceed to Accusation</h2>
        <p className="text-gray-400 text-sm">{error || 'Case not found.'}</p>
        <Link
          to={`/case/${id}`}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-detective-800 text-gray-200 text-sm hover:bg-detective-700 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Investigation</span>
        </Link>
      </div>
    );
  }

  const selectedSuspect = caseData.suspects.find(s => s._id === selectedSuspectId);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Top back navigation */}
      <div>
        <Link
          to={`/case/${id}`}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-amber-400 font-mono transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Crime Scene & Clues</span>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>FINAL INTERROGATION & ACCUSATION</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-gray-100">
          Name the True Culprit
        </h1>
        <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
          Review the suspects carefully. Your deduction will seal the case and calculate your final detective score.
        </p>
      </div>

      {/* Warning Box */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/20 border border-amber-500/40 text-amber-200/90 text-sm flex items-start gap-3.5">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-amber-300">Irreversible Action:</span>
          <p className="text-xs text-amber-200/80 leading-relaxed">
            Once submitted, your accusation cannot be changed. The backend will reveal the true mastermind, explain the forensic evidence, and record your final clearance ranking.
          </p>
        </div>
      </div>

      {/* Suspects Lineup Selection */}
      <div className="space-y-4">
        <h2 className="text-sm font-mono uppercase tracking-wider text-gray-400 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-amber-400" />
          Select Prime Suspect:
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          {caseData.suspects.map((suspect, idx) => {
            const isSelected = selectedSuspectId === suspect._id;
            return (
              <div
                key={suspect._id}
                onClick={() => setSelectedSuspectId(suspect._id)}
                className={`cursor-pointer p-5 rounded-2xl border transition-all relative ${
                  isSelected
                    ? 'bg-rose-950/20 border-rose-500/80 shadow-[0_0_20px_rgba(201,59,59,0.25)] ring-1 ring-rose-500'
                    : 'bg-noir-card border-[#262d3d] hover:border-gray-500'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">
                      Suspect #{idx + 1}
                    </span>
                    <h3 className="font-serif font-bold text-lg text-gray-100">
                      {suspect.name}
                    </h3>
                  </div>

                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                    isSelected 
                      ? 'bg-rose-500 border-rose-400 text-white' 
                      : 'border-[#262d3d] text-transparent'
                  }`}>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-300 font-sans mt-3">
                  <div>
                    <span className="text-[10px] font-mono text-gray-400 uppercase block">Background:</span>
                    <p className="line-clamp-2">{suspect.background}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-amber-400/80 uppercase block">Motive:</span>
                    <p className="line-clamp-2">{suspect.motive}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation and Submit */}
      <form onSubmit={handleSubmitAccusation} className="space-y-6 pt-4">
        {/* Checkbox confirmation */}
        <label className="flex items-center gap-3 p-4 rounded-xl bg-noir-card border border-[#262d3d] cursor-pointer hover:border-gray-600 transition-colors">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500/50 bg-[#0b0d13] border-[#262d3d]"
          />
          <span className="text-xs sm:text-sm text-gray-300 font-medium select-none">
            I swear by my detective honor that this is my final, deliberate accusation.
          </span>
        </label>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!selectedSuspectId || !confirmed || submitting}
          className="w-full py-4 rounded-xl font-bold text-base bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-lg shadow-rose-900/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Validating Deduction with Headquarters...</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-5 h-5" />
              <span>
                Submit Accusation: {selectedSuspect ? selectedSuspect.name : 'Select a Suspect'}
              </span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

