export type RadarDimension = { name: string; score: number; confidence?: number; reason: string };
export type HeatmapAnnotation = {
  id: string; x: number; y: number; width: number; height: number; prominence?: number;
  issue: string; reason: string; evidence?: string; recommendation?: string;
};
export type HeatmapData = { imageWidth: number; imageHeight: number; annotations: HeatmapAnnotation[] };
export type ImpactEffortItem = {
  id: string; title: string; category: string; severity: string; impact: number; effort: number;
  confidence?: number; evidence: string; recommendation: string;
};
export type CROVisualizations = {
  radar?: { dimensions?: RadarDimension[] };
  attentionHeatmap?: { desktop?: HeatmapData; mobile?: HeatmapData };
  impactEffort?: { items?: ImpactEffortItem[] };
};
