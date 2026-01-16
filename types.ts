
export interface PlantHealthReport {
  plantName: string;
  condition: 'Healthy' | 'Diseased' | 'Stressed' | 'Unknown';
  diseaseName?: string;
  confidenceScore: number;
  symptoms: string[];
  causes: string[];
  treatment: {
    immediateActions: string[];
    longTermCare: string[];
    recommendedProducts?: string[];
  };
  prevention: string[];
  isContagious: boolean;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface GroundingSource {
  title?: string;
  uri: string;
}

export interface GroundingResult {
  text: string;
  sources: GroundingSource[];
}

export interface ScanHistoryItem {
  id: string;
  timestamp: number;
  image: string;
  report: PlantHealthReport;
  iconUrl?: string; // AI generated icon
  isFavorite?: boolean;
}
