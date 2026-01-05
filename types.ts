
export interface BrandDNA {
  candidateName: string;
  party: string;
  personality: string;
  competitiveEdge: string;
  targetVoters: string;
  coreMessage: string;
  slogan: string;
  sloganOptions?: string[];
  district: string;
  electionLevel: string;
  strategicTriangle?: {
    voterPainPoints: string;
    competitorWeakness: string;
    candidateStrengths: string;
  };
  lastUpdated?: string;
}

export interface IssueAlignment {
  title: string;      // 限制 10 字
  description: string; // 限制 30 字
  ourStance: string;   // 同黨立場
  opposingStance: string; // 反方立場
  pitch: string;       // 戰鬥金句
  riskLevel: 'high' | 'medium' | 'low';
}

export interface PartyBriefing {
  issues: IssueAlignment[]; // 固定 3 個
  overallAdvice: string;
  nextStep: {
    action: string;
    channel: string;
  };
  lastUpdated?: string;
}

export interface ScheduleEvent {
  id: string;
  time: string;
  title: string;
  location: string;
  type: 'speech' | 'visit' | 'meeting' | 'social';
  description: string;
}

export interface Asset {
  id: string;
  title: string;
  content: string;
  category: 'inspiration' | 'speech' | 'strategy';
  date: string;
}
