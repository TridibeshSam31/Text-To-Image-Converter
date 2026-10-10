import type { GeneratedImage } from '../types';
import { Download } from 'lucide-react';

interface SessionGalleryProps {
  history: GeneratedImage[];
  onSelectImage: (image: GeneratedImage) => void;
  activeImageId?: string;
}

export const SessionGallery: React.FC<SessionGalleryProps> = ({
  history,
  onSelectImage,
  activeImageId,
}) => {
  if (history.length === 0) {
    return null;
  }

  const handleDownload = (e: React.MouseEvent, item: GeneratedImage) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = item.imageUrl;
    const cleanPrompt = item.prompt.slice(0, 24).replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `imagify_${cleanPrompt}_${item.timestamp}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="history-section" aria-label="Session History">
      <div className="history-header-row">
        <h2 className="history-title">Session Gallery</h2>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-ink-muted)' }}>
          {history.length} {history.length === 1 ? 'PIECE' : 'PIECES'} RENDERED IN SESSION
        </span>
      </div>

      <div className="history-grid">
        {history.map((item) => {
          const isActive = item.id === activeImageId;
          return (
            <div
              key={item.id}
              className="history-item-card"
              style={{
                borderColor: isActive ? 'var(--color-cobalt)' : undefined,
                boxShadow: isActive ? '0 0 0 1px var(--color-cobalt)' : undefined,
              }}
              onClick={() => onSelectImage(item)}
              role="button"
              tabIndex={0}
              aria-label={`View rendered image for prompt: ${item.prompt}`}
            >
              <div className="history-thumb-wrap">
                <img src={item.imageUrl} alt={item.prompt} className="history-thumb" />
              </div>

              <div className="history-item-info">
                <p className="history-item-prompt" title={item.prompt}>
                  {item.prompt}
                </p>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '0.25rem',
                  }}
                >
                  <span className="history-item-date">
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  <button
                    onClick={(e) => handleDownload(e, item)}
                    title="Download this rendering"
                    style={{
                      color: 'var(--color-ink-muted)',
                      padding: 2,
                    }}
                  >
                    <Download size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
