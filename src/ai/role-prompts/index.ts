import { RoleId } from '@/engine/roles';

import { RolePromptConfig } from './types';
import { ROLE_PROMPT_CONFIGS_ZH } from './zh';

export type { RolePromptConfig } from './types';

export function getRolePromptConfigs(): Record<RoleId, RolePromptConfig> {
  return ROLE_PROMPT_CONFIGS_ZH;
}
