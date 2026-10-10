import { ArrowRight, Sparkles, Sliders, Layers, Download } from 'lucide-react';

interface ShowcaseItem {
  title: string;
  category: string;
  prompt: string;
  meta: string;
  previewGradient: string;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    title: 'Brutalist Monolith in Morning Fog',
    category: 'Architecture',
    prompt: 'Monolithic raw concrete pavilion in dense morning mist, water reflection, 35mm monochrome photography, harsh raking light.',
    meta: '35mm Film • Monochrome • 1:1 Aspect',
    previewGradient: 'linear-gradient(135deg, #2b2b2b 0%, #4a4a4a 50%, #1a1a1a 100%)',
  },
  {
    title: 'Alpine Flora Botanical Specimen',
    category: 'Botanical',
    prompt: 'Detailed copperplate engraving of Alpine ferns and lichen, botanical archive specimen, parchment paper texture, fine hatching.',
    meta: 'Copperplate Engraving • Archival • Fine Hatching',
    previewGradient: 'linear-gradient(135deg, #3d3428 0%, #5c4e3c 50%, #292219 100%)',
  },
  {
    title: 'Baroque Still Life with Quince',
    category: 'Still Life',
    prompt: 'Still life with quince, unglazed terracotta vessel, dried flax and folded linen, dark moody Dutch chiaroscuro lighting.',
    meta: 'Oil on Canvas • Chiaroscuro • Warm Ochre',
    previewGradient: 'linear-gradient(135deg, #3b2010 0%, #61361b 50%, #1f1108 100%)',
  },
  {
    title: 'The Master Horologist',
    category: 'Portrait',
    prompt: 'Editorial medium portrait of an elderly watchmaker examining escapement gear with brass loupe, warm incandescent lamp, shallow depth of field.',
    meta: 'Editorial Portrait • Shallow DOF • 50mm Lens',
    previewGradient: 'linear-gradient(135deg, #1f2533 0%, #303b54 50%, #11151c 100%)',
  },
];

interface LandingPageProps {
  onEnterStudio: () => void;
  onSelectPromptAndEnter: (prompt: string) => void;
  onOpenAuth: () => void;
  isAuthenticated: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterStudio,
  onSelectPromptAndEnter,
  onOpenAuth,
  isAuthenticated,
}) => {
  return (
    <div className="landing-container animate-fade-in">
      {/* Editorial Hero Section */}
      <section className="landing-hero" aria-label="Introduction">
        <div className="hero-kicker">
          <span>LATENT DIFFUSION // STUDIO EDITION</span>
        </div>

        <h1 className="hero-headline">
          Words into vision. An intentional text-to-image studio.
        </h1>

        <p className="hero-subhead">
          Imagify is designed for creators who formulate prompts with deliberate care.
          Interfacing directly with high-resolution latent diffusion models, it provides
          an austere, responsive workspace free of superfluous dashboard clutter.
        </p>

        <div className="hero-cta-row">
          <button
            onClick={() => {
              if (!isAuthenticated) {
                onOpenAuth();
              } else {
                onEnterStudio();
              }
            }}
            className="btn-editorial btn-cobalt btn-hero-primary"
            aria-label="Enter studio and start generating images"
          >
            <span>Try Now &mdash; Enter Studio</span>
            <ArrowRight size={17} />
          </button>

          {!isAuthenticated && (
            <button
              onClick={onOpenAuth}
              className="btn-editorial btn-hero-secondary"
            >
              <span>Create Account (Claim 5 Credits)</span>
            </button>
          )}
        </div>

        <div className="hero-spec-strip">
          <div className="spec-strip-item">
            <span className="spec-bullet">&bull;</span>
            <span>MODEL: CLIPDROP DIFFUSION v1</span>
          </div>
          <div className="spec-strip-item">
            <span className="spec-bullet">&bull;</span>
            <span>PROMPT CAPACITY: 1,000 CHARACTERS</span>
          </div>
          <div className="spec-strip-item">
            <span className="spec-bullet">&bull;</span>
            <span>OUTPUT: LOSSLESS 24-BIT PNG</span>
          </div>
          <div className="spec-strip-item">
            <span className="spec-bullet">&bull;</span>
            <span>DEFAULT QUOTA: 5 INITIAL CREDITS</span>
          </div>
        </div>
      </section>

      {/* Showcase Grid Section */}
      <section className="landing-showcase-section" aria-label="Curated Art Direction">
        <div className="section-label-row">
          <div className="section-eyebrow">ART DIRECTION &amp; SYNTHESIS SAMPLES</div>
          <p className="section-note">
            Select any curation below to load its prompt directly into the studio workspace.
          </p>
        </div>

        <div className="showcase-cards-grid">
          {SHOWCASE_ITEMS.map((item, idx) => (
            <div key={idx} className="showcase-card">
              <div
                className="showcase-art-frame"
                style={{ background: item.previewGradient }}
              >
                <div className="frame-crosshair top-left" />
                <div className="frame-crosshair top-right" />
                <div className="frame-crosshair bottom-left" />
                <div className="frame-crosshair bottom-right" />
                <div className="frame-category-pill">{item.category}</div>
                <div className="frame-inner-overlay">
                  <span className="frame-title-text">{item.title}</span>
                </div>
              </div>

              <div className="showcase-card-body">
                <div className="showcase-card-meta">{item.meta}</div>
                <p className="showcase-card-prompt">&ldquo;{item.prompt}&rdquo;</p>
                
                <button
                  onClick={() => onSelectPromptAndEnter(item.prompt)}
                  className="btn-editorial showcase-try-btn"
                  title="Load this prompt into the studio canvas"
                >
                  <Sparkles size={13} color="var(--color-cobalt)" />
                  <span>Try this prompt in studio &rarr;</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Editorial Principles / Pillars */}
      <section className="landing-pillars-section" aria-label="Studio Principles">
        <div className="section-eyebrow" style={{ marginBottom: '1.5rem' }}>
          THE IMAGIFY WORKSPACE PRINCIPLES
        </div>

        <div className="pillars-grid">
          <div className="pillar-column">
            <div className="pillar-number">01</div>
            <div className="pillar-icon-row">
              <Sliders size={20} color="var(--color-cobalt)" />
              <h3 className="pillar-title">Meticulous Prompt Control</h3>
            </div>
            <p className="pillar-text">
              Fine-tune composition, lighting angles, surface grain, and optical depth with a 
              1,000-character ceiling. Live telemetry ensures your prompt stays within optimal model bounds.
            </p>
          </div>

          <div className="pillar-column">
            <div className="pillar-number">02</div>
            <div className="pillar-icon-row">
              <Layers size={20} color="var(--color-cobalt)" />
              <h3 className="pillar-title">Direct Diffusion Synthesis</h3>
            </div>
            <p className="pillar-text">
              Direct pipeline from text input to latent neural rasterization. Binary array buffers 
              are parsed and delivered cleanly without unnecessary compression or lossy intermediaries.
            </p>
          </div>

          <div className="pillar-column">
            <div className="pillar-number">03</div>
            <div className="pillar-icon-row">
              <Download size={20} color="var(--color-cobalt)" />
              <h3 className="pillar-title">Lightweight Creative Ledger</h3>
            </div>
            <p className="pillar-text">
              Preserve your iterative generations in a session gallery. Copy prompts, iterate on 
              compositions, and download high-resolution rasters directly to your local workstation.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Call to Action Section */}
      <section className="landing-cta-banner">
        <div className="cta-banner-inner">
          <div className="cta-banner-text">
            <h2 className="cta-banner-headline">
              Ready to explore latent image synthesis?
            </h2>
            <p className="cta-banner-sub">
              Enter the studio workspace and synthesize your first visual composition.
            </p>
          </div>

          <div className="cta-banner-actions">
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  onOpenAuth();
                } else {
                  onEnterStudio();
                }
              }}
              className="btn-editorial btn-cobalt btn-banner-try"
            >
              <span>Try Now &mdash; Enter Studio</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
