import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, CheckCircle2, Sparkles, BookOpen, Clock, X, ChevronRight, Check } from 'lucide-react';

export function NotificationBell({ onOpenQuestion, onOpenEvaluation }) {
  const { notifications = [], markNotificationRead, markAllNotificationsRead, language } = useApp();
  const isHi = language === 'hi';

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notif) => {
    markNotificationRead(notif.id);
    setOpen(false);

    if (notif.type === 'copy_evaluated' || notif.type === 'evaluation') {
      onOpenEvaluation?.(notif.resultId);
    } else if (notif.type === 'new_question' || notif.type === 'question') {
      onOpenQuestion?.(notif.questionId);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl glass-card-clean border transition-all hover:border-blue-400"
        style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}
        title={isHi ? 'सूचनाएं (Notifications)' : 'Notifications'}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse shadow-md">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <>
          {/* Mobile backdrop to easily dismiss */}
          <div
            className="sm:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-xs"
            onClick={() => setOpen(false)}
          />

          <div
            className="fixed inset-x-3 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-96 max-w-lg mx-auto sm:mx-0 rounded-3xl border shadow-2xl overflow-hidden z-50 animate-fadeIn flex flex-col"
            style={{
              maxHeight: 'calc(100vh - 90px)',
              background: 'var(--card-bg)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderColor: 'var(--glass-border)',
              color: 'var(--text-primary)'
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b shrink-0"
              style={{ borderColor: 'var(--glass-border)', background: 'var(--nav-bg)' }}
            >
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" style={{ color: 'rgb(var(--accent))' }} />
                <span className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                  {isHi ? 'सूचनाएं एवं अलर्ट' : 'Notifications & Alerts'}
                </span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: 'rgb(var(--accent)/0.18)', color: 'rgb(var(--accent))' }}>
                    {unreadCount} {isHi ? 'नए' : 'new'}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    className="text-[10px] font-bold hover:underline flex items-center gap-1"
                    style={{ color: 'rgb(var(--accent))' }}
                  >
                    <Check className="w-3 h-3" /> {isHi ? 'सभी पढ़ें' : 'Mark all read'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  title={isHi ? 'बंद करें' : 'Close'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

          {/* Notifications List */}
          <div className="overflow-y-auto custom-scroll divide-y flex-1" style={{ borderColor: 'var(--glass-border)' }}>
            {notifications.length === 0 ? (
              <div className="text-center py-8 space-y-1 text-xs opacity-75 font-medium" style={{ color: 'var(--text-secondary)' }}>
                <Bell className="w-8 h-8 mx-auto opacity-30 mb-1" />
                <p className="m-0">{isHi ? 'कोई नई सूचना नहीं है।' : 'No notifications yet.'}</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all hover:bg-black/5 dark:hover:bg-white/5 ${
                    !n.read ? 'bg-blue-500/5' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-sm font-bold ${
                      n.type === 'copy_evaluated'
                        ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30'
                        : n.type === 'teacher_submission'
                        ? 'bg-purple-500/20 text-purple-600 border border-purple-500/30'
                        : 'bg-blue-500/20 text-blue-600 border border-blue-500/30'
                    }`}
                  >
                    {n.type === 'copy_evaluated' ? '✅' : n.type === 'teacher_submission' ? '👨‍🏫' : '📌'}
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-black truncate" style={{ color: 'var(--text-primary)' }}>
                        {isHi && n.titleHi ? n.titleHi : n.title}
                      </span>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] leading-relaxed m-0 line-clamp-2 font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {n.message}
                    </p>

                    <div className="text-[9px] font-mono opacity-60 pt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </>
    )}
  </div>
);
}
