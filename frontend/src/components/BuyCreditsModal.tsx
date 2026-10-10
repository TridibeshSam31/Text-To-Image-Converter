import React, { useState } from 'react';
import { X, Check, Sparkles, AlertCircle, CreditCard, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createRazorpayOrderApi, verifyRazorpayApi } from '../services/api';
import type { CreditPlan } from '../types';

interface BuyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export const BuyCreditsModal: React.FC<BuyCreditsModalProps> = ({ isOpen, onClose }) => {
  const { token, user, refreshCredits } = useAuth();
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPlan = async (plan: CreditPlan) => {
    if (!token) {
      setErrorMessage('Please sign in to purchase credits.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setProcessingPlanId(plan.id);

    try {
      const orderRes = await createRazorpayOrderApi(plan.id, token);

      if (!orderRes.success && !orderRes.sucess) {
        setErrorMessage(orderRes.message || 'Failed to create payment order.');
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

      // Check if window.Razorpay is loaded
      const RazorpayClass = (window as unknown as { Razorpay?: new (options: Record<string, unknown>) => { open: () => void } }).Razorpay;

      if (!RazorpayClass) {
        setErrorMessage('Razorpay SDK failed to load. Please verify your internet connection.');
        setProcessingPlanId(null);
        return;
      }

      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'IMAGIFY STUDIO',
        description: `${plan.name} Pack &mdash; ${plan.credits} Image Generation Credits`,
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
              setSuccessMessage(`Payment confirmed! ${plan.credits} credits have been deposited into your account.`);
              await refreshCredits();
              setTimeout(() => {
                onClose();
              }, 2200);
            } else {
              setErrorMessage(verifyRes.message || 'Payment verification failed. Please check your transaction history.');
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
      setErrorMessage(error.message || 'Unexpected payment gateway error occurred.');
      setProcessingPlanId(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-content animate-fade-in"
        style={{ maxWidth: '820px', width: '95%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.2rem 0.55rem', background: 'var(--color-cobalt-soft)', color: 'var(--color-cobalt)', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              <CreditCard size={12} />
              <span>Studio Credit Reserve</span>
            </div>
            <h2 className="modal-title" style={{ fontSize: '1.75rem', margin: 0 }}>
              Acquire Studio Credits
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn-close-modal"
            aria-label="Close credit purchase modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.25rem 1.5rem' }}>
          <p style={{ margin: '0 0 1rem 0', color: 'var(--color-ink-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
            Each credit yields 1 high-resolution diffusion synthesis with Clipdrop AI engine. Select a volume pack below.
          </p>

        {errorMessage && (
          <div
            className="editorial-alert alert-error"
            style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', borderRadius: '4px', background: '#FFF5F5', border: '1px solid #FED7D7', color: '#C53030', fontSize: '0.875rem' }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ display: 'block', marginBottom: '0.15rem' }}>Payment Gateway Notice</strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {successMessage && (
          <div
            className="editorial-alert alert-success"
            style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderRadius: '4px', background: '#F0FFF4', border: '1px solid #C6F6D5', color: '#276749', fontSize: '0.875rem' }}
          >
            <Check size={18} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            margin: '1.5rem 0',
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
                  borderRadius: '6px',
                  padding: '1.5rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  boxShadow: isPopular ? '0 8px 24px rgba(0, 71, 255, 0.08)' : 'none',
                }}
              >
                {plan.badge && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-10px',
                      right: '16px',
                      background: isPopular ? 'var(--color-cobalt)' : 'var(--color-ink)',
                      color: '#ffffff',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '999px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-ink)' }}>
                      {plan.name}
                    </h3>
                  </div>

                  <div style={{ margin: '0.75rem 0 0.5rem 0' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'var(--font-sans)' }}>
                      &#8377;{plan.amount}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-ink-muted)', marginLeft: '0.35rem' }}>
                      INR / one-time
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--color-cobalt)',
                      background: 'var(--color-cobalt-soft)',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '4px',
                      marginBottom: '1rem',
                    }}
                  >
                    <Sparkles size={13} />
                    <span>{plan.credits.toLocaleString()} Credits</span>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--color-ink-muted)', lineHeight: 1.45, minHeight: '48px' }}>
                    {plan.description}
                  </p>
                </div>

                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-ink-border)' }}>
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={Boolean(processingPlanId)}
                    className={isPopular ? 'btn-editorial btn-cobalt' : 'btn-editorial btn-editorial-primary'}
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      fontWeight: 600,
                      padding: '0.65rem 1rem',
                      cursor: processingPlanId ? 'not-allowed' : 'pointer',
                      opacity: processingPlanId && !isProcessing ? 0.6 : 1,
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={14} className="spinning" />
                        <span>Opening Razorpay...</span>
                      </>
                    ) : (
                      <span>Acquire for &#8377;{plan.amount}</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            padding: '0.75rem 1rem',
            background: 'var(--color-paper-muted)',
            border: '1px solid var(--color-ink-border)',
            borderRadius: '4px',
            fontSize: '0.78rem',
            color: 'var(--color-ink-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <span>Secured via Razorpay API &bull; UPI, Cards &amp; NetBanking accepted</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>Instant Ledger Credit</span>
        </div>
      </div>
    </div>
  </div>
  );
};
