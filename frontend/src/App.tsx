import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { EditorialIntro } from './components/EditorialIntro';
import { PromptEditor } from './components/PromptEditor';
import { Canvas } from './components/Canvas';
import { SessionGallery } from './components/SessionGallery';
import { AuthModal } from './components/AuthModal';
import type { CanvasState, GeneratedImage, GenerationError } from './types';
import { generateImageApi } from './services/api';
import './App.css';

const GALLERY_STORAGE_KEY = 'imagify_session_gallery';

export const App: React.FC = () => {
  const { token, isAuthenticated, refreshCredits } = useAuth();

  // View state: 'landing' or 'studio'
  const [currentView, setCurrentView] = useState<'landing' | 'studio'>(() => {
    return window.location.hash === '#studio' ? 'studio' : 'landing';
  });

  const [prompt, setPrompt] = useState<string>('');
  const [canvasState, setCanvasState] = useState<CanvasState>('empty');
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [generationError, setGenerationError] = useState<GenerationError | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Session-level gallery
  const [history, setHistory] = useState<GeneratedImage[]>(() => {
    try {
      const saved = localStorage.getItem(GALLERY_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // Sync hash with current view
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#studio') {
        setCurrentView('studio');
      } else {
        setCurrentView('landing');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(history));
    } catch {
      // ignore storage limits
    }
  }, [history]);

  const handleNavigate = (view: 'landing' | 'studio') => {
    setCurrentView(view);
    window.location.hash = view === 'studio' ? '#studio' : '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEnterStudio = () => {
    handleNavigate('studio');
  };

  const handleSelectPromptAndEnter = (samplePrompt: string) => {
    setPrompt(samplePrompt);
    handleNavigate('studio');
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    if (!isAuthenticated || !token) {
      setAuthModalOpen(true);
      return;
    }

    setIsGenerating(true);
    setCanvasState('loading');
    setGenerationError(null);

    const activePrompt = prompt.trim();

    try {
      const response = await generateImageApi(activePrompt, token);

      const isSuccess = response.sucess === true || response.success === true;

      if (isSuccess && response.resultImage) {
        const newImage: GeneratedImage = {
          id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          prompt: activePrompt,
          imageUrl: response.resultImage,
          timestamp: Date.now(),
        };

        setCurrentImage(newImage);
        setHistory((prev) => [newImage, ...prev]);
        setCanvasState('success');
        refreshCredits();
      } else {
        // Backend returned failure or missing image
        setCanvasState('error');
        setGenerationError({
          title: 'Synthesis Dispatch Failure',
          message:
            response.message ||
            'The backend completed the request but did not return a valid resultImage.',
        });
      }
    } catch (err: unknown) {
      const error = err as Error;
      setCanvasState('error');
      setGenerationError({
        title: 'Communication / Pipeline Error',
        message: error.message || 'An unexpected error occurred during synthesis dispatch.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectHistoryImage = (img: GeneratedImage) => {
    setCurrentImage(img);
    setPrompt(img.prompt);
    setCanvasState('success');
    window.scrollTo({ top: 320, behavior: 'smooth' });
  };

  return (
    <div className="imagify-app">
      <Header
        onOpenAuth={() => setAuthModalOpen(true)}
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      <main className="studio-container">
        {currentView === 'landing' ? (
          <LandingPage
            onEnterStudio={handleEnterStudio}
            onSelectPromptAndEnter={handleSelectPromptAndEnter}
            onOpenAuth={() => setAuthModalOpen(true)}
            isAuthenticated={isAuthenticated}
          />
        ) : (
          <div className="animate-fade-in">
            <EditorialIntro />

            <div className="studio-workspace">
              <PromptEditor
                prompt={prompt}
                setPrompt={setPrompt}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                onOpenAuth={() => setAuthModalOpen(true)}
                isAuthenticated={isAuthenticated}
              />

              <Canvas
                state={canvasState}
                currentImage={currentImage}
                error={generationError}
                onRetry={handleGenerate}
                onGenerateAgain={handleGenerate}
              />
            </div>

            <SessionGallery
              history={history}
              onSelectImage={handleSelectHistoryImage}
              activeImageId={currentImage?.id}
            />
          </div>
        )}
      </main>

      <footer
        style={{
          borderTop: 'var(--border-fine)',
          padding: '2rem 1.5rem',
          marginTop: 'auto',
          background: 'var(--color-paper-light)',
        }}
      >
        <div
          style={{
            maxWidth: 'var(--max-content-width)',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: 'var(--color-ink-muted)',
          }}
        >
          <div>
            <span>IMAGIFY STUDIO &copy; {new Date().getFullYear()}</span>
            <span style={{ margin: '0 0.5rem' }}>//</span>
            <span>EDITORIAL TEXT-TO-IMAGE CONVERTER</span>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            {currentView === 'landing' ? (
              <button
                onClick={handleEnterStudio}
                style={{
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  color: 'var(--color-cobalt)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                Launch Studio Workspace &rarr;
              </button>
            ) : (
              <button
                onClick={() => handleNavigate('landing')}
                style={{
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  color: 'var(--color-ink-muted)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                &larr; Return to Overview
              </button>
            )}
            <span>STUDIO PIPELINE: CLIPDROP LATENT DIFFUSION</span>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
};

export default App;
