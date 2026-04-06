import { RoleId } from '@/engine/roles';

export interface BuiltInSpeech {
  id: string;
  template: string; // use {player} for player name placeholder, {role} for role
  category: 'claim' | 'accuse' | 'defend' | 'generic';
}

const ROLE_SPEECHES: Record<RoleId, BuiltInSpeech[]> = {
  werewolf: [
    { id: 'ww_claim_villager', template: "I'm a Villager, nothing happened to me last night.", category: 'claim' },
    { id: 'ww_claim_seer', template: "I'm the Seer. I checked {player} and they're a Werewolf.", category: 'claim' },
    { id: 'ww_accuse', template: "I think {player} is acting really suspicious.", category: 'accuse' },
    { id: 'ww_deflect', template: "Why is everyone looking at me? I'm just a villager.", category: 'defend' },
    { id: 'ww_pressure', template: "{player}, what's your role? You've been awfully quiet.", category: 'accuse' },
  ],
  seer: [
    { id: 'seer_reveal_player', template: "I'm the Seer. I checked {player} — they're the {role}.", category: 'claim' },
    { id: 'seer_reveal_center', template: "I'm the Seer. I looked at two center cards and saw {role}.", category: 'claim' },
    { id: 'seer_accuse', template: "Based on what I saw, {player} is definitely suspicious.", category: 'accuse' },
    { id: 'seer_trust', template: "I can confirm {player} is safe.", category: 'defend' },
  ],
  robber: [
    { id: 'rob_reveal', template: "I'm the Robber. I swapped with {player} and I'm now the {role}.", category: 'claim' },
    { id: 'rob_hide', template: "I didn't do anything special last night.", category: 'claim' },
    { id: 'rob_accuse', template: "I know what {player} was — they should be worried.", category: 'accuse' },
    { id: 'rob_safe', template: "I can vouch for myself. I swapped and I know I'm village team.", category: 'defend' },
  ],
  troublemaker: [
    { id: 'tm_reveal', template: "I'm the Troublemaker. I swapped {player} and {player}.", category: 'claim' },
    { id: 'tm_warn', template: "Careful — some of you might not be who you think you are.", category: 'generic' },
    { id: 'tm_hide', template: "I'm just a regular villager, nothing to report.", category: 'claim' },
    { id: 'tm_accuse', template: "I swapped cards around. {player}, you might want to rethink your claim.", category: 'accuse' },
  ],
  villager: [
    { id: 'vil_claim', template: "I'm a Villager. I've got nothing from last night.", category: 'claim' },
    { id: 'vil_listen', template: "Let's hear from everyone before we decide.", category: 'generic' },
    { id: 'vil_suspect', template: "I don't trust {player}. Something feels off.", category: 'accuse' },
    { id: 'vil_defend', template: "I'm just a villager, no reason to suspect me.", category: 'defend' },
    { id: 'vil_vote', template: "I'm voting for {player}. Who's with me?", category: 'accuse' },
  ],
  insomniac: [
    { id: 'ins_same', template: "I'm the Insomniac. I checked my card — I'm still the Insomniac.", category: 'claim' },
    { id: 'ins_changed', template: "I'm the Insomniac and my role changed! Someone swapped me.", category: 'claim' },
    { id: 'ins_accuse', template: "Someone messed with my card. {player}, was that you?", category: 'accuse' },
    { id: 'ins_confirm', template: "Nobody touched my card, so I can confirm the Troublemaker didn't swap me.", category: 'defend' },
  ],
  drunk: [
    { id: 'drk_claim', template: "I'm the Drunk. I swapped with a center card but I don't know what I am now.", category: 'claim' },
    { id: 'drk_worry', template: "I might be a Werewolf now for all I know...", category: 'generic' },
    { id: 'drk_accuse', template: "Since I don't know my role, let's focus on {player}.", category: 'accuse' },
  ],
  hunter: [
    { id: 'hnt_warn', template: "I'm the Hunter. If you vote me out, whoever I'm pointing at dies too.", category: 'claim' },
    { id: 'hnt_target', template: "Just so everyone knows, I'm aiming at {player}.", category: 'accuse' },
    { id: 'hnt_defend', template: "Killing me is risky — think carefully about who I'll take down.", category: 'defend' },
  ],
  tanner: [
    { id: 'tan_fake_ww', template: "Fine, I'll admit it... I'm the Werewolf.", category: 'claim' },
    { id: 'tan_sus', template: "I've been caught, haven't I? Go ahead, vote for me.", category: 'defend' },
    { id: 'tan_deflect', template: "Actually, {player} is way more suspicious than me.", category: 'accuse' },
  ],
  minion: [
    { id: 'min_claim', template: "I'm a Villager. Let's find those werewolves!", category: 'claim' },
    { id: 'min_protect', template: "I think {player} is innocent. We should look elsewhere.", category: 'defend' },
    { id: 'min_redirect', template: "Has anyone considered that {player} might be the real threat?", category: 'accuse' },
  ],
  mason: [
    { id: 'msn_claim', template: "I'm a Mason. I can confirm {player} is the other Mason.", category: 'claim' },
    { id: 'msn_solo', template: "I'm a Mason but I didn't see another Mason. One must be in the center.", category: 'claim' },
    { id: 'msn_vouch', template: "I can vouch for {player} — we're both Masons.", category: 'defend' },
  ],
  doppelganger: [
    { id: 'dop_claim', template: "I copied someone's role last night. I'm now acting as {role}.", category: 'claim' },
    { id: 'dop_hide', template: "I'm just a regular villager.", category: 'claim' },
    { id: 'dop_accuse', template: "I know what {player} started as. They should explain themselves.", category: 'accuse' },
  ],
};

const UNIVERSAL_SPEECHES: BuiltInSpeech[] = [
  { id: 'uni_who_ww', template: "Who do you think the werewolves are?", category: 'generic' },
  { id: 'uni_quiet', template: "{player}, you're being really quiet. What's your role?", category: 'accuse' },
  { id: 'uni_vote_call', template: "I think we should vote for {player}.", category: 'accuse' },
  { id: 'uni_no_kill', template: "Maybe nobody is a werewolf. Should we all vote for the same person to spread votes?", category: 'generic' },
];

export function getBuiltInSpeeches(role: RoleId): BuiltInSpeech[] {
  return [...(ROLE_SPEECHES[role] || []), ...UNIVERSAL_SPEECHES];
}

export function fillTemplate(
  template: string,
  playerNames: string[],
  roleName?: string
): string {
  let result = template;
  // Replace {player} placeholders with actual names
  const playerPlaceholders = result.match(/\{player\}/g) || [];
  const shuffled = [...playerNames].sort(() => Math.random() - 0.5);
  playerPlaceholders.forEach((_, i) => {
    result = result.replace('{player}', shuffled[i % shuffled.length]);
  });
  if (roleName) {
    result = result.replace(/\{role\}/g, roleName);
  }
  return result;
}
