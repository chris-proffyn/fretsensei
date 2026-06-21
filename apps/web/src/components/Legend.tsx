export function Legend() {
  return (
    <div className="legend">
      <span className="legend-item">
        <span className="dot root" /> Root
      </span>
      <span className="legend-item">
        <span className="dot scale" /> In key
      </span>
      <span className="legend-item">
        <span className="dot scale legend-extended" /> Extended
      </span>
      <span className="legend-item">
        <span className="dot blue-note-dot" /> Blue note
      </span>
      <span className="legend-item">
        <span className="dot outside" /> Outside notes
      </span>
    </div>
  );
}
