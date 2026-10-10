import React from 'react';
import { ArrowRight, X, Sparkles, CornerDownLeft } from 'lucide-react';

interface ExamplePrompt {
  category: string;
  text: string;
}

const EXAMPLE_PROMPTS: ExamplePrompt[] = [
  {
    category: 'Architecture',
    text: 'Monolithic raw concrete pavilion in dense morning mist, water reflection, 35mm monochrome photography, harsh raking light.',
  },
  {
    category: 'Botanical',
    text: 'Detailed copperplate engraving of Alpine ferns and lichen, botanical archive specimen, parchment paper texture, fine hatching.',
  },
  {
    category: 'Still Life',
    text: 'Still life with quince, unglazed terracotta vessel, dried flax and folded linen, dark moody Dutch chiaroscuro lighting.',
  },
  {
    category: 'Portrait',
    text: 'Editorial medium portrait of an elderly watchmaker examining escapement gear with brass loupe, warm incandescent lamp, shallow depth of field.',
  },
];

interface PromptEditorProps {
  prompt: string;
  setPrompt: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  onOpenAuth: () => void;
  isAuthenticated: boolean;
}

const MAX_PROMPT_LENGTH = 1000;

export const PromptEditor: React.FC<PromptEditorProps> = ({
  prompt,
  setPrompt,
  onGenerate,
  isGenerating,
  onOpenAuth,
  isAuthenticated,
}) => {
  const charCount = prompt.length;
  const isOverLimit = charCount > MAX_PROMPT_LENGTH;
  const isNearLimit = charCount > MAX_PROMPT_LENGTH * 0.85;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isGenerating && prompt.trim() && !isOverLimit) {
        if (!isAuthenticated) {
          onOpenAuth();
        } else {
          onGenerate();
        }
      }
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleSelectExample = (exampleText: string) => {
    setPrompt(exampleText);
  };

  const handleClear = () => {
    setPrompt('');
  };

  const handleButtonClick = () => {
    if (!isAuthenticated) {
      onOpenAuth();
    } else {
      onGenerate();
    }
  };

  return (
    <div className="controls-panel">
      <div className="editor-card">
        <div className="card-header-row">
          <label htmlFor="prompt-input" className="card-label">
            PROMPT SPECIFICATION
          </label>
          <span
            className={`char-counter ${
              isOverLimit ? 'limit' : isNearLimit ? 'warning' : ''
            }`}
            aria-live="polite"
          >
            {charCount.toLocaleString()} / {MAX_PROMPT_LENGTH.toLocaleString()}
          </span>
        </div>

        <textarea
          id="prompt-input"
          className="prompt-textarea"
          placeholder="Describe your subject, lighting conditions, medium texture, optical characteristics, and spatial composition..."
          value={prompt}
          onChange={handlePromptChange}
          onKeyDown={handleKeyDown}
          disabled={isGenerating}
          rows={5}
          maxLength={MAX_PROMPT_LENGTH + 100} // allow slight overflow to trigger warning
        />

        <div className="prompt-actions-row">
          {prompt.length > 0 && (
            <button
              onClick={handleClear}
              className="btn-clear-prompt"
              type="button"
              disabled={isGenerating}
              title="Clear prompt text"
            >
              <X size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
              Clear text
            </button>
          )}

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-ink-faint)', fontFamily: 'var(--font-mono)' }}>
              Ctrl + ↵
            </span>
          </div>
        </div>

        <button
          onClick={handleButtonClick}
          disabled={isGenerating || (!prompt.trim() && isAuthenticated) || isOverLimit}
          className="btn-editorial btn-cobalt generate-button"
          type="button"
        >
          {isGenerating ? (
            <>
              <Sparkles size={16} />
              <span>Synthesizing Image...</span>
            </>
          ) : !isAuthenticated ? (
            <>
              <ArrowRight size={16} />
              <span>Sign In to Generate</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Generate Artwork</span>
              <CornerDownLeft size={14} style={{ opacity: 0.7 }} />
            </>
          )}
        </button>
      </div>

      {/* Curated Editorial Example Prompts */}
      <div className="examples-section">
        <div className="examples-header">STUDIO CURATED PROMPTS</div>
        <div className="examples-list">
          {EXAMPLE_PROMPTS.map((ex, idx) => (
            <button
              key={idx}
              className="example-prompt-item"
              onClick={() => handleSelectExample(ex.text)}
              type="button"
              disabled={isGenerating}
            >
              <span className="example-category">{ex.category}</span>
              <span>{ex.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
