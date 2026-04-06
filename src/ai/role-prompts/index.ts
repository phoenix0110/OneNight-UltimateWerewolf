import { RoleId } from '@/engine/roles';

import { doppelgangerPrompt } from './doppelganger';
import { drunkPrompt } from './drunk';
import { hunterPrompt } from './hunter';
import { insomniacPrompt } from './insomniac';
import { masonPrompt } from './mason';
import { minionPrompt } from './minion';
import { robberPrompt } from './robber';
import { seerPrompt } from './seer';
import { tannerPrompt } from './tanner';
import { troublemakerPrompt } from './troublemaker';
import { RolePromptConfig } from './types';
import { villagerPrompt } from './villager';
import { werewolfPrompt } from './werewolf';

export type { RolePromptConfig } from './types';

export const ROLE_PROMPT_CONFIGS: Record<RoleId, RolePromptConfig> = {
  doppelganger: doppelgangerPrompt,
  drunk: drunkPrompt,
  hunter: hunterPrompt,
  insomniac: insomniacPrompt,
  mason: masonPrompt,
  minion: minionPrompt,
  robber: robberPrompt,
  seer: seerPrompt,
  tanner: tannerPrompt,
  troublemaker: troublemakerPrompt,
  villager: villagerPrompt,
  werewolf: werewolfPrompt,
};
