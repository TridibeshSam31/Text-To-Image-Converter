import React, { useState, useEffect } from 'react';
import {
  Download,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import type { CanvasState, GeneratedImage, GenerationError } from '../types';

interface CanvasProps {
  state: CanvasState;
  currentImage: GeneratedImage | null;
  error: GenerationError | null;
  onRetry: () => void;
  onGenerateAgain: () => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  state,
  currentImage,
  error,
  onRetry,
  onGenerateAgain,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Timer during loading state
  useEffect(() => {
    let timer: number;
    if (state === 'loading') {
      setElapsedSeconds(0);
      timer = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [state]);

  const handleCopyPrompt = async () => {
    if (!currentImage?.prompt) return;
    try {
      await navigator.clipboard.writeText(currentImage.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadImage = () => {
    if (!currentImage?.imageUrl) return;
    const link = document.createElement('a');
    link.href = currentImage.imageUrl;
    const sanitizedPrompt = currentImage.prompt
      .slice(0, 30)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .toLowerCase();
    link.download = `imagify_${sanitizedPrompt}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`canvas-wrapper ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      {/* Canvas Top Bar */}
      <div className="canvas-toolbar">
        <div className="canvas-status-tag">
          <span>CANVAS VIEWPORT</span>
          <span style={{ color: 'var(--color-ink-faint)' }}>//</span>
          <span>
            {state === 'empty' && 'IDLE'}
            {state === 'loading' && 'PROCESSING'}
            {state === 'success' && 'SYNTHESIS COMPLETE'}
            {state === 'error' && 'DISPATCH FAILED'}
          </span>
        </div>

        {state === 'success' && currentImage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)' }}>
              {new Date(currentImage.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="btn-editorial"
              title={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}
              style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }}
            >
              {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          </div>
        )}
      </div>

      {/* Main Viewport */}
      <div className="canvas-main-viewport">
        {/* State 1: Empty Canvas */}
        {state === 'empty' && (
          <div className="canvas-empty-state">
            <div className="canvas-frame-marks">
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>
                1:1 ASPECT
              </span>
            </div>
            <h2 className="empty-title">Studio Canvas Awaiting Dispatch</h2>
            <p className="empty-desc">
              Compose a prompt in the specification panel on the left or select an editorial
              curation. Your synthesized raster will be developed directly in this viewport.
            </p>
          </div>
        )}

        {/* State 2: Loading State */}
        {state === 'loading' && (
          <div className="canvas-loading-state">
            <div className="loading-graphic">
              <div className="scan-laser" />
              <div className="loading-timer">{elapsedSeconds}s</div>
            </div>
            <div className="loading-stage-text">
              {elapsedSeconds < 3 && 'Validating Studio Credentials & Prompt...'}
              {elapsedSeconds >= 3 && elapsedSeconds < 10 && 'Dispatching Request to Latent Diffusion Pipeline...'}
              {elapsedSeconds >= 10 && elapsedSeconds < 30 && 'Synthesizing Image Array Buffer...'}
              {elapsedSeconds >= 30 && 'Awaiting Response Delivery from Server...'}
            </div>
            <p className="loading-note">
              High-resolution diffusion synthesis typically takes 10 to 30 seconds.
            </p>
          </div>
        )}

        {/* State 3: Success Render */}
        {state === 'success' && currentImage && (
          <div className="canvas-success-state animate-fade-in">
            <div className="image-container">
              <img
                src={currentImage.imageUrl}
                alt={currentImage.prompt}
                className="rendered-artwork"
              />
            </div>

            <div className="artwork-actions-bar">
              <div className="artwork-meta-stamp" title={currentImage.prompt}>
                PROMPT: &ldquo;
                {currentImage.prompt.length > 70
                  ? `${currentImage.prompt.slice(0, 70)}...`
                  : currentImage.prompt}
                &rdquo;
              </div>

              <div className="artwork-button-group">
                <button
                  onClick={handleCopyPrompt}
                  className="btn-editorial"
                  title="Copy Prompt to Clipboard"
                >
                  {copied ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy Prompt'}</span>
                </button>

                <button
                  onClick={onGenerateAgain}
                  className="btn-editorial"
                  title="Generate another variation with current prompt"
                >
                  <RefreshCw size={14} />
                  <span>Generate Again</span>
                </button>

                <button
                  onClick={handleDownloadImage}
                  className="btn-editorial btn-editorial-primary"
                  title="Download Image to Disk"
                >
                  <Download size={14} />
                  <span>Download PNG</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* State 4: Error State */}
        {state === 'error' && error && (
          <div className="canvas-error-state animate-fade-in">
            <div className="error-header-row">
              <AlertTriangle size={18} />
              <span>{error.title || 'Synthesis Dispatch Unsuccessful'}</span>
            </div>

            <p className="error-message-text">{error.message}</p>

            {error.details && (
              <div className="error-technical-box">
                <div style={{ color: 'var(--color-ink-muted)', marginBottom: 4 }}>
                  TECHNICAL TELEMETRY:
                </div>
                {error.details}
              </div>
            )}

            <div className="error-actions-row">
              <button onClick={onRetry} className="btn-editorial btn-cobalt">
                <RefreshCw size={14} />
                <span>Retry Dispatch</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
