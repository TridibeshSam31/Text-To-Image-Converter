import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User as UserIcon, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'signin' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'signin',
}) => {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>(initialTab);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
    setErrorMessage(null);
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (activeTab === 'signin') {
        const res = await login(email.trim(), password);
        if (res.success) {
          onClose();
        } else {
          setErrorMessage(res.message || 'Login failed.');
        }
      } else {
        if (!name.trim()) {
          setErrorMessage('Please enter your name.');
          setIsSubmitting(false);
          return;
        }
        const res = await register(name.trim(), email.trim(), password);
        if (res.success) {
          onClose();
        } else {
          setErrorMessage(res.message || 'Registration failed.');
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'Unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {activeTab === 'signin' ? 'Studio Authentication' : 'Create Studio Account'}
          </h2>
          <button
            onClick={onClose}
            className="btn-close-modal"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-tabs">
            <button
              type="button"
              className={`form-tab ${activeTab === 'signin' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('signin');
                setErrorMessage(null);
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`form-tab ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('register');
                setErrorMessage(null);
              }}
            >
              Register
            </button>
          </div>

          {errorMessage && (
            <div className="form-error-alert">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                <AlertCircle size={15} />
                <span>Backend Response Notice</span>
              </div>
              <div style={{ marginTop: 4, fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                {errorMessage}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeTab === 'register' && (
              <div className="form-field">
                <label className="form-label" htmlFor="register-name">
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="register-name"
                    type="text"
                    required
                    className="form-input"
                    style={{ width: '100%', paddingLeft: '2rem' }}
                    placeholder="e.g. Johannes Vermeer"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <UserIcon
                    size={14}
                    style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ink-muted)' }}
                  />
                </div>
              </div>
            )}

            <div className="form-field">
              <label className="form-label" htmlFor="auth-email">
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="auth-email"
                  type="email"
                  required
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '2rem' }}
                  placeholder="artist@studio.design"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail
                  size={14}
                  style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ink-muted)' }}
                />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="auth-password">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="auth-password"
                  type="password"
                  required
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '2rem' }}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock
                  size={14}
                  style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ink-muted)' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-editorial btn-editorial-primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', justifyContent: 'center' }}
            >
              {isSubmitting
                ? 'Communicating with Server...'
                : activeTab === 'signin'
                ? 'Sign In to Imagify'
                : 'Create Account & Claim 5 Credits'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
