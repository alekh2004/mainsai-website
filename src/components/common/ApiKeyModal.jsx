import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Key, CheckCircle, ExternalLink, X, AlertCircle } from 'lucide-react';

export function ApiKeyModal({ isOpen, onClose }) {
  const { apiKey, updateApiKey } = useAuth();
  const [tempKey, setTempKey] = useState(apiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    updateApiKey(tempKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md glass-panel rounded-2xl p-6 border border-white/20 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white m-0">Gemini AI API Settings</h3>
            <p className="text-xs text-gray-400 m-0">Connect your Google Gemini Key for live AI evaluation</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-mono tracking-wider"
            />
            <p className="text-[11px] text-gray-400 mt-1 flex items-center justify-between">
              <span>Leave blank to use pre-configured Smart Demo AI</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
              >
                Get Free Key <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-xs text-cyan-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              Your API key is stored securely in your local browser storage (`localStorage`) and is never uploaded to external third-party servers.
            </span>
          </div>

          {savedSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-center gap-2 font-medium">
              <CheckCircle className="w-4 h-4" /> API Key saved successfully!
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => { setTempKey(''); updateApiKey(''); }}
              className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition-all"
            >
              Reset to Demo Key
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl gradient-button-primary text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all"
            >
              Save API Key
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
