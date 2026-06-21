import type { ScaleMapItem } from '@fretsensei/utils';

interface ScaleMapProps {
  items: ScaleMapItem[];
  embedded?: boolean;
}

export function ScaleMap({ items, embedded = false }: ScaleMapProps) {
  return (
    <aside
      className={`scale-map-card${embedded ? ' scale-map-card-embedded' : ''}`}
      aria-label="Scale interval and note map"
    >
      <div className="scale-map-layout">
        <p className="scale-map-label">
          <span>Scale</span>
          <span>map</span>
        </p>
        <div className="scale-map">
          {items.map((item) => (
            <div
              key={`${item.degree}-${item.noteName}`}
              className={`scale-map-item${item.isBlueNote ? ' blue-note-item' : ''}`}
            >
              <span className="scale-map-degree">{item.degree}</span>
              <span className="scale-map-note">{item.noteName}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
