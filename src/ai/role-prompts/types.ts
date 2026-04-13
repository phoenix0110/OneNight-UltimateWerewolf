export interface RolePromptConfig {
  role: string;
  identity: string;
  gameLogicConstraints?: string[];
  teamObjective: string;
  nightInfoUsage: string | Record<string, string>;
  strategy: Record<string, string | Record<string, string>>;
  speechGuidelines: string | Record<string, string>;
}
