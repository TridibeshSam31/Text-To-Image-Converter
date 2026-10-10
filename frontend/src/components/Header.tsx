import React from 'react';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, User as UserIcon, LogOut, Activity, ArrowRight, Compass } from 'lucide-react';

interface HeaderProps {
  onOpenAuth: () => void;
  currentView: 'landing' | 'studio';
  onNavigate: (view: 'landing' | 'studio') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuth,
  currentView,
  onNavigate,
}) => {
  const { user, credits, isAuthenticated, isLoadingCredits, logout, refreshCredits } = useAuth();

  return (
    <header className="studio-header">
      <div className="header-inner">
        <div className="brand-section">
          <button
            onClick={() => onNavigate('landing')}
            className="brand-title"
            style={{ cursor: 'pointer', textAlign: 'left' }}
            title="Imagify Home"
          >
            IMAGIFY
          </button>
        </div>

        <div className="header-actions">
          {/* Navigation Toggle */}
          {currentView === 'landing' ? (
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  onOpenAuth();
                } else {
                  onNavigate('studio');
                }
              }}
              className="btn-editorial btn-cobalt"
              style={{ fontWeight: 600, padding: '0.45rem 0.95rem' }}
            >
              <span>Try Now &mdash; Studio</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={() => onNavigate('landing')}
              className="btn-editorial"
              title="Return to Overview &amp; Samples"
            >
              <Compass size={14} />
              <span>Overview</span>
            </button>
          )}

          {/* Credits Counter (if authenticated) */}
          {isAuthenticated && (
            <div className="credit-badge" title="Active balance in database">
              <Activity size={14} color="var(--color-cobalt)" />
              <span>
                {credits !== null ? `${credits} ${credits === 1 ? 'CREDIT' : 'CREDITS'}` : 'CREDITS'}
              </span>
              <button
                onClick={refreshCredits}
                disabled={isLoadingCredits}
                className={`credit-refresh-btn ${isLoadingCredits ? 'spinning' : ''}`}
                title="Refresh credit balance"
                aria-label="Refresh balance"
              >
                <RefreshCw size={13} />
              </button>
            </div>
          )}

          {/* Authentication State */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                className="btn-editorial"
                style={{ cursor: 'default', background: 'var(--color-paper-muted)' }}
              >
                <UserIcon size={14} />
                <span>{user?.name || 'Studio Member'}</span>
              </div>
              <button
                onClick={logout}
                className="btn-editorial"
                title="Sign out of Imagify"
                aria-label="Sign out"
              >
                <LogOut size={14} />
                <span>Exit</span>
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuth} className="btn-editorial btn-editorial-primary">
              <UserIcon size={14} />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
