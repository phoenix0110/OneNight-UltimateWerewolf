import { RoleId } from '@/engine/roles';

export interface RolePromptConfig {
  role: RoleId;
  identity: string;
  teamObjective: string;
  nightInfoUsage: string;
  strategy: {
    honestApproach: string;
    deceptiveApproach: string;
    decisionGuideline: string;
  };
  speechGuidelines: string;
}
