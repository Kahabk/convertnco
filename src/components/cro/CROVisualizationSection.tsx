import type { CROVisualizations } from './types';
import CRORadarChart from './CRORadarChart';
import CROAttentionHeatmap from './CROAttentionHeatmap';
import CROImpactEffortMatrix from './CROImpactEffortMatrix';
import './CROVisualizations.css';

type Props = { visualizations?: CROVisualizations; desktopUrl?: string | null; mobileUrl?: string | null };
export default function CROVisualizationSection({ visualizations, desktopUrl, mobileUrl }: Props) {
  if (!visualizations) return null;
  return <section className="croVisualizations" aria-label="AI CRO visualizations">
    <div className="croVisualizationHeading"><span>AI visual analysis</span><p>Evidence-based visualizations generated from this page’s content and captured screenshots.</p></div>
    <div className="croVizGrid">
      <article className="croVizCard"><h3>CRO quality profile</h3><p>Hover or select a dimension for the evidence behind its score.</p><CRORadarChart dimensions={visualizations.radar?.dimensions} /></article>
      <article className="croVizCard croVizCardWide"><h3>Predicted visual attention</h3><p>Review which visible areas compete for attention on the captured page.</p><CROAttentionHeatmap desktopUrl={desktopUrl} mobileUrl={mobileUrl} desktop={visualizations.attentionHeatmap?.desktop} mobile={visualizations.attentionHeatmap?.mobile} /></article>
      <article className="croVizCard croVizCardWide"><h3>Impact vs. effort</h3><p>Select a recommendation to understand the evidence and proposed fix.</p><CROImpactEffortMatrix items={visualizations.impactEffort?.items} /></article>
    </div>
  </section>;
}
