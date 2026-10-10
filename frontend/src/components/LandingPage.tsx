import React, { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  Sliders,
  Layers,
  Download,
  Check,
  AlertCircle,
  CreditCard,
  Loader2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createRazorpayOrderApi, verifyRazorpayApi } from '../services/api';
import type { CreditPlan } from '../types';

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

const CREDIT_PLANS: CreditPlan[] = [
  {
    id: 'Basic',
    name: 'Basic',
    credits: 100,
    amount: 10,
    description: 'Perfect for quick prompt trials, exploratory iterations, and personal concept generation.',
  },
  {
    id: 'Advanced',
    name: 'Advanced',
    credits: 500,
    amount: 50,
    description: 'Our most popular tier. Built for dedicated creators running iterative series with precision.',
    badge: 'POPULAR',
  },
  {
    id: 'Business',
    name: 'Business',
    credits: 5000,
    amount: 250,
    description: 'High-throughput studio allocation for extensive production runs and commercial projects.',
    badge: 'BEST VALUE',
  },
];

interface LandingPageProps {
  onEnterStudio: () => void;
  onSelectPromptAndEnter: (prompt: string) => void;
  onOpenAuth: () => void;
  onNavigateBuy?: () => void;
  isAuthenticated: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterStudio,
  onSelectPromptAndEnter,
  onOpenAuth,
  isAuthenticated,
}) => {
  const { token, user, refreshCredits } = useAuth();
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectPlan = async (plan: CreditPlan) => {
    if (!isAuthenticated || !token) {
      onOpenAuth();
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setProcessingPlanId(plan.id);

    try {
      const orderRes = await createRazorpayOrderApi(plan.id, token);

      if (!orderRes.success && !orderRes.sucess) {
        setErrorMessage(orderRes.message || 'Failed to create payment order on backend.');
        setProcessingPlanId(null);
        return;
      }

      const order = orderRes.order;
      const keyId = orderRes.key;

      if (!order || !keyId) {
        setErrorMessage('Order created but payment gateway details were incomplete.');
        setProcessingPlanId(null);
        return;
      }

      const RazorpayClass = (
        window as unknown as {
          Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
        }
      ).Razorpay;

      if (!RazorpayClass) {
        setErrorMessage('Razorpay checkout SDK failed to load. Please verify your connection.');
        setProcessingPlanId(null);
        return;
      }

      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'IMAGIFY STUDIO',
        description: `${plan.name} Pack — ${plan.credits} Image Generation Credits`,
        order_id: order.id,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#0047FF',
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature?: string;
        }) => {
          try {
            setProcessingPlanId(plan.id);
            const verifyRes = await verifyRazorpayApi(response.razorpay_order_id, token);
            if (verifyRes.success || verifyRes.sucess) {
              setSuccessMessage(
                `Payment confirmed! ${plan.credits.toLocaleString()} credits have been added to your account.`
              );
              await refreshCredits();
            } else {
              setErrorMessage(verifyRes.message || 'Payment verification failed.');
            }
          } catch (err: unknown) {
            const error = err as Error;
            setErrorMessage(error.message || 'Verification failed after payment.');
          } finally {
            setProcessingPlanId(null);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessingPlanId(null);
          },
        },
      };

      const razorpayInstance = new RazorpayClass(options);
      razorpayInstance.open();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'Unexpected payment error occurred.');
      setProcessingPlanId(null);
    }
  };

  return (
    <div className="landing-container animate-fade-in">
      {/* Editorial Hero Section */}
      <section className="landing-hero" aria-label="Introduction">
        <div className="hero-kicker">
          <span>LATENT DIFFUSION SYNTHESIS</span>
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

          <button
            onClick={scrollToPricing}
            className="btn-editorial btn-hero-secondary"
            title="View Pricing and Credit Packs below"
          >
            <span>Credit Packs (from &#8377;10) &darr;</span>
          </button>

          {!isAuthenticated && (
            <button
              onClick={onOpenAuth}
              className="btn-editorial"
              style={{ fontSize: '0.85rem' }}
            >
              <span>Sign In / 5 Free Credits</span>
            </button>
          )}
        </div>

        <div className="hero-spec-strip">
          <div className="spec-strip-item">
            <span className="spec-bullet">&bull;</span>
            <span>MODEL: CLIPDROP DIFFUSION</span>
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

      {/* Pricing / Credit Reserves Section Directly on Landing Page */}
      <section
        id="pricing"
        className="landing-pricing-section"
        aria-label="Studio Credit Reserves and Pricing"
        style={{
          padding: '4.5rem 0 3rem 0',
          borderTop: '1px solid var(--color-ink-border)',
        }}
      >
        {/* Clean, vertically aligned header */}
        <div style={{ marginBottom: '2.5rem', textAlign: 'left', maxWidth: '780px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.25rem 0.65rem', background: 'var(--color-cobalt-soft)', color: 'var(--color-cobalt)', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.85rem' }}>
            <CreditCard size={13} />
            <span>STUDIO CREDIT RESERVES</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 400, margin: '0 0 0.85rem 0', color: 'var(--color-ink)', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            Transparent, pay-as-you-synthesize credit packs.
          </h2>
          <p style={{ margin: 0, color: 'var(--color-ink-muted)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '640px' }}>
            Each credit yields 1 lossless raster with Clipdrop Latent Diffusion. No recurring subscriptions, no expiring quotas. Your balance stays active indefinitely.
          </p>
        </div>

        {errorMessage && (
          <div
            style={{
              marginBottom: '1.5rem',
              padding: '0.85rem 1.25rem',
              borderRadius: '6px',
              background: '#FFF5F5',
              border: '1px solid #FEB2B2',
              color: '#C53030',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              maxWidth: '700px',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div
            style={{
              marginBottom: '1.5rem',
              padding: '0.85rem 1.25rem',
              borderRadius: '6px',
              background: '#F0FFF4',
              border: '1px solid #9AE6B4',
              color: '#276749',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              maxWidth: '700px',
            }}
          >
            <Check size={18} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            alignItems: 'stretch',
            marginBottom: '2.5rem',
          }}
        >
          {CREDIT_PLANS.map((plan) => {
            const isProcessing = processingPlanId === plan.id;
            const isPopular = plan.badge === 'POPULAR';

            return (
              <div
                key={plan.id}
                style={{
                  position: 'relative',
                  border: isPopular ? '2px solid var(--color-cobalt)' : '1px solid rgba(0, 0, 0, 0.12)',
                  background: '#ffffff',
                  borderRadius: '12px',
                  padding: '2.25rem 1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: isPopular
                    ? '0 16px 36px rgba(0, 71, 255, 0.12)'
                    : '0 4px 20px rgba(0, 0, 0, 0.04)',
                }}
              >
                {plan.badge && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-13px',
                      right: '20px',
                      background: isPopular ? 'var(--color-cobalt)' : '#111111',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      padding: '0.28rem 0.75rem',
                      borderRadius: '999px',
                      textTransform: 'uppercase',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                  >
                    {plan.badge}
                  </div>
                )}

                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.35rem', fontWeight: 600, color: '#111111' }}>
                    {plan.name} Tier
                  </h3>

                  <div style={{ margin: '0.85rem 0' }}>
                    <span style={{ fontSize: '2.6rem', fontWeight: 700, color: '#111111', fontFamily: 'var(--font-sans)' }}>
                      &#8377;{plan.amount}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: '#666666', marginLeft: '0.45rem' }}>
                      INR / one-time
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      color: 'var(--color-cobalt)',
                      background: 'rgba(0, 71, 255, 0.08)',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <Sparkles size={14} />
                    <span>{plan.credits.toLocaleString()} Studio Credits</span>
                  </div>

                  <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.88rem', color: '#555555', lineHeight: 1.55 }}>
                    {plan.description}
                  </p>

                  <ul style={{ listStyle: 'none', padding: 0, margin: '1.25rem 0 0 0', display: 'flex', flexDirection: 'column', gap: '0.65rem', borderTop: '1px solid #F0F0F0', paddingTop: '1.25rem', fontSize: '0.85rem', color: '#222222' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Check size={14} color="var(--color-cobalt)" />
                      <span>{plan.credits.toLocaleString()} Lossless 1024px PNGs</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Check size={14} color="var(--color-cobalt)" />
                      <span>Clipdrop Latent Diffusion model</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Check size={14} color="var(--color-cobalt)" />
                      <span>Never-expiring balance</span>
                    </li>
                  </ul>
                </div>

                <div style={{ marginTop: '2rem' }}>
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={Boolean(processingPlanId)}
                    className={isPopular ? 'btn-editorial btn-cobalt' : 'btn-editorial btn-editorial-primary'}
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      fontWeight: 600,
                      padding: '0.75rem 1.25rem',
                      fontSize: '0.92rem',
                      cursor: processingPlanId ? 'not-allowed' : 'pointer',
                      borderRadius: '6px',
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={16} className="spinning" />
                        <span>Connecting to Gateway...</span>
                      </>
                    ) : !isAuthenticated ? (
                      <span>Sign In to Acquire (&#8377;{plan.amount})</span>
                    ) : (
                      <span>Acquire for &#8377;{plan.amount}</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security & Instant Delivery Strip (Pure White Card) */}
        <div
          style={{
            border: '1px solid rgba(0, 0, 0, 0.1)',
            background: '#ffffff',
            borderRadius: '10px',
            padding: '1.5rem 1.75rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <ShieldCheck size={20} color="var(--color-cobalt)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem', color: '#111111', marginBottom: '0.2rem' }}>
                Razorpay TLS Secured
              </strong>
              <span style={{ fontSize: '0.82rem', color: '#666666', lineHeight: 1.45 }}>
                UPI (GPay/PhonePe/Paytm), Credit &amp; Debit Cards, NetBanking accepted
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <Zap size={20} color="var(--color-cobalt)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ display: 'block', fontSize: '0.9rem', color: '#111111', marginBottom: '0.2rem' }}>
                Instant Ledger Credit
              </strong>
              <span style={{ fontSize: '0.82rem', color: '#666666', lineHeight: 1.45 }}>
                Balance added directly to your MongoDB ledger upon cryptographic verification
              </span>
            </div>
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
