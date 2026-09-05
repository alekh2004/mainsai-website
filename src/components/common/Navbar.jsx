import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Sparkles, Key, ArrowLeft, Languages, LogOut, ShieldCheck, Lock, Check, X } from 'lucide-react';
import { NotificationBell } from './NotificationBell';

const FACULTY_PASSCODE = '1234';

export function Navbar({ onOpenApiKey, onOpenAdmin, onOpenTeacherQueue, onGoHome, onOpenQuestion, onOpenEvaluation, rightSlot }) {
  const { user, logout, switchRole } = useAuth();
  const { activeExam, setActiveExam, language, toggleLanguage } = useApp();
  const isHi = language === 'hi';

  const [showFacultyPinModal, setShowFacultyPinModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  const handleRoleButtonClick = () => {
    if (isTeacher) {
      onOpenTeacherQueue();
    } else {
      setPinInput('');
      setPinError('');
      setShowFacultyPinModal(true);
    }
  };

  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (pinInput === FACULTY_PASSCODE || pinInput === 'faculty2025' || pinInput === 'admin') {
      switchRole('teacher');
      setShowFacultyPinModal(false);
      onOpenTeacherQueue();
    } else {
      setPinError(isHi ? 'गलत शिक्षक पासकोड! डिफ़ॉल्ट कोड: 1234' : 'Invalid Faculty Passcode! Default PIN: 1234');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-header px-4 lg:px-8 py-3" style={{ color: 'var(--text-primary)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Title: Direct UPSC / BPSC (No extra Home button, no bulky symbol box) */}
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={onGoHome}>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black tracking-tight leading-none" style={{ color: 'var(--text-primary)' }}>
                  UPSC / BPSC
                </span>
                <span className="gradient-text text-xs sm:text-sm font-black hidden sm:inline">
                  Mains AI
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] opacity-75 m-0 font-medium hidden xs:block" style={{ color: 'var(--text-secondary)' }}>
                {isHi ? 'स्मार्ट AI मूल्यांकन' : 'Smart AI Evaluation'}
              </p>
            </div>
          </div>

          {/* Center: Exam Switcher */}
          <div className="hidden md:flex items-center p-1 glass-card-clean rounded-xl border" style={{ borderColor: 'var(--glass-border)' }}>
            <button
              onClick={() => setActiveExam('upsc')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                activeExam === 'upsc'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <span>🏛️</span>
              <span>UPSC Mains</span>
            </button>

            <button
              onClick={() => setActiveExam('bpsc')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                activeExam === 'bpsc'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <span>🦁</span>
              <span>BPSC Mains</span>
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {rightSlot}
            
            {/* Notification Bell */}
            <NotificationBell
              onOpenQuestion={onOpenQuestion}
              onOpenEvaluation={onOpenEvaluation}
            />

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-xl glass-card-clean border transition-all text-xs font-extrabold flex items-center gap-1.5"
              style={{ borderColor: 'var(--glass-border)', color: 'rgb(var(--accent))' }}
              title="Switch Language (Hindi / English)"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{isHi ? 'हिंदी' : 'EN'}</span>
            </button>

            {/* Dynamic Active Portal Badge (Toggles Role Switcher) */}
            {isTeacher ? (
              <button
                onClick={() => setShowProfileMenu(prev => !prev)}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95"
                style={{
                  background: 'rgba(147, 51, 234, 0.18)',
                  borderColor: 'rgba(147, 51, 234, 0.45)',
                  color: 'rgb(168, 85, 247)'
                }}
                title="Switch Role / Faculty Portal"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
                <span>{isHi ? 'शिक्षक' : 'Teacher'}</span>
              </button>
            ) : (
              <button
                onClick={() => setShowProfileMenu(prev => !prev)}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-all opacity-95 hover:opacity-100 active:scale-95"
                style={{
                  background: 'rgba(37, 99, 235, 0.12)',
                  borderColor: 'rgba(37, 99, 235, 0.35)',
                  color: 'rgb(37, 99, 235)'
                }}
                title="Switch Role / Student Mode"
              >
                <span>👨‍🎓</span>
                <span className="hidden sm:inline">{isHi ? 'छात्र मोड' : 'Student Mode'}</span>
              </button>
            )}

            {/* API Key (hidden on tiny screens to avoid crowding) */}
            <button
              onClick={onOpenApiKey}
              className="hidden sm:flex p-2 rounded-xl glass-card-clean border transition-all text-xs items-center gap-1.5 font-medium hover:border-blue-400"
              style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}
              title="Configure Gemini API Key"
            >
              <Key className="w-3.5 h-3.5 text-blue-500" />
            </button>

            {/* User Profile Avatar with Tap-Friendly Mobile Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(prev => !prev)}
                  className="flex items-center gap-1.5 sm:gap-2 p-1.5 px-2 rounded-xl glass-card-clean border text-left text-xs hover:border-blue-400 active:scale-95 transition-all"
                  style={{ borderColor: 'var(--glass-border)' }}
                  title="Account & Role Switcher"
                >
                  <span className="text-base leading-none">{user.avatar || (isTeacher ? '👨‍🏫' : '👨‍🎓')}</span>
                  <div className="hidden lg:block">
                    <div className="font-bold leading-tight truncate max-w-[100px]" style={{ color: 'var(--text-primary)' }}>{user.name}</div>
                    <div className="text-[10px] text-blue-600 dark:text-blue-400 capitalize font-extrabold">
                      {isTeacher ? 'Teacher' : 'Student'}
                    </div>
                  </div>
                </button>

                {/* Backdrop for mobile outside click */}
                {showProfileMenu && (
                  <div
                    className="fixed inset-0 z-40 bg-black/10"
                    onClick={() => setShowProfileMenu(false)}
                  />
                )}

                {/* Profile Dropdown — Works on both tap (mobile) and hover (desktop) */}
                <div
                  className={`absolute right-0 top-full mt-2 w-56 py-2 glass-card-clean rounded-2xl shadow-2xl border transition-all z-50 animate-fadeIn ${
                    showProfileMenu ? 'block' : 'hidden lg:group-hover:block'
                  }`}
                  style={{ background: 'var(--card-bg)', borderColor: 'var(--glass-border)' }}
                >
                  <div className="px-3 py-1 text-[10px] uppercase font-black opacity-60 tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    Switch Account Role
                  </div>
                  
                  {/* Switch to Student */}
                  <button
                    onClick={() => {
                      switchRole('student');
                      setShowProfileMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 text-xs flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-all ${!isTeacher ? 'text-blue-600 font-bold' : ''}`}
                    style={isTeacher ? { color: 'var(--text-primary)' } : {}}
                  >
                    <span className="flex items-center gap-2">
                      <span>👨‍🎓</span>
                      <span>{isHi ? 'छात्र मोड (Student)' : 'Student Mode'}</span>
                    </span>
                    {!isTeacher && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                  
                  {/* Switch to Teacher (Protected with PIN) */}
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (isTeacher) {
                        onOpenTeacherQueue();
                      } else {
                        setPinInput('');
                        setPinError('');
                        setShowFacultyPinModal(true);
                      }
                    }}
                    className={`w-full text-left px-3 py-2.5 text-xs flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-all ${isTeacher ? 'text-purple-600 font-bold' : ''}`}
                    style={!isTeacher ? { color: 'var(--text-primary)' } : {}}
                  >
                    <span className="flex items-center gap-2">
                      <span>👨‍🏫</span>
                      <span>{isHi ? 'शिक्षक मोड 🔒' : 'Teacher Mode 🔒'}</span>
                    </span>
                    {isTeacher && <Check className="w-3.5 h-3.5 text-purple-600" />}
                  </button>

                  <div className="my-1 border-t" style={{ borderColor: 'var(--glass-border)' }} />

                  {/* API Key in menu for mobile */}
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenApiKey();
                    }}
                    className="sm:hidden w-full text-left px-3 py-2 text-xs hover:bg-black/5 dark:hover:bg-white/5 transition-all font-medium flex items-center gap-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Key className="w-3.5 h-3.5 text-blue-500" />
                    <span>Gemini API Key</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2.5 text-xs text-rose-500 hover:bg-rose-500/10 transition-all font-bold flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{isHi ? 'लॉगआउट' : 'Sign Out'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Faculty PIN Security Modal */}
      {showFacultyPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fadeIn">
          <div
            className="relative w-full max-w-sm glass-card-clean rounded-3xl p-6 border shadow-2xl space-y-4"
            style={{ background: 'var(--card-bg)', borderColor: 'var(--glass-border)' }}
          >
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--glass-border)' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-600 flex items-center justify-center font-bold">
                  <Lock className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-black m-0" style={{ color: 'var(--text-primary)' }}>
                  {isHi ? 'शिक्षक सत्यापन' : 'Faculty Passcode'}
                </h4>
              </div>
              <button
                onClick={() => setShowFacultyPinModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-medium m-0 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {isHi
                ? '🔒 यह पोर्टल केवल अधिकृत शिक्षकों के लिए है। शिक्षक मोड अनलॉक करने के लिए पिन दर्ज करें:'
                : '🔒 This portal is restricted to faculty examiners. Enter your PIN to unlock teacher mode:'}
            </p>

            <form onSubmit={handleVerifyPin} className="space-y-3">
              <input
                type="password"
                autoFocus
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                placeholder="Enter Faculty PIN (Default: 1234)"
                className="w-full px-4 py-2.5 rounded-xl glass-input-clean text-center text-sm font-mono tracking-widest font-black"
              />

              {pinError && (
                <div className="text-[11px] font-bold text-rose-500 text-center">
                  {pinError}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowFacultyPinModal(false)}
                  className="w-1/2 py-2.5 rounded-xl glass-card-clean border text-xs font-bold"
                  style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}
                >
                  {isHi ? 'रद्द करें' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl btn-primary-clean text-xs font-black"
                >
                  {isHi ? 'अनलॉक करें' : 'Unlock Mode'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
