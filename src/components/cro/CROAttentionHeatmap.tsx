import { useMemo, useState } from 'react';
import type { HeatmapAnnotation, HeatmapData } from './types';

type Props = { desktopUrl?: string | null; mobileUrl?: string | null; desktop?: HeatmapData; mobile?: HeatmapData };
export default function CROAttentionHeatmap({ desktopUrl, mobileUrl, desktop, mobile }: Props) {
  const available = useMemo(() => [desktopUrl && desktop ? 'desktop' : null, mobileUrl && mobile ? 'mobile' : null].filter(Boolean) as ('desktop' | 'mobile')[], [desktopUrl, desktop, mobileUrl, mobile]);
  const [device, setDevice] = useState<'desktop' | 'mobile'>(available[0] || 'desktop');
  const [visible, setVisible] = useState(true);
  const data = device === 'desktop' ? desktop : mobile;
  const image = device === 'desktop' ? desktopUrl : mobileUrl;
  const [selected, setSelected] = useState<HeatmapAnnotation | null>(null);

  if (!available.length || !data || !image) return <p className="croVizEmpty">A screenshot and AI annotations are needed before visual attention can be shown.</p>;
  return <div className="croHeatmap">
    <div className="croVizControls">
      <div>{available.map((item) => <button type="button" className={device === item ? 'isActive' : ''} onClick={() => { setDevice(item); setSelected(null); }} key={item}>{item}</button>)}</div>
      <button type="button" className="croVizToggle" aria-pressed={visible} onClick={() => setVisible((value) => !value)}>{visible ? 'Hide overlay' : 'Show overlay'}</button>
    </div>
    <div className={`croHeatmapCanvas ${device}`}>
      <img src={image} alt={`${device} website screenshot`} />
      {visible && <svg viewBox={`0 0 ${data.imageWidth} ${data.imageHeight}`} role="img" aria-label="AI-predicted visual attention overlay">
        <defs><radialGradient id="attention-glow"><stop stopColor="#ffffff" stopOpacity=".45" /><stop offset="1" stopColor="#ffffff" stopOpacity="0" /></radialGradient></defs>
        {data.annotations.map((annotation) => <g key={annotation.id} tabIndex={0} role="button" aria-label={annotation.issue} onClick={() => setSelected(annotation)} onFocus={() => setSelected(annotation)}>
          <ellipse cx={annotation.x + annotation.width / 2} cy={annotation.y + annotation.height / 2} rx={annotation.width * .7} ry={annotation.height * .7} fill="url(#attention-glow)" opacity={(annotation.prominence || 50) / 100} />
          <rect x={annotation.x} y={annotation.y} width={annotation.width} height={annotation.height} className="croHeatmapRegion" />
        </g>)}
      </svg>}
    </div>
    <p className="croVizNote">AI-predicted visual prominence based on this screenshot. It is not visitor eye-tracking data.</p>
    {selected && <div className="croVizDetail"><b>{selected.issue}</b><p>{selected.reason}</p>{selected.evidence && <p><small>Evidence: {selected.evidence}</small></p>}{selected.recommendation && <p><small>Recommended: {selected.recommendation}</small></p>}</div>}
  </div>;
}
