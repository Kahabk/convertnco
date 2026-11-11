import { useMemo, useState } from 'react';
import type { RadarDimension } from './types';

export default function CRORadarChart({ dimensions = [] }: { dimensions?: RadarDimension[] }) {
  const [selected, setSelected] = useState<RadarDimension | null>(dimensions[0] || null);
  const points = useMemo(() => dimensions.map((dimension, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / dimensions.length;
    const r = 39 * (dimension.score / 100);
    return `${50 + Math.cos(angle) * r},${50 + Math.sin(angle) * r}`;
  }).join(' '), [dimensions]);

  if (!dimensions.length) return <p className="croVizEmpty">No evidence-backed category scores were returned for this audit.</p>;
  const axis = (index: number, radius: number) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / dimensions.length;
    return [50 + Math.cos(angle) * radius, 50 + Math.sin(angle) * radius];
  };

  return <div className="croRadar">
    <svg className="croRadarSvg" viewBox="-14 -14 128 128" role="img" aria-label="CRO quality radar chart">
      {[20, 40, 60, 80].map((radius) => <polygon key={radius} points={dimensions.map((_, i) => axis(i, radius).join(',')).join(' ')} className="croRadarGrid" />)}
      {dimensions.map((dimension, index) => {
        const [x, y] = axis(index, 44);
        const [dx, dy] = axis(index, 39 * (dimension.score / 100));
        return <g key={dimension.name}>
          <line x1="50" y1="50" x2={x} y2={y} className="croRadarAxis" />
          <circle className="croRadarPoint" cx={dx} cy={dy} r="1.7" tabIndex={0} role="button" aria-label={`${dimension.name}: ${dimension.score} out of 100`} onClick={() => setSelected(dimension)} onFocus={() => setSelected(dimension)} />
          <text x={x} y={y} className="croRadarLabel" textAnchor={x < 43 ? 'end' : x > 57 ? 'start' : 'middle'} dominantBaseline={y < 43 ? 'auto' : 'hanging'}>{dimension.name}</text>
        </g>;
      })}
      <polygon points={points} className="croRadarArea" />
    </svg>
    {selected && <div className="croVizDetail"><b>{selected.name} · {selected.score}/100</b><p>{selected.reason}</p>{selected.confidence != null && <small>AI confidence: {Math.round(selected.confidence * 100)}%</small>}</div>}
  </div>;
}
