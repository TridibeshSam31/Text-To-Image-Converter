import { ArrowUpRight, Lock, Sparkles, Terminal, ShieldCheck } from 'lucide-react';

interface FooterProps {
  currentView: 'landing' | 'studio' | 'buy';
  onNavigate: (view: 'landing' | 'studio' | 'buy') => void;
  isAuthenticated: boolean;
  onOpenAuth: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  currentView,
  onNavigate,
  isAuthenticated,
  onOpenAuth,
}) => {
  const handleStudioClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onOpenAuth();
    } else {
      onNavigate('studio');
    }
  };

  const handleOverviewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate('landing');
  };

  return (
    <footer className="enhanced-studio-footer" aria-label="Studio Footer">
      <div className="footer-inner">
        {/* Top Grid */}
        <div className="footer-columns-grid">
          {/* Column 1: Brand & Manifesto */}
          <div className="footer-col brand-col">
            <div className="footer-brand-title">IMAGIFY</div>
            <p className="footer-manifesto">
              An editorial image-making studio crafted for deliberate natural language synthesis.
              Formulate precise visual compositions and render high-resolution diffusion artwork
              without bloated interfaces.
            </p>
            <div className="footer-badge-strip">
              <span className="footer-engine-badge">
                <Terminal size={12} />
                CLIPDROP PIPELINE
              </span>
              <span className="footer-engine-badge">
                <ShieldCheck size={12} />
                24-BIT PNG LOSSLESS
              </span>
            </div>
          </div>

          {/* Column 2: Studio Navigation */}
          <div className="footer-col">
            <div className="footer-col-header">WORKSPACE</div>
            <ul className="footer-links-list">
              <li>
                <button
                  onClick={handleOverviewClick}
                  className={`footer-nav-btn ${currentView === 'landing' ? 'active' : ''}`}
                >
                  <span>Overview &amp; Gallery</span>
                </button>
              </li>
              <li>
                <button
                  onClick={handleStudioClick}
                  className={`footer-nav-btn ${currentView === 'studio' ? 'active' : ''}`}
                >
                  <span>Studio Workspace</span>
                  {!isAuthenticated && <Lock size={12} color="var(--color-ink-faint)" />}
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('buy');
                  }}
                  className={`footer-nav-btn ${currentView === 'buy' ? 'active' : ''}`}
                >
                  <span>Credit Packs &amp; Pricing</span>
                </button>
              </li>
              <li>
                {!isAuthenticated ? (
                  <button onClick={onOpenAuth} className="footer-nav-btn">
                    <Sparkles size={12} color="var(--color-cobalt)" />
                    <span>Claim 5 Free Credits</span>
                  </button>
                ) : (
                  <span className="footer-static-item">Account Authenticated</span>
                )}
              </li>
            </ul>
          </div>

          {/* Column 3: Technical Specifications */}
          <div className="footer-col">
            <div className="footer-col-header">SPECIFICATIONS</div>
            <ul className="footer-specs-list">
              <li>
                <span className="spec-label">Diffusion Model:</span>
                <span className="spec-val">Clipdrop Latent Diffusion</span>
              </li>
              <li>
                <span className="spec-label">Prompt Ceiling:</span>
                <span className="spec-val">1,000 Characters</span>
              </li>
              <li>
                <span className="spec-label">Raster Delivery:</span>
                <span className="spec-val">Direct ArrayBuffer</span>
              </li>
              <li>
                <span className="spec-label">Starting Allotment:</span>
                <span className="spec-val">5 Credits / Account</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Repository & Engineering */}
          <div className="footer-col">
            <div className="footer-col-header">ENGINEERING &amp; REPO</div>
            <ul className="footer-links-list">
              <li>
                <a
                  href="https://github.com/TridibeshSam31/Text-To-Image-Converter"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-ext-link"
                >
                  <span>GitHub Repository</span>
                  <ArrowUpRight size={13} />
                </a>
              </li>
              <li>
                <span className="footer-static-item">Stack: React • Vite • Express 5</span>
              </li>
              <li>
                <span className="footer-static-item">Database: MongoDB Mongoose</span>
              </li>
              <li>
                <span className="footer-static-item">License: ISC Open Source</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-bottom-left">
            <span>&copy; {new Date().getFullYear()} IMAGIFY STUDIO.</span>
            <span className="footer-divider">//</span>
            <span>ALL RIGHTS RESERVED.</span>
            <span className="footer-divider">//</span>
            <span>DESIGNED WITH DELIBERATE EDITORIAL INTENTION.</span>
          </div>

          <div className="footer-bottom-right">
            <div className="system-live-pill">
              <span className="system-pulse-dot" />
              <span>STUDIO PIPELINE: ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
