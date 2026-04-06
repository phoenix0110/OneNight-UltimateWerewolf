import { RoleId } from './roles';

export const DEFAULT_ROLE_CONFIGS: Record<number, RoleId[]> = {
  5: [
    'werewolf', 'werewolf', 'seer', 'robber', 'troublemaker',
    'villager', 'villager', 'insomniac',
  ],
  6: [
    'werewolf', 'werewolf', 'seer', 'robber', 'troublemaker',
    'villager', 'villager', 'drunk', 'insomniac',
  ],
  7: [
    'werewolf', 'werewolf', 'minion', 'seer', 'robber',
    'troublemaker', 'villager', 'drunk', 'insomniac', 'hunter',
  ],
  8: [
    'werewolf', 'werewolf', 'minion', 'seer', 'robber',
    'troublemaker', 'villager', 'villager', 'drunk', 'insomniac', 'tanner',
  ],
};
