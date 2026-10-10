import React from 'react';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, User as UserIcon, LogOut, Activity } from 'lucide-react';

interface HeaderProps {
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuth }) => {
  const { user, credits, isAuthenticated, isLoadingCredits, logout, refreshCredits } = useAuth();

  return (
    <header className="studio-header">
      <div className="header-inner">
        <div className="brand-section">
          <a href="/" className="brand-title">
            IMAGIFY
          </a>
          <span className="brand-badge">EDITION 1.0 // STUDIO</span>
        </div>

        <div className="header-actions">
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
