import React from 'react';
import { Sliders, Cpu, Sparkles } from 'lucide-react';

export const EditorialIntro: React.FC = () => {
  return (
    <section className="studio-intro" aria-label="Studio Introduction">
      <div className="intro-pretitle">IMAGE SYNTHESIS WORKSPACE</div>
      <h1 className="intro-headline">
        An editorial canvas for deliberate image-making.
      </h1>
      <p className="intro-description">
        Imagify connects descriptive natural language prompts directly to latent diffusion synthesis.
        Formulate precise architectural, botanical or figurative compositions, inspect full-resolution
        rasters, and maintain a lightweight session record of your iterations.
      </p>

      <div className="intro-meta">
        <div className="intro-meta-item">
          <Cpu size={13} color="var(--color-cobalt)" />
          <span>SYNTHESIS PIPELINE: CLIPDROP LATENT DIFFUSION</span>
        </div>
        <div className="intro-meta-item">
          <Sliders size={13} />
          <span>PRECISION PROMPT CEILING: 1,000 CHARACTERS</span>
        </div>
        <div className="intro-meta-item">
          <Sparkles size={13} />
          <span>INITIAL ALLOTMENT: 5 CREDITS / ACCOUNT</span>
        </div>
      </div>
    </section>
  );
};
