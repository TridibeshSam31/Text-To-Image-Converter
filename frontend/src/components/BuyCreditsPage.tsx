import React, { useState } from 'react';
import { ArrowLeft, Check, Sparkles, AlertCircle, CreditCard, Loader2, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createRazorpayOrderApi, verifyRazorpayApi } from '../services/api';
import type { CreditPlan } from '../types';

interface BuyCreditsPageProps {
  onNavigate: (view: 'landing' | 'studio' | 'buy') => void;
  onOpenAuth: () => void;
}

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

export const BuyCreditsPage: React.FC<BuyCreditsPageProps> = ({ onNavigate, onOpenAuth }) => {
  const { token, user, isAuthenticated, refreshCredits } = useAuth();
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

      const RazorpayClass = (window as unknown as { Razorpay?: new (options: Record<string, unknown>) => { open: () => void } }).Razorpay;

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
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature?: string }) => {
          try {
            setProcessingPlanId(plan.id);
            const verifyRes = await verifyRazorpayApi(response.razorpay_order_id, token);
            if (verifyRes.success || verifyRes.sucess) {
              setSuccessMessage(`Payment confirmed! ${plan.credits.toLocaleString()} credits have been added to your account.`);
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
    <div className="landing-container animate-fade-in" style={{ paddingBottom: '4rem' }}>
      {/* Navigation Breadcrumb */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          onClick={() => onNavigate('landing')}
          className="btn-editorial"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <ArrowLeft size={14} />
          <span>Back to Overview</span>
        </button>
        {isAuthenticated && (
          <button
            onClick={() => onNavigate('studio')}
            className="btn-editorial"
          >
            <span>Open Studio</span>
          </button>
        )}
      </div>

      {/* Editorial Header */}
      <section className="landing-hero" style={{ padding: '2rem 0 3rem 0' }}>
        <div className="hero-kicker">
          <CreditCard size={12} style={{ display: 'inline', marginRight: '4px' }} />
          <span>STUDIO CREDIT RESERVES</span>
        </div>

        <h1 className="hero-headline" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>
          Transparent, pay-as-you-synthesize credit packs.
        </h1>

        <p className="hero-subhead" style={{ maxWidth: '640px' }}>
          Each credit yields 1 high-resolution diffusion synthesis with Clipdrop AI. No recurring monthly subscriptions, no expiring quotas. Your balance stays active indefinitely.
        </p>

        {errorMessage && (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem 1.25rem',
              borderRadius: '6px',
              background: '#FFF5F5',
              border: '1px solid #FEB2B2',
              color: '#C53030',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              maxWidth: '680px',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem 1.25rem',
              borderRadius: '6px',
              background: '#F0FFF4',
              border: '1px solid #9AE6B4',
              color: '#276749',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              maxWidth: '680px',
            }}
          >
            <Check size={18} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}
      </section>

      {/* Pricing Cards Grid */}
      <section style={{ margin: '1rem 0 4rem 0' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            alignItems: 'stretch',
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
                  border: isPopular ? '2px solid var(--color-cobalt)' : '1px solid var(--color-ink-border)',
                  background: 'var(--color-paper-elevated)',
                  borderRadius: '8px',
                  padding: '2rem 1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: isPopular ? '0 12px 32px rgba(0, 71, 255, 0.08)' : '0 2px 8px rgba(0,0,0,0.02)',
                }}
              >
                {plan.badge && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-12px',
                      right: '20px',
                      background: isPopular ? 'var(--color-cobalt)' : 'var(--color-ink)',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '999px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {plan.badge}
                  </div>
                )}

                <div>
                  <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem', fontWeight: 600, color: 'var(--color-ink)' }}>
                    {plan.name} Tier
                  </h2>

                  <div style={{ margin: '1rem 0' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}>
                      &#8377;{plan.amount}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-ink-muted)', marginLeft: '0.45rem' }}>
                      INR / one-time
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: 'var(--color-cobalt)',
                      background: 'var(--color-cobalt-soft)',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <Sparkles size={15} />
                    <span>{plan.credits.toLocaleString()} Studio Credits</span>
                  </div>

                  <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.9rem', color: 'var(--color-ink-muted)', lineHeight: 1.55 }}>
                    {plan.description}
                  </p>

                  <ul style={{ listStyle: 'none', padding: 0, margin: '1.5rem 0 0 0', display: 'flex', flexDirection: 'column', gap: '0.65rem', borderTop: '1px solid var(--color-ink-border)', paddingTop: '1.25rem', fontSize: '0.85rem', color: 'var(--color-ink)' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Check size={14} color="var(--color-cobalt)" />
                      <span>{plan.credits} Lossless 1024px PNGs</span>
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
                      fontSize: '0.95rem',
                      cursor: processingPlanId ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={16} className="spinning" />
                        <span>Connecting to Gateway...</span>
                      </>
                    ) : !isAuthenticated ? (
                      <span>Sign In to Buy (&#8377;{plan.amount})</span>
                    ) : (
                      <span>Acquire for &#8377;{plan.amount}</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trust & Guarantee Section */}
      <section
        style={{
          border: '1px solid var(--color-ink-border)',
          background: 'var(--color-paper-muted)',
          borderRadius: '8px',
          padding: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--color-ink)', fontWeight: 600 }}>
            <ShieldCheck size={18} color="var(--color-cobalt)" />
            <span>Secured via Razorpay API</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-ink-muted)', lineHeight: 1.5 }}>
            Enterprise TLS encryption. Supports all major UPI apps (GPay, PhonePe, Paytm), Debit &amp; Credit Cards, and NetBanking.
          </p>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--color-ink)', fontWeight: 600 }}>
            <Zap size={18} color="var(--color-cobalt)" />
            <span>Instant Balance Delivery</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-ink-muted)', lineHeight: 1.5 }}>
            Upon gateway confirmation, the server validates the cryptographic order signature and increments your MongoDB ledger immediately.
          </p>
        </div>
      </section>
    </div>
  );
};
