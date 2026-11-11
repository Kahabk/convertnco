import { useState } from 'react';
import type { ImpactEffortItem } from './types';

export default function CROImpactEffortMatrix({ items = [] }: { items?: ImpactEffortItem[] }) {
  const [selected, setSelected] = useState<ImpactEffortItem | null>(items[0] || null);
  if (!items.length) return <p className="croVizEmpty">No evidence-backed recommendations were available to prioritize.</p>;
  const x = (item: ImpactEffortItem) => 10 + (item.effort / 10) * 80;
  const y = (item: ImpactEffortItem) => 90 - (item.impact / 10) * 80;
  return <div className="croMatrix">
    <svg viewBox="0 0 100 100" className="croMatrixSvg" role="img" aria-label="Impact versus effort prioritization matrix">
      <rect x="10" y="10" width="40" height="40" className="croMatrixQuick" /><rect x="50" y="10" width="40" height="40" className="croMatrixStrategic" />
      <rect x="10" y="50" width="40" height="40" className="croMatrixMinor" /><rect x="50" y="50" width="40" height="40" className="croMatrixLow" />
      <path d="M10 10V90H90M50 10V90M10 50H90" className="croMatrixLines" />
      <text x="12" y="15" className="croMatrixZone">Quick wins</text><text x="52" y="15" className="croMatrixZone">Strategic</text><text x="12" y="86" className="croMatrixZone">Minor</text><text x="52" y="86" className="croMatrixZone">Low priority</text>
      <text x="50" y="98" textAnchor="middle" className="croMatrixAxisLabel">Implementation effort →</text><text x="4" y="50" textAnchor="middle" className="croMatrixAxisLabel" transform="rotate(-90 4 50)">Expected impact →</text>
      {items.map((item) => <circle key={item.id} cx={x(item)} cy={y(item)} r="2.5" className="croMatrixPoint" tabIndex={0} role="button" aria-label={`${item.title}; impact ${item.impact}, effort ${item.effort}`} onClick={() => setSelected(item)} onFocus={() => setSelected(item)} />)}
    </svg>
    {selected && <div className="croVizDetail"><b>{selected.title}</b><p><small>{selected.category} · {selected.severity} · Estimated impact {selected.impact}/10 · Effort {selected.effort}/10{selected.confidence != null ? ` · ${Math.round(selected.confidence * 100)}% confidence` : ''}</small></p><p>{selected.evidence}</p><p><small>Recommended: {selected.recommendation}</small></p></div>}
    <p className="croVizNote">Impact is an AI-estimated potential, not a guaranteed or measured conversion increase.</p>
  </div>;
}
